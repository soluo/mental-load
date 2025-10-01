# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Ensemble" is a household mental load sharing application built with:
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS
- **Backend**: Convex (serverless backend platform)
- **Auth**: Convex Auth with Password and Anonymous providers
- **UI Components**: Radix UI primitives with shadcn/ui styling

This project was scaffolded using [Chef](https://chef.convex.dev) and is connected to the Convex deployment `rapid-spaniel-199`.

## Development Commands

```bash
# Start both frontend and backend (recommended)
pnpm run dev

# Start frontend only (Vite dev server with auto-open)
pnpm run dev:frontend

# Start backend only (Convex dev server)
pnpm run dev:backend

# Build for production
pnpm run build

# Lint and type-check (runs: TypeScript check on convex/, TypeScript check on src/, convex dev --once, vite build)
pnpm run lint
```

**Package Manager**: This project uses pnpm (version 10.17.1+). Use `pnpm install` to add dependencies.

## Architecture

### Frontend Structure (`src/`)

The app follows a component-based architecture with three main UI states:

1. **Unauthenticated**: `AuthForm` component for sign-in/sign-up
2. **Authenticated + No Household**: `HouseholdSetup` component to create or join a household
3. **Authenticated + Has Household**: `HouseholdDashboard` component showing household details

**Key Components**:
- `App.tsx`: Root component with header, authentication routing logic, and loading states
- `main.tsx`: Entry point wrapping app with `ConvexAuthProvider`
- `components/AuthForm.tsx`: Handles user authentication
- `components/HouseholdSetup.tsx`: Household creation/joining flow
- `components/HouseholdDashboard.tsx`: Main household view
- `components/ui/`: Reusable UI primitives (button, dialog, input, label) using Radix UI

### Backend Structure (`convex/`)

**Data Model** (`schema.ts`):
- `households`: Stores household information (name, createdBy)
- `householdMembers`: Junction table linking users to households with indexes on both `householdId` and `userId`
- Auth tables: Imported from `@convex-dev/auth/server`

**Authentication** (`auth.ts`, `auth.config.ts`):
- Uses Convex Auth with Password and Anonymous providers
- `loggedInUser` query returns current authenticated user
- Auth HTTP routes automatically added in `http.ts`

**Household Logic** (`households.ts`):
- `createHousehold`: Creates household and adds creator as first member
- `joinHousehold`: Adds user to existing household (users can only be in one household)
- `getCurrentHousehold`: Returns household with member details for current user
- `leaveHousehold`: Removes user from their household

**HTTP Routes**:
- `router.ts`: User-defined HTTP routes (currently empty)
- `http.ts`: Combines user routes with auth routes (DO NOT modify auth route setup here)

### Important Patterns

**Authentication Flow**:
- All protected mutations/queries use `getAuthUserId(ctx)` from `@convex-dev/auth/server`
- Frontend uses `<Authenticated>` and `<Unauthenticated>` components from `convex/react`
- Query results are checked for `undefined` (loading state) before rendering

**Household Constraints**:
- Users can only belong to one household at a time
- Joining a household checks for existing membership
- Household members are loaded with user details via `Promise.all` pattern

## Environment Variables

- `VITE_CONVEX_URL`: Convex deployment URL (set in `.env.local`)
- `CONVEX_SITE_URL`: Used in auth config for provider domain

## Key Dependencies

- `@convex-dev/auth`: Authentication system
- `convex`: Backend client and server utilities
- `@radix-ui/*`: Headless UI components
- `tailwindcss`: Utility-first CSS framework
- `sonner`: Toast notifications
- `lucide-react`: Icon library

## Conventions

- When importing icons from lucide-react, import the icon with Icon suffix (e.g. `import { UserIcon } from "lucide-react"`).

## Styling

The app uses Tailwind CSS with a custom configuration. Component styling follows the shadcn/ui pattern with `class-variance-authority` for variant management and `tailwind-merge` (via `src/lib/utils.ts`) for className merging.

The app is built for mobile first. For larger screens, the main container has a max width of `md` (768px) and is centered.
