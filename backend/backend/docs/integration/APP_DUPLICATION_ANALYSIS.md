# App Duplication Analysis

## Discovery

During codebase discovery, we found two identical directory trees inside System 3 (Backend):
- `app/` (outer tree)
- `app/app/` (inner duplicate tree)

## Similarity Audit

We compared the outer and inner directories using a SHA-256 hash comparison:
- **Total files matched**: 110 files.
- **Total mismatches**: 0 files.
- All files in the inner `app/app/` directory are bit-for-bit identical duplicates of the files in the outer `app/` directory.

## Canonical Runtime Tree Selection

- The outer `app/` directory is the canonical package directory.
- The `Dockerfile` and startup scripts run with the outer `app/` package, specifically importing `app.main:app` (e.g. `CMD ["python", "-m", "uvicorn", "app.main:app", ...]`).
- No source code files in the outer package refer to `app.app` imports (verified by grep search).
- Therefore, the inner `app/app/` folder is an accidental duplication probably caused by a directory copy mistake.

## Action Plan

- Safely remove the inner `app/app/` duplicate tree to clean up the workspace and prevent import ambiguity.
- Re-run all backend tests to verify system functionality.
