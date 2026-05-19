# Recomendador de carreras universitarias en Catalunya

MVP en Next.js + TypeScript + Tailwind + SQLite/Prisma para orientar a estudiantes que preparan las PAU.

## Arquitectura

- `prisma/schema.prisma`: modelo de universidades, campus, grados, asignaturas y ponderaciones PAU.
- `prisma/seed.ts`: datos de ejemplo para que el MVP funcione desde el inicio.
- `lib/recommendation-engine.ts`: motor de scoring puro, configurable y preparado para explicaciones.
- `lib/data.ts`: acceso a datos con Prisma.
- `scripts/import-weights.ts`: importador CSV desacoplado del frontend.
- `app/profile`, `app/results`, `app/degrees/[code]`, `app/admin/import`: vistas principales.

## Fuente inicial prevista

PDF oficial de ponderaciones PAU 2026:
https://universitats.gencat.cat/web/.content/02_preinscripcio/enllac-documents/Ponderacions-2026_v6.pdf

El MVP no scrapea desde el frontend. La extraccion del PDF debe generar CSV/JSON normalizado y entrar por scripts.

## Puesta en marcha

```bash
cp .env.example .env
npm install
npm run prisma:migrate -- --name init
npm run db:seed
npm run dev
```

## Importar ponderaciones CSV

```bash
npm run import:weights -- data/sample-ponderacions.csv
```

Formato esperado:

```csv
degree_code,degree_name,university_code,subject_code,subject_name,weight
UB-MED,Medicina,UB,BIO,Biologia,0.2
```

## Cargar datos oficiales

Los PDFs oficiales se guardan en `data/official` y se normalizan a JSON antes de importar:

```bash
npm run extract:official
npm run import:official
```

Fuentes usadas:

- Ponderaciones PAU 2026 v6 de Canal Universitats.
- Notes de tall 1a assignació juny 2025.
- Preinscripció universitària juny 2025, lista de centros y plazas.

## Scoring inicial

El score se calcula con pesos configurables:

- Encaje de intereses: 35
- Encaje de asignaturas PAU: 25
- Realismo de nota de acceso: 20
- Empleabilidad: 10
- Ubicacion: 5
- Preferencias personales: 5

La salida incluye porcentaje de match, desglose, asignaturas que ponderan 0.2, etiquetas y explicaciones breves.
