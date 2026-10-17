# Repository and platform safeguards

The September 2026 audit fixes add continuous checks supported by this private repository's current plan. Workflow failures use GitHub Actions notifications; the repository owner must keep failed-run notifications enabled for the desired destination. A notification receipt has not been verified.

## Checks

- `Verify`: production Node 24, npm 10.9.8, clean installation, types, lint, URL preservation, build, and rendered/component tests.
- `Dependency audit`: known moderate-or-higher npm advisories fail the run. Dependabot checks npm and GitHub Actions weekly; dependency alerts and security update PRs are enabled in repository settings.
- `Secret scan`: Gitleaks scans all fetched Git history with fully redacted findings. Its pinned executable is SHA-256 verified before running.
- `Code scan`: Semgrep OSS checks JavaScript, TypeScript, and React application code. It retrieves public rule packs; analysis runs locally in the GitHub runner without a Semgrep token, source upload, or telemetry. The container is pinned by digest.

The `Security` workflow runs on pull requests, pushes to main, weekly, and manually. It does not require paid GitHub Code Security or Secret Protection. Maintain scanner versions and container digests as part of regular dependency review, including the Gitleaks binary checksum when updating its version.

## Main branch protection

The current private-repository plan rejected branch-protection requests with HTTP 403: `Upgrade to GitHub Pro or make this repository public to enable this feature.` Keep the repository private. No purchase or visibility change was made.

The reviewable desired policy is `.github/branch-protection.json`. After an owner enables private-repository protection and the new workflows have registered their checks, apply it with:

```sh
gh api --method PUT repos/mehdiamiry40/unique-cash-for-cars/branches/main/protection --input .github/branch-protection.json
```

It requires one approval, approval after the latest push, resolved conversations, the four named GitHub Actions checks from app ID 15368, and an up-to-date branch. It prevents force pushes and branch deletion and applies to administrators. The protected branch must have an eligible reviewer; authors cannot approve their own PRs. A CI file alone does not enforce this policy or prevent a direct push from deploying through Vercel.

## Environment separation

`RESEND_API_KEY`, `QUOTE_TO_EMAIL` and `QUOTE_FROM_EMAIL` are production-only. Preview and local development use the explicit simulated quote response in application code and never send a notification.

Environment scope changes affect future deployments and pulls. Historical preview deployments and existing local `.env.local` files can still hold earlier environment snapshots. Retire those previews or redeploy them with the new simulation behavior, and replace local production credentials with isolated development configuration.

## Quote firewall rule

The existing exact `POST /api/quote` rule now returns HTTP 429 above 25 requests per IP per 60-second fixed window. No global or GET rule changed. Vercel counters are regional, so this is not a global business-wide submission quota. Watch the rule's metrics for legitimate-user collisions.

To roll back only enforcement, edit the same rule with `--action rate_limit --rate-limit-action log` and inspect the full diff before publishing. CLI 58.11.0 ignored a standalone `--rate-limit-action` edit during remediation, so verify that the nested action really becomes `log`; use a full JSON rule if necessary. Do not publish unrelated staged changes.
