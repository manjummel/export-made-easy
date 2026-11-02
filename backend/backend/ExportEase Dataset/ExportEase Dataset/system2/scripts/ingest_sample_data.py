#!/usr/bin/env python3
"""
ingest_sample_data.py — Seed the Qdrant knowledge store with sample export trade data

Usage:
    python scripts/ingest_sample_data.py
    python scripts/ingest_sample_data.py --collection exportease_knowledge
    python scripts/ingest_sample_data.py --base-url http://localhost:8100 --api-key changeme
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
import httpx
import typer
from rich.console import Console
from rich.table import Table
from rich import print as rprint

console = Console()
app = typer.Typer()

SAMPLE_DATA_DIR = Path(__file__).parent.parent / "data" / "sample"


def load_sample_file(filename: str) -> list[dict]:
    path = SAMPLE_DATA_DIR / filename
    if not path.exists():
        console.print(f"[red]Sample file not found: {path}[/red]")
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def format_hs_content(item: dict) -> str:
    parts = [f"HS Code {item['hs_code']}: {item['description']}"]
    if item.get("subheadings"):
        parts.append("\nSubheadings:")
        for sub in item["subheadings"]:
            parts.append(f"  {sub['code']}: {sub['description']}")
    if item.get("applicable_duties"):
        parts.append("\nApplicable Duties:")
        for country, duty in item["applicable_duties"].items():
            parts.append(f"  {country}: {duty}")
    if item.get("notes"):
        parts.append(f"\nNotes: {item['notes']}")
    return "\n".join(parts)


def format_agreement_content(item: dict) -> str:
    parts = [f"{item['title']}"]
    parts.append(f"Parties: {', '.join(item.get('parties', []))}")
    parts.append(f"Effective Date: {item.get('effective_date', 'TBD')}")
    parts.append(f"\nSummary: {item.get('summary', '')}")
    for provision in item.get("key_provisions", []):
        parts.append(f"\n{provision['clause']} — {provision['title']}")
        parts.append(provision["content"])
    return "\n".join(parts)


def format_regulation_content(reg: dict, section: dict) -> str:
    parts = [
        f"{reg['title']}",
        f"Authority: {reg['issuing_authority']}",
        f"Jurisdiction: {', '.join(reg.get('jurisdiction', []))}",
        f"Effective: {reg.get('effective_date', 'N/A')}",
        f"\n{section['title']}",
        section["content"],
    ]
    return "\n".join(parts)


@app.command()
def main(
    base_url: str = typer.Option("http://localhost:8100", help="System 2 base URL"),
    api_key: str = typer.Option("changeme-replace-in-production", help="API key"),
    collection: str = typer.Option("exportease_knowledge", help="Target collection"),
    dry_run: bool = typer.Option(False, help="Print payloads without ingesting"),
):
    """Seed the ExportEase knowledge store with sample trade data."""

    headers = {"X-API-Key": api_key, "Content-Type": "application/json"}
    client = httpx.Client(base_url=base_url, headers=headers, timeout=60)

    # Verify service is running
    if not dry_run:
        try:
            resp = client.get("/health")
            resp.raise_for_status()
            rprint(f"[green]✓ System 2 reachable at {base_url}[/green]")
        except Exception as exc:
            rprint(f"[red]✗ Cannot reach {base_url}: {exc}[/red]")
            rprint("[yellow]Tip: Start System 2 with: docker-compose up[/yellow]")
            sys.exit(1)

    results = []

    # --- Ingest HS Codes ---
    console.rule("[bold blue]Ingesting HS Codes")
    hs_codes = load_sample_file("hs_codes.json")
    for item in hs_codes:
        payload = {
            "content": format_hs_content(item),
            "metadata": {
                "document_type": "hs_code",
                "jurisdiction": item.get("jurisdiction", []),
                "effective_date": item.get("effective_date"),
                "tags": item.get("tags", []),
            },
            "collection": collection,
            "document_id": f"hs-{item['hs_code']}",
        }
        if dry_run:
            rprint(f"[dim][DRY RUN] Would ingest: HS Code {item['hs_code']}[/dim]")
            results.append({"type": "hs_code", "id": f"hs-{item['hs_code']}", "status": "dry_run"})
        else:
            try:
                resp = client.post("/v1/documents/ingest", json=payload)
                data = resp.json()
                status_emoji = "✓" if data.get("status") == "ingested" else "✗"
                rprint(f"[green]{status_emoji} HS {item['hs_code']}[/green] — {data.get('chunks_created', 0)} chunks")
                results.append({"type": "hs_code", "id": data.get("document_id"), "status": data.get("status")})
            except Exception as exc:
                rprint(f"[red]✗ HS {item['hs_code']}: {exc}[/red]")

    # --- Ingest Trade Agreements ---
    console.rule("[bold blue]Ingesting Trade Agreements")
    agreements = load_sample_file("trade_agreements.json")
    for item in agreements:
        payload = {
            "content": format_agreement_content(item),
            "metadata": {
                "document_type": "trade_agreement",
                "jurisdiction": item.get("parties", []),
                "effective_date": item.get("effective_date"),
                "tags": item.get("tags", []),
            },
            "collection": collection,
            "document_id": f"agreement-{item['agreement_id'].lower().replace(' ', '-')}",
        }
        if dry_run:
            rprint(f"[dim][DRY RUN] Would ingest: {item['agreement_id']}[/dim]")
        else:
            try:
                resp = client.post("/v1/documents/ingest", json=payload)
                data = resp.json()
                rprint(f"[green]✓ {item['agreement_id']}[/green] — {data.get('chunks_created', 0)} chunks")
                results.append({"type": "trade_agreement", "id": data.get("document_id"), "status": data.get("status")})
            except Exception as exc:
                rprint(f"[red]✗ {item['agreement_id']}: {exc}[/red]")

    # --- Ingest Regulations (section-by-section) ---
    console.rule("[bold blue]Ingesting Regulations")
    regulations = load_sample_file("regulations.json")
    for reg in regulations:
        for section in reg.get("sections", []):
            payload = {
                "content": format_regulation_content(reg, section),
                "metadata": {
                    "document_type": "regulation",
                    "jurisdiction": reg.get("jurisdiction", []),
                    "effective_date": reg.get("effective_date"),
                    "tags": reg.get("tags", []),
                },
                "collection": collection,
                "document_id": f"reg-{section['section_id'].lower()}",
            }
            if dry_run:
                rprint(f"[dim][DRY RUN] Would ingest: {section['section_id']}[/dim]")
            else:
                try:
                    resp = client.post("/v1/documents/ingest", json=payload)
                    data = resp.json()
                    rprint(f"[green]✓ {section['section_id']}[/green] — {data.get('chunks_created', 0)} chunks")
                    results.append({"type": "regulation", "id": data.get("document_id"), "status": data.get("status")})
                except Exception as exc:
                    rprint(f"[red]✗ {section['section_id']}: {exc}[/red]")

    # Summary table
    console.rule("[bold green]Ingestion Summary")
    table = Table(title="Sample Data Ingestion Results")
    table.add_column("Type", style="cyan")
    table.add_column("Document ID", style="blue")
    table.add_column("Status", style="green")
    for r in results:
        table.add_row(r["type"], r["id"] or "unknown", r["status"])
    console.print(table)
    rprint(f"\n[bold]Total: {len(results)} documents processed[/bold]")


if __name__ == "__main__":
    app()
