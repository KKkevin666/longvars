# Maintenance contract

This is a personal knowledge archive, not a marketing site or SaaS product.

- Markdown in `content/` is the primary asset. Keep it portable and framework-independent.
- Generate a static `dist/`. Do not add a database, CMS, paid service, runtime API, or client framework without a concrete user requirement.
- Preserve published `slug` **and** `type`; both determine URLs. Title and source filename changes must not alter public routes.
- Keep `date` unchanged after first publication. Update `updated` only for real content revisions.
- Add Topics as Markdown; never manually maintain article lists.
- Drafts must be excluded from pages, related content, topics, sitemap, RSS and llms.txt.
- Examples are visibly labeled and forbidden in production. Do not disguise examples as the author's real research.
- Do not invent identity, company, client, performance data, or experience.
- Identity/domain configuration lives in `site.config.mjs`. `SITE_MODE=production` is explicit; preview stays noindex.
- Run `npm run verify` after changes. It validates schema, content, build output, links and metadata.
- Keep the lockfile committed. Node version is in `.nvmrc`.
- Never commit passwords, tokens, account recovery data or payment information.
- GitHub is the source of truth. Cloudflare Pages Git integration builds on main; a preview alone does not prove that remote deployment is connected.
- User confirmation is required before paid resources, critical DNS, account security changes, domain ownership changes or deleting remote resources.
- Record verified deployment state in `docs/verification.md`, including any unfinished external steps.
