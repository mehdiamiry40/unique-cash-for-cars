# Repository and platform safeguards

The September 2026 audit fixes add continuous checks. The repository is public, so they run on GitHub's free plan. Workflow failures use GitHub Actions notifications; the repository owner must keep failed-run notifications enabled for the desired destination. A notification receipt has not been verified.

## Checks

- `Verify`: production Node 24, npm 10.9.8, clean installation, types, lint, URL preservation, build, and rendered/component tests.
- `Dependency audit`: known moderate-or-higher npm advisories fail the run. Dependabot checks npm and GitHub Actions weekly; dependency alerts and security update PRs are enabled in repository settings.
- `Secret scan`: Gitleaks scans all fetched Git history with fully redacted findings. Its pinned executable is SHA-256 verified before running.
- `Code scan`: Semgrep OSS checks JavaScript, TypeScript, and React application code. It retrieves public rule packs; analysis runs locally in the GitHub runner without a Semgrep token, source upload, or telemetry. The container is pinned by digest.

The `Security` workflow runs on pull requests, pushes to main, weekly, and manually. It does not require paid GitHub Code Security or Secret Protection. Maintain scanner versions and container digests as part of regular dependency review, including the Gitleaks binary checksum when updating its version.

## Main branch protection

The repository is public. The owner confirmed on 15 November 2026 that it stays public, which makes branch protection available at no cost. While it was private, the plan rejected branch-protection requests with HTTP 403.

Because anyone can read the repository, keep internal reports, enquiry details, real inbox addresses and credentials out of commits, pull request text and issues. Earlier commits remain readable in the history.

The reviewable desired policy is `.github/branch-protection.json`. It was applied to `main` on 15 November 2026, so a direct push to `main` is now refused. Read the live rules back with `gh api repos/mehdiamiry40/unique-cash-for-cars/branches/main/protection`. After changing the file, apply it again with:

```sh
gh api --method PUT repos/mehdiamiry40/unique-cash-for-cars/branches/main/protection --input .github/branch-protection.json
```

It requires every change to reach `main` through a pull request, the four named GitHub Actions checks from app ID 15368 to pass, an up-to-date branch, linear history and resolved conversations. It prevents force pushes and branch deletion and applies to administrators.

No approving review is required. The repository has one maintainer and GitHub does not let authors approve their own pull requests, so a review requirement would block every merge. Raise `required_approving_review_count` once a second reviewer exists. A CI file alone does not enforce this policy or prevent a direct push from deploying through Vercel.

`Dependency audit` is one of the required checks. A newly published advisory in any dependency therefore blocks merges until it is fixed, including unrelated content changes.

## Environment separation

`RESEND_API_KEY`, `QUOTE_TO_EMAIL` and `QUOTE_FROM_EMAIL` are production-only. Preview and local development use the explicit simulated quote response in application code and never send a notification.

Environment scope changes affect future deployments and pulls. Historical preview deployments and existing local `.env.local` files can still hold earlier environment snapshots. Retire those previews or redeploy them with the new simulation behavior, and replace local production credentials with isolated development configuration.

## Quote firewall rule

The existing exact `POST /api/quote` rule now returns HTTP 429 above 25 requests per IP per 60-second fixed window. No global or GET rule changed. Vercel counters are regional, so this is not a global business-wide submission quota. Watch the rule's metrics for legitimate-user collisions.

To roll back only enforcement, edit the same rule with `--action rate_limit --rate-limit-action log` and inspect the full diff before publishing. CLI 58.11.0 ignored a standalone `--rate-limit-action` edit during remediation, so verify that the nested action really becomes `log`; use a full JSON rule if necessary. Do not publish unrelated staged changes.
