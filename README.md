# Social Network

This repository contains a social network web application with separate frontend and backend services.

- `backend/` - Spring Boot backend using Java 21, Spring Boot 4, Flyway, SQLite, WebSocket, and Spring Security.
- `frontend/` - Next.js frontend using React 19, Tailwind CSS, and a simple auth context.
- `docker-compose.yml` - optional Docker Compose setup for both services.

## Prerequisites

Choose one of the following environments depending on your setup.

### Recommended: Docker (Linux or Windows)

- Docker Desktop or Docker Engine installed
- Docker Compose available

### Manual install

#### Linux

- Node.js 20+ / npm 10+
- Java 21
- Git

#### Windows

- Node.js 20+ / npm 10+
- Java 21
- Git
- PowerShell or Command Prompt

> The backend includes the Maven wrapper (`mvnw` and `mvnw.cmd`), so you do not need a separate Maven installation if you use the wrapper.

## Install and run the full project

### Option 1: Docker Compose (best for new machines)

From the repository root:

```bash
docker compose up --build
```

This builds and starts both services:

- Backend on `http://localhost:8080`
- Frontend on `http://localhost:3000`

Press `Ctrl+C` to stop the services, or use `docker compose down`.

### Option 2: Manual install

#### Backend

1. Open a terminal in `backend`
2. Run the backend:

Linux/macOS:

```bash
./mvnw spring-boot:run
```

Windows PowerShell / Command Prompt:

```powershell
mvnw.cmd spring-boot:run
```

By default, the backend listens on `http://localhost:8080`.

#### Frontend

1. Open a terminal in `frontend`
2. Install dependencies:

```bash
npm install
```

3. Create or update `frontend/.env.local` if needed:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

4. Start the frontend:

```bash
npm run dev
```

5. Open the frontend in your browser:

```text
http://localhost:3000
```

## Notes

- The frontend expects the backend API at `http://localhost:8080` unless you change `NEXT_PUBLIC_API_URL`.
- The backend stores data in a Docker volume when using Docker Compose.
- If you run manually, the backend uses the `data/` directory under `backend` for SQLite and Flyway migrations.

## Useful commands

From the repository root:

- `docker compose up --build` - build and run both services with Docker
- `docker compose down` - stop Docker services

Frontend:

- `npm run dev` - start frontend development server
- `npm run build` - build frontend
- `npm run start` - run built frontend
- `npm run lint` - run lint checks

Backend:

- `./mvnw spring-boot:run` or `mvnw.cmd spring-boot:run` - run backend
- `./mvnw test` or `mvnw.cmd test` - run backend tests

## Files and folders not required in Git

These are generated or local-only files and should not be committed:

- `frontend/.next/`
- `frontend/node_modules/`
- `backend/target/`
- `frontend/.env.local`
- `backend/.mvn/wrapper/*` is included already; do not remove it if you need the Maven wrapper.

## Tips for another PC

- Clone the repository with Git.
- If using Docker, `docker compose up --build` is the fastest way to get the app running.
- If installing manually, make sure Java 21 and Node.js 20+ are installed first.
- On Windows, use `mvnw.cmd` in the backend and PowerShell or Command Prompt for commands.
