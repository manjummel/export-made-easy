#!/usr/bin/env python3
"""
check_connectivity.py — CLI to validate System 2 connectivity to all registered services.

Usage:
    python scripts/check_connectivity.py
    python scripts/check_connectivity.py --base-url http://localhost:8100
"""

from __future__ import annotations

import asyncio
import sys
import httpx
import typer
from rich.console import Console
from rich.table import Table
from rich import print as rprint

console = Console()
app = typer.Typer()


@app.command()
def main(
    base_url: str = typer.Option("http://localhost:8100", help="System 2 base URL"),
):
    """Check connectivity status of all ExportEase services via System 2."""
    asyncio.run(_check(base_url))


async def _check(base_url: str):
    rprint(f"\n[bold blue]ExportEase System 2 — Connectivity Check[/bold blue]")
    rprint(f"Target: [cyan]{base_url}[/cyan]\n")

    async with httpx.AsyncClient(base_url=base_url, timeout=10) as client:
        # 1. Health check
        try:
            resp = await client.get("/health")
            health = resp.json()
            status = health.get("status", "unknown")
            color = "green" if status == "ok" else "yellow"
            rprint(f"[{color}]GET /health → {status.upper()} (HTTP {resp.status_code})[/{color}]")
        except Exception as exc:
            rprint(f"[red]GET /health → FAILED: {exc}[/red]")
            rprint("[yellow]Is System 2 running? Try: docker-compose up[/yellow]")
            sys.exit(1)

        # 2. Readiness check
        try:
            resp = await client.get("/ready")
            ready = resp.json()
            status = ready.get("status", "unknown")
            checks = ready.get("checks", {})
            color = "green" if status == "ready" else "red"
            rprint(f"[{color}]GET /ready → {status.upper()} (HTTP {resp.status_code})[/{color}]")

            # Show per-service status
            table = Table(title="Service Connectivity Status")
            table.add_column("Service", style="cyan")
            table.add_column("Status")
            table.add_column("Notes")

            service_notes = {
                "qdrant": "Required — must be OK for System 2 to be ready",
                "system1": "Optional — LLM + Multi-Agent (consumer)",
                "system3": "Optional — Backend (consumer)",
            }
            for svc, svc_status in checks.items():
                status_color = {"ok": "green", "error": "red", "pending": "yellow"}.get(svc_status, "white")
                table.add_row(
                    svc,
                    f"[{status_color}]{svc_status.upper()}[/{status_color}]",
                    service_notes.get(svc, ""),
                )
            console.print(table)
        except Exception as exc:
            rprint(f"[red]GET /ready → FAILED: {exc}[/red]")

        # 3. Version info
        try:
            resp = await client.get("/version")
            v = resp.json()
            rprint(f"\n[dim]Service: {v.get('service')}[/dim]")
            rprint(f"[dim]Version: {v.get('version')} | API: {v.get('api_version')} | Contract hash: {v.get('contract_hash')}[/dim]")
        except Exception as exc:
            rprint(f"[yellow]GET /version → {exc}[/yellow]")

    rprint("\n[bold]Connectivity check complete.[/bold]")


if __name__ == "__main__":
    app()
