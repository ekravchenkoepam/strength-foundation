# Strength Foundation

This repo has inside both Admin and Client website for the Strength Foundation, Ukraine.

- [Specification](./docs/SPECIFICATION.md): basic functional requirements to the system.
- [Learn](./docs/LEARN.md): this project is based on `NPM workspaces`, `Turborepo`, `Strapi`, `Next.js`. So, if you are not familiar with them please refer to the article we created.

## Local Setup

1. Install Node.js v.20 locally.
2. Run `npm install` command. This command will install all dependencies.
3. Then go to specific application docs bellow.

## Application docs

- [Admin](./packages/admin/README.md)
- [Client](./packages/client/README.md)

## 🛠️ Available Scripts

The project uses **NPM workspaces** and **Turborepo** to manage scripts across application.

### Root-Level Commands

| Command               | Description                                                                                     |
|-----------------------|-------------------------------------------------------------------------------------------------|
| `npm run dev`         | Runs development servers for all applications concurrently.                                     |
| `npm run build:admin` | Builds the **Admin** application (located in `packages/admin`).                                 |
| `npm run build:client`| Builds the **Client** application (located in `packages/client`).                               |
| `npm run type-check`  | Runs TypeScript type checks for the **Client** application (located in `packages/client`).      |
| `npm run prepare`     | Configures **Husky** for managing Git hooks (e.g., pre-commit linting and formatting).          |
