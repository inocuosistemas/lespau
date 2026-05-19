# Vercel staging

This app can be deployed to Vercel with SQLite as a read-only static catalog.

## What gets deployed

- Next.js app.
- Prisma Client generated during build.
- `prisma/catalog.db` as the static catalog snapshot.
- No PDF extraction at runtime.
- No write operations are required for recommendations.

## Prepare the database snapshot

Run locally after importing official data:

```bash
npm run prisma:migrate
npm run extract:official
npm run import:official
npm run db:prepare-static
```

Commit `prisma/catalog.db` together with code changes.

## Vercel environment variables

Set this in the Vercel project:

```env
DATABASE_URL=file:./catalog.db
```

The path is relative to `prisma/schema.prisma`, so it resolves to `prisma/catalog.db`.

## Build command

Vercel uses:

```bash
npm run vercel-build
```

which runs:

```bash
prisma generate && next build
```

## Staging caveats

- SQLite is used as a static read-only catalog. Do not store user profiles there on Vercel.
- `/admin/import` is currently visible. Protect it before sharing a public staging URL.
- If Vercel cannot include `catalog.db` in the serverless bundle, move to a hosted Postgres database or configure explicit output tracing.
- The ETL scripts require Python and local PDF tooling, so they should run locally or in CI, not inside Vercel runtime.

## Data needed before publishing

- Vercel project name: `lespau`.
- Vercel team/account: same GitHub-connected account as `inocuosistemas`.
- Git repository remote: `https://github.com/inocuosistemas/lespau.git`.
- Desired staging domain: default Vercel `.vercel.app` domain.
- Access: public staging URL.
- Admin/config page: public for now, because it does not mutate server-side data.
- Static SQLite snapshot: `prisma/catalog.db` is committed and used as the read-only catalog.

## Vercel project settings

- Project name: `lespau`
- Framework preset: Next.js
- Build command: `npm run vercel-build`
- Install command: default `npm install`
- Output directory: default
- Environment variable:

```env
DATABASE_URL=file:./catalog.db
```
