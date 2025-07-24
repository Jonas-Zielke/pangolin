# Developer Notes

## Environment Setup

1. **Node.js v20** is required. The project specifies Node 20 in `.nvmrc`.
2. Install dependencies using `npm ci` (or `npm install`).
3. Copy `config/config.example.yml` to `config/config.yml` before running anything.
4. Add `app.base_url` to the `app:` section in `config/config.yml` (e.g. `http://localhost:3002`). Some migrations expect this property.
5. Point the database layer to SQLite for development:
   ```bash
   echo 'export * from "./sqlite";' > server/db/index.ts
   ```
6. Generate and apply SQLite migrations:
   ```bash
   npm run db:sqlite:generate
   npm run db:sqlite:push
   ```
7. Copy the default Traefik configuration for local runs:
   ```bash
   cp -r install/config/traefik config/traefik
   ```
8. Build the project (optional for dev, required for production):
   ```bash
   npm run build:sqlite
   npm run build:cli
   ```
9. Start the development server:
   ```bash
   npm run dev
   ```
   or, after building, run
   ```bash
   npm run start:sqlite
   ```
10. Docker images can be built with `make build-sqlite` or `make build-pg`.

## Testing
The repository currently has no automated test suite. GitHub Actions perform a build and Docker image creation. To reproduce locally, follow the steps above and then run:
```bash
make build-sqlite
make build-pg
```
These commands will build Docker images after the application is running.

