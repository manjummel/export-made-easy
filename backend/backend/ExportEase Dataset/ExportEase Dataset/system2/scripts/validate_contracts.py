#!/usr/bin/env python3
"""
validate_contracts.py — CLI to validate the ExportEase Knowledge API contract.

Usage:
    python scripts/validate_contracts.py
    python scripts/validate_contracts.py --contracts-path ./contracts
"""

from __future__ import annotations

import sys
from pathlib import Path

import typer
from rich import print as rprint
from rich.console import Console

console = Console()
app = typer.Typer()


@app.command()
def main(
    contracts_path: str = typer.Option("./contracts", help="Path to contracts directory"),
    git_url: str = typer.Option("", help="Git URL to fetch contracts from if local path is missing"),
):
    """Validate the ExportEase Knowledge API OpenAPI contract."""
    rprint("\n[bold blue]ExportEase — API Contract Validator[/bold blue]\n")

    sys.path.insert(0, str(Path(__file__).parent.parent))

    from rag.integration.contract_loader import ContractLoader, ContractLoadError, ContractVersionMismatch

    loader = ContractLoader(
        contracts_path=contracts_path,
        git_url=git_url or None,
    )

    # 1. Load contract
    try:
        rprint(f"[dim]Loading contract from: {contracts_path}[/dim]")
        contract = loader.load()
        rprint(f"[green]✓ Contract loaded successfully[/green]")
    except ContractLoadError as exc:
        rprint(f"[red]✗ Contract load failed: {exc}[/red]")
        sys.exit(1)

    # 2. Version check
    info = contract.get("info", {})
    version = info.get("version", "unknown")
    title = info.get("title", "unknown")
    rprint(f"[green]✓ Title: {title}[/green]")
    rprint(f"[green]✓ Version: {version}[/green]")
    rprint(f"[green]✓ Contract hash: {loader.get_hash()}[/green]")

    # 3. Check required paths
    paths = contract.get("paths", {})
    required_paths = ["/health", "/ready", "/version", "/v1/knowledge/query", "/v1/knowledge/search",
                      "/v1/documents/ingest", "/v1/documents/batch"]
    missing = [p for p in required_paths if p not in paths]
    if missing:
        rprint(f"[red]✗ Missing paths in contract: {missing}[/red]")
        sys.exit(1)
    else:
        rprint(f"[green]✓ All {len(required_paths)} required paths present[/green]")

    # 4. Check schemas
    schemas = contract.get("components", {}).get("schemas", {})
    required_schemas = ["QueryRequest", "QueryResponse", "IngestRequest", "IngestResponse",
                        "HealthResponse", "ReadinessResponse", "VersionResponse"]
    missing_schemas = [s for s in required_schemas if s not in schemas]
    if missing_schemas:
        rprint(f"[red]✗ Missing schemas: {missing_schemas}[/red]")
        sys.exit(1)
    else:
        rprint(f"[green]✓ All {len(required_schemas)} required schemas present[/green]")

    rprint(f"\n[bold green]Contract validation PASSED ✓[/bold green]")


if __name__ == "__main__":
    app()
