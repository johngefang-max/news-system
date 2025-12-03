# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Database Operations
- `npm run db:push` - Push schema changes to database (development)
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with initial data
- `npm run postinstall` - Automatically runs prisma generate after install

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with custom session management
- **Internationalization**: next-intl for multi-language support
- **Styling**: Tailwind CSS with @tailwindcss/typography
- **Type Safety**: Full TypeScript coverage

### Project Structure
```
app/
├── [lang]/                   # Multi-language routing (zh/en)
│   ├── (public)/            # Public pages (news, articles)
│   └── (protected)/         # Authenticated pages (admin)
├── api/                     # API routes
└── globals.css
components/
├── ui/                      # Reusable UI components
├── news/                    # News-specific components
└── admin/                   # Admin panel components
lib/                         # Utilities and configurations
prisma/                      # Database schema and seeds
messages/                    # i18n translation files (zh.json, en.json)
```

### Database Schema
- **Multi-language Architecture**: ArticleLocale and CategoryLocale tables for content translation
- **User Roles**: ADMIN, EDITOR, CONTRIBUTOR with permission-based access
- **Article States**: DRAFT, PUBLISHED, ARCHIVED with scheduled publishing support
- **SEO-Friendly URLs**: Custom slugs for articles and categories
- **NextAuth Integration**: Complete authentication system with sessions

### Key Patterns

#### Multi-language Content
Articles and categories use a two-table system:
- Main entity (Article/Category) with shared fields
- Locale table (ArticleLocale/CategoryLocale) with language-specific content
- Use `@@unique([articleId, language])` constraint to prevent duplicates

#### Authentication Flow
- NextAuth.js handles authentication with custom callbacks
- Role-based middleware protects admin routes
- Session management includes user role and language preferences

#### API Route Structure
- `/api/articles` - Full CRUD with filtering and search
- `/api/categories` - Category management
- `/api/auth/[...nextauth]` - NextAuth endpoints
- All API routes include proper error handling and validation

#### Internationalization
- URL structure: `/{lang}/...` for all routes
- Translation files in `messages/` directory
- Language switching preserves current page context

## Development Guidelines

### Database Changes
1. Modify `prisma/schema.prisma` for schema changes
2. Run `npm run db:push` for development changes
3. Run `npm run db:generate` to update client
4. Update seed data if needed

### Adding New Features
1. Follow the existing component structure in `components/`
2. Use TypeScript types from `types/` directory
3. Implement proper error boundaries and loading states
4. Add translations for both zh and en languages

### Code Style
- Uses ESLint + Prettier with Tailwind plugin
- Components follow atomic design principles
- API routes include proper request validation
- Database queries use Prisma with proper error handling

## Common Development Tasks

### Adding New Article Fields
1. Update `Article` or `ArticleLocale` model in `prisma/schema.prisma`
2. Run `npm run db:push`
3. Update corresponding API routes in `app/api/articles/`
4. Modify admin forms in `app/[lang]/(protected)/admin/`
5. Add new translations to `messages/` files

### Creating New API Routes
1. Create route file in `app/api/[endpoint]/route.ts`
2. Implement proper HTTP methods (GET, POST, PUT, DELETE)
3. Add input validation using Zod schemas
4. Include authentication checks for protected endpoints
5. Return consistent response format with error handling

### Adding New Languages
1. Create new language file in `messages/` (e.g., `fr.json`)
2. Update language configuration in `ni18n/routing.ts`
3. Add language option to language switcher component
4. Update database seeds with new language content

## Environment Setup
- Copy `.env.example` to `.env.local`
- Configure `DATABASE_URL` for PostgreSQL connection
- Set `NEXTAUTH_URL` and `NEXTAUTH_SECRET` for authentication
- Optional: Configure `DIRECT_URL` for direct database connections

## Default Credentials
- Admin user: `admin@news.com` / `admin123`
- These are created via database seed script

## Deployment Notes
- Configured for Vercel deployment
- Requires PostgreSQL database connection
- Environment variables must be set in Vercel dashboard
- `postinstall` script ensures Prisma client generation on build