# Implementation Plan - Supabase Local Development Setup

Set up a local-first Supabase environment by installing the Supabase CLI via Homebrew, linking the local configuration inside `apps/supabase` to the remote Supabase project, pulling the remote schema, and establishing a local-to-cloud development workflow.

## User Review Required

> [!IMPORTANT]
> - **Supabase CLI Installation**: Since `npx supabase` fails on `darwin-arm64` (Apple Silicon macOS) with a tarball extraction error, we will install the Supabase CLI globally using Homebrew. This requires tapping the official Supabase tap first: `brew tap supabase/tap && brew install supabase`.
> - **Remote Credentials Required**: Linking to the remote Supabase database requires the database password for the project `kfbzgkjffmfzjzbxoqvr`. You will need to enter this during the execution stage.
> - **Working Directory**: All Supabase CLI commands will be run from the `apps/supabase` directory, which contains your local configuration (`apps/supabase/supabase/config.toml`).

## Open Questions

> [!NOTE]
> - Do you already have the database password for the remote project `kfbzgkjffmfzjzbxoqvr`? If not, you might need to reset it in the Supabase Dashboard (Project Settings -> Database -> Database password).

## Proposed Setup and Workflow

---

### Step 1: Install Supabase CLI
Install the official Supabase CLI on macOS via Homebrew.
- Command: `brew tap supabase/tap && brew install supabase`

### Step 2: Authenticate and Link
Log in to Supabase CLI and link the project:
1. Run `supabase login` (will prompt for token or browser login).
2. Inside `apps/supabase`, run `supabase link --project-ref kfbzgkjffmfzjzbxoqvr` (will prompt for database password).

### Step 3: Pull Remote Schema
Pull the remote database schema to populate local migrations.
- Inside `apps/supabase`, run `supabase db pull` to generate the initial migration file representing the cloud database state.

### Step 4: Run Local Stack
Start Docker-based local development:
- Inside `apps/supabase`, run `supabase start` to launch database, auth, storage, and local Studio dashboard.

---

## Verification Plan

### Automated/Local Checks
- Check `supabase --version` to verify correct installation.
- Verify migration file generated in `apps/supabase/supabase/migrations/` matches the remote schema.
- Run `supabase status` to ensure all local containers are healthy.
- Open Local Studio dashboard at `http://localhost:54323` to verify tables and public schema structure.
