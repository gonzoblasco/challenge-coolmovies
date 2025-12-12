# Important Note

When submitting, please add the following user(s) as collaborators to your **private** repo:

- GitHub `@SamuelCarlos`
- Gitlab `@samuel.xavier`

# Coolmovies Frontend

A modern movie review application built with Next.js 15, featuring a beautiful dark theme UI with Shadcn/UI components and comprehensive accessibility support.

## ✨ Features Implemented

- **Movie Reviews Grid** - Browse movies with ratings and poster images
- **Review Management** - Create, edit, and delete reviews with star ratings
- **Comments System** - Reply to reviews with nested comments
- **Accessibility** - Full keyboard navigation, ARIA labels, WCAG 2.1 compliant
- **Dark Theme** - Purple-accented dark mode design

## 🛠️ Technology Stack

- [Next.js 15](https://nextjs.org/) (Build Framework)
- [Shadcn/UI](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) (Component Library & Styling)
- [Redux Toolkit](https://redux-toolkit.js.org/) (State Management)
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) (Data Fetching)
- [GraphQL Codegen](https://the-guild.dev/graphql/codegen) (Type Generation)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager
- Docker (for backend)

### Backend Setup

```bash
cd coolmovies-backend
docker-compose up
```

### Frontend Setup

```bash
cd coolmovies-frontend
cp .env.example .env.development
yarn install
yarn dev
```

Open [http://localhost:3000/reviews](http://localhost:3000/reviews) to view the application.

## 📦 Environment Variables

Create a `.env.development` file based on `.env.example`:

| Variable                  | Description                               | Default                         |
| ------------------------- | ----------------------------------------- | ------------------------------- |
| `CODEGEN_SCHEMA_PATH`     | GraphQL schema URL for codegen            | `http://localhost:5001/graphql` |
| `GRAPHQL_API_URL`         | Backend GraphQL API URL (SSR)             | `http://localhost:5001/graphql` |
| `NEXT_PUBLIC_GRAPHQL_URL` | Public GraphQL URL (client-side, proxied) | `/graphql`                      |

## 🧪 Testing

Run the test suite with coverage:

```bash
yarn test              # Run tests
yarn test:coverage     # Run tests with coverage report
yarn test:watch        # Run tests in watch mode
```

**Current Coverage:** 81 tests, 91.9% line coverage for reviews components

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/ui/          # Shadcn/UI components
├── features/reviews/       # Reviews feature module
│   ├── components/         # Feature-specific components
│   ├── hooks/              # Custom hooks
│   ├── state/              # Redux slice
│   ├── templates/          # Page templates
│   └── types.ts            # TypeScript types
├── generated/              # GraphQL codegen output
└── state/                  # Global Redux store
```

## 📝 Available Scripts

| Script               | Description                                       |
| -------------------- | ------------------------------------------------- |
| `yarn dev`           | Start development server                          |
| `yarn build`         | Build for production                              |
| `yarn test`          | Run Jest tests                                    |
| `yarn test:coverage` | Run tests with coverage                           |
| `yarn graphql-types` | Generate GraphQL types (requires backend running) |
| `yarn lint`          | Run ESLint                                        |

---

## Original Challenge Requirements

> You have to add the cool movies review feature to the existing `coolmovies-frontend`. You are required to add a new `/reviews` endpoint to the application that renders a list of movies. A user should be able to add a new review with a rating.

### Acceptance Criteria

**You will be evaluated on your UI/UX. We expect this to be at the level of a basic prototype; clean and clear flow.**

**You will be evaluated on critical thinking and decision making, so be mindful of any direction you take**

**You will be evaluated against your ability to understand and use the tooling provided and mimic existing patterns that are shown in the examples.**

There are 2 main components for this feature, they **MUST** be completed and working:

1. ✅ Listing of the movie reviews.
2. ✅ Adding additional reviews.

Additional things we would like to see:

1. ✅ Our designers don't like the default MUI blue. Change this. → _Migrated to Shadcn/UI with purple theme_
2. ✅ Make the proxied GraphQL URL an environment variable.
3. ✅ Add a few unit tests to your code. (These must pass). → _81 tests, 91.9% coverage_
4. ✅ Accessibility is important. → _Full WCAG 2.1 compliance, keyboard navigation_
