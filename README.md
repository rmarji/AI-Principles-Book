# The Leader's Guide to AI Teams

An interactive digital book reader application for "The Leader's Guide to AI Teams" by Rayo Marji - a practical playbook for leaders to strategically integrate AI agents into their workflows and build AI-powered organizational structures.

## Features

- **Interactive Reading Experience**: Clean, distraction-free reading interface with sidebar navigation
- **Markdown-Based Content**: Book chapters stored as Markdown files for easy editing and version control
- **Export Functionality**: Export chapters or the entire book to PDF or Word formats
- **Responsive Design**: Optimized for desktop and mobile reading
- **Theme Support**: Built with modern UI components and theming capabilities
- **Fast Performance**: Optimized builds with Vite and esbuild

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Wouter** for lightweight routing
- **TanStack Query** for server state management
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library built on Radix UI
- **Framer Motion** for smooth page transitions
- **Vite** for blazing-fast development and builds

### Backend
- **Node.js** with Express
- **TypeScript** with ES modules
- **Drizzle ORM** with PostgreSQL
- **Passport.js** for authentication
- **WebSocket** support for real-time features

### Document Processing
- **marked** for Markdown parsing
- **jsPDF** for PDF generation
- **docx** for Word document creation
- **file-saver** for client-side downloads

## Prerequisites

- Node.js 20 or higher
- PostgreSQL database (optional, uses in-memory storage by default)
- npm or bun package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
# Create a .env file if you want to use PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

4. Push database schema (if using PostgreSQL):
```bash
npm run db:push
```

## Development

Start the development server:
```bash
npm run dev
```

This will start:
- Backend server with hot reload on `http://localhost:5000`
- Vite dev server with HMR for the frontend

## Production

Build and run the production version:
```bash
# Build both client and server
npm run build

# Start production server
npm start
```

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run dev:client` - Start Vite dev server only
- `npm run build` - Build production bundles for client and server
- `npm start` - Run production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes

## Project Structure

```
.
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and book content
│   │   └── main.tsx       # Application entry point
│   └── public/            # Static assets
├── server/                # Backend application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Storage implementation
│   └── db.ts             # Database configuration
├── shared/               # Shared TypeScript types
│   └── schema.ts         # Database schema
├── content/              # Book content
│   └── chapters/         # Markdown chapter files
└── script/               # Build scripts
    └build.ts             # Production build script
```

## Book Content

Book chapters are stored as Markdown files in the `content/chapters/` directory. Chapter metadata is defined in `client/src/lib/bookContent.ts`.

To add or edit chapters:
1. Create/edit Markdown files in `content/chapters/`
2. Update chapter metadata in `client/src/lib/bookContent.ts`
3. The application will automatically serve the new content

## License

MIT

## Author

**Rayo Marji**

---

Built with modern web technologies for an optimal reading experience.
