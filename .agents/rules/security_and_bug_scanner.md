# Exhaustive Security & Bug Audit Protocol (Zero-Omission Rule)

## 1. Zero-Omission File Inventory
- Maintain a centralized audit registry at `.audit/registry.json`.
- The registry tracks EVERY source file in the repository (backend, frontend, admin, scripts, root).
- File status workflow:
  - `PENDING`: Not yet scanned.
  - `SCANNING`: Currently being audited.
  - `AUDITED_CLEAN`: Audited, verified free of security vulnerabilities and bugs.
  - `FIXED`: Vulnerability/bug identified and safely repaired.
  - `NEEDS_RESCAN`: A dependent or related file was modified; must be re-checked for regressions or broken contracts.

## 2. "Find More" Verification Protocol
- Whenever the prompt "Find more" is received:
  1. Re-scan directory trees for any files created or missed in previous runs.
  2. Identify any files with status `PENDING` or `NEEDS_RESCAN`.
  3. Execute focused deep-scan and bug-fixing passes on all such files.
  4. Ensure zero files remain unaccounted for.

## 3. Safe-Fix & Dependency Ripple Protocol
- When fixing any bug or security flaw in file `A`:
  1. Check all files importing `A` or imported by `A`.
  2. Verify that function signatures, return types, DTO contracts, and error handling remain 100% backward-compatible.
  3. Set related files to `NEEDS_RESCAN` and immediately audit them to confirm no secondary bugs or security vulnerabilities were introduced.
  4. Never remove legitimate business logic; only harden and debug.

## 4. Security Audit Vectors
- **Authentication & Authorization**: IDOR, bypassable guards, missing tenant/role checks, weak token handling.
- **Injection & Traversal**: SQL/Prisma raw query injection, command injection, path traversal in uploads/downloads, SSRF.
- **Data Protection & Sanitization**: Stored/Reflected XSS (especially in HTML/TipTap renderers), prototype pollution, sensitive data leakage in API responses or logs.
- **Upload Security**: File type verification, size validation, path sanitization, race conditions.
- **Business Logic & Concurrency**: Inventory race conditions, payment status tampering, double-spend/re-order flaws.

## 5. Dependency Audit Protocol
- Run audit checks across workspaces (`root`, `backend`, `frontend`, `admin`).
- Resolve reported CVEs without introducing breaking API changes.
- Verify TypeScript compilation across all workspaces after fixes.

## 6. Post-Modification Immediate Testing Protocol
- Immediately after any file is modified or fixed:
  1. Run workspace TypeScript / build tests (`npx tsc --noEmit` or equivalent) on the affected package (backend, frontend, or admin).
  2. Verify that there are zero syntax errors, zero broken imports, and zero type mismatch regressions.
  3. Only after the test passes may the file be updated to `FIXED` in the registry.

