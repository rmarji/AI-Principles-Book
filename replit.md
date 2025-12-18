# The Leader's Guide to AI Teams

## Overview

This is an interactive digital book reader application for "The Leader's Guide to AI Teams" by Rayo Marji. The application serves as a web-based reading platform that displays book chapters with a sidebar navigation, supports markdown-based content, and includes export functionality to PDF and Word formats.

The book content focuses on helping leaders strategically integrate AI agents into their workflows, covering topics from AI fundamentals to building AI agent workforces and organizational leadership in the AI era.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **Animations**: Framer Motion for page transitions
- **Typography**: Outfit font for headings, Inter for body text

The frontend follows a component-based architecture with:
- `ReaderLayout` as the main layout wrapper with sidebar navigation
- Page components in `client/src/pages/` for routing
- Reusable UI components in `client/src/components/ui/`
- Content defined in `client/src/lib/bookContent.ts` with chapter metadata

### Backend Architecture

- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **Build Tool**: esbuild for server bundling, Vite for client
- **Development**: tsx for TypeScript execution

The server provides:
- Static file serving for the built client
- REST API endpoints for chapter content (`/api/chapters/:id`, `/api/chapters`)
- Markdown files served from `content/chapters/` directory

### Content Management

- Book chapters stored as Markdown files in `content/chapters/`
- Chapter metadata defined in `client/src/lib/bookContent.ts`
- Markdown parsing handled client-side using the `marked` library
- Export functionality for PDF (jsPDF) and Word (docx) formats

### Database Schema

Uses Drizzle ORM with PostgreSQL configuration:
- `users` table with id, username, and password fields
- Currently uses in-memory storage (`MemStorage`) as the active implementation
- Database schema defined in `shared/schema.ts`

### Build and Development

- Development: `npm run dev` starts the Express server with Vite middleware for HMR
- Production: `npm run build` creates optimized bundles, `npm start` runs the production server
- Database migrations: `npm run db:push` using Drizzle Kit

## External Dependencies

### Core Services
- **PostgreSQL**: Database (configured via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Database toolkit with Zod schema validation

### UI Libraries
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library

### Document Export
- **jsPDF**: PDF generation
- **docx**: Word document generation
- **file-saver**: Client-side file downloads

### Development Tools
- **Vite**: Frontend build tool and dev server
- **Replit plugins**: Development banner, error overlay, cartographer (dev only)