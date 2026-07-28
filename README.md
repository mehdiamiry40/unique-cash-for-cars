# Unique Cash for Cars — Next.js mirror

This project is a self-contained Next.js migration of
`uniquecashforcars.com.au`.

The application serves a static snapshot of every URL in the WordPress page and
post sitemaps. It keeps the original Flatsome HTML, inline styles, theme CSS,
JavaScript, fonts, images, navigation, popup markup, forms, metadata, and
responsive breakpoints.

## Commands

```bash
npm install
npm run dev
npm test
npm run lint
```

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

The mirror script fetches the URLs declared in `page-sitemap.xml` and
`post-sitemap.xml`, stores the complete page HTML in
`app/mirror-pages.json`, and downloads page requisites under their original
paths in `public/wp-content` and `public/wp-includes`.

At request time the Next.js route handler replaces the original site origin
with the current host. This lets links and assets work in local and private
previews while remaining unchanged when the custom domain is connected.

Contact Form 7 markup is preserved exactly. The local enhancement script
submits enquiries to the original Contact Form 7 mail handler through
`mail.uniquecashforcars.com.au`, allowing the public website domain to move
without changing the visible form or its validation behaviour.
