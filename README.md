# Unique Cash for Cars — Next.js website

This project is a self-contained, SEO-enhanced Next.js migration of
`uniquecashforcars.com.au`.

The application serves a static snapshot of every URL in the WordPress page and
post sitemaps. The original Flatsome presentation and quote forms remain in
place, while the response layer replaces obsolete WordPress integrations with
clean metadata, valid structured data, host-aware sitemaps, security headers,
accessible markup, consent-based analytics and optimized media.

Gold Coast suburb pages use individually written location and collection
guidance instead of duplicated suburb-name templates. Preview deployments are
automatically excluded from search engines so they cannot compete with the
eventual custom-domain version.

## Commands

```bash
npm install
npm run dev
npm test
npm run lint
```

The test suite checks all 32 routes, metadata and schema validity, local-page
similarity, internal links, robots and sitemaps, security headers, preview
indexing rules, form delivery wiring and required assets.

## Deployment

The project uses standard Next.js and is ready for Vercel. Import the GitHub
repository in Vercel or deploy it with the Vercel CLI; no framework override,
build-command override, or output-directory override is required.

## Refreshing the WordPress snapshot

While the WordPress source remains online, refresh all mirrored pages and
same-origin assets with:

```bash
python3 scripts/mirror_wordpress.py
```

The mirror script fetches the WordPress page and post URLs, stores the source
HTML in
`app/mirror-pages.json`, and downloads page requisites under their original
paths in `public/wp-content` and `public/wp-includes`.

At request time the Next.js route handler applies the audited SEO, content,
privacy, performance and accessibility improvements, then replaces the source
origin with the incoming host. This lets links and assets work in local and
private previews while remaining correct when the custom domain is connected.

Contact Form 7 markup is preserved exactly. The local enhancement script
submits enquiries to the original Contact Form 7 mail handler through
`mail.uniquecashforcars.com.au`, allowing the public website domain to move
without changing the visible form or its validation behaviour.
