# Portfolio

Portfolio personnel de Taas S. Ekpaye : site vitrine, blog et projets, avec une interface d'administration pour gérer le contenu.

Site en production : <https://taas-s-ekpaye.vercel.app>

## Fonctionnalités

- Page d'accueil avec présentation, projets, articles et calendrier de contributions GitHub
- Blog (`/blogs`) et pages projet (`/projects/[slug]`)
- Thème clair/sombre
- Image Open Graph générée par un endpoint léger (`/og-image`)
- Sitemap généré automatiquement
- Zone d'administration (`/admin`) protégée par authentification :
  - tableau de bord
  - création, édition et publication des articles et des projets (brouillon / publié)
  - éditeur de texte riche (Tiptap) avec images, liens et coloration syntaxique
  - profil et paramètres

## Stack

| Domaine | Technologies |
| --- | --- |
| Framework | Astro 6, îlots React 19 |
| Style | Tailwind CSS 4, shadcn/ui (Radix), Lucide, simple-icons |
| Données et auth | Supabase |
| Formulaires | TanStack Form, Zod |
| Éditeur | Tiptap, lowlight |
| Déploiement | Vercel |
| Outillage | Bun, Turborepo, Biome, Vitest |

## Structure du dépôt

```
apps/
  web/        Site Astro (pages, composants, services, schémas)
  supabase/   Configuration Supabase, migrations et seed
packages/
  shared/     Client et types Supabase partagés
scripts/
  deploy-local.sh   Migrations Supabase + build de l'application
```

## Prérequis

- [Bun](https://bun.sh) 1.3 ou plus récent
- [Supabase CLI](https://supabase.com/docs/guides/cli) (pour la base locale et les migrations)

## Démarrage

```bash
bun install
```

Créez les fichiers d'environnement à la racine (`.env.development` et `.env.production`, liés symboliquement depuis `apps/web`) avec :

| Variable | Rôle |
| --- | --- |
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_ANON_KEY` | Clé anonyme Supabase |
| `PUBLIC_SUPABASE_URL` | URL exposée au client (si différente) |
| `PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme exposée au client (si différente) |

Lancez ensuite le serveur de développement :

```bash
bun run dev   # http://localhost:3000
```

## Scripts

| Commande | Description |
| --- | --- |
| `bun run dev` | Serveur de développement (port 3000) |
| `bun run build` | Vérifie le schéma Supabase puis construit le site |
| `bun run typecheck` | Vérification des types (`astro check`) |
| `bun run test` | Tests Vitest |
| `bun run lint` / `lint:fix` | Lint avec Biome |
| `bun run format` | Formatage avec Biome |
| `bun run deploy` | Pousse les migrations Supabase et déploie l'application |

## Déploiement

`bun run deploy` exécute `scripts/deploy-local.sh`, qui lit un fichier d'environnement (par défaut `.env.production`) et doit définir `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_DB_PASSWORD` et `SUPABASE_PROJECT_ID`.

```bash
./scripts/deploy-local.sh                # utilise .env.production
./scripts/deploy-local.sh .env.local     # utilise un autre fichier
```

L'application est hébergée sur Vercel via `@astrojs/vercel`.
