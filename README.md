# Social Network

A Facebook-like social network with followers, profiles, posts, groups, real-time chat, and notifications.

**Stack:** Next.js (frontend) · Spring Boot 4.1 (backend) · SQLite + Flyway (database) · Docker

---

## Prerequisites

You only need two things installed, since the whole app runs in Docker:

- **Docker Desktop** — [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
- **Git**

> **Windows users:** Docker Desktop requires virtualization (WSL2) to be enabled. If Docker Desktop shows a "virtualization support not detected" error, enable virtualization in your BIOS/UEFI settings, then run in an **admin PowerShell**:
> ```powershell
> dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
> dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
> wsl --update
> ```
> Restart your PC afterward.

---

## Installation & Setup

### Linux / macOS

```bash
git clone https://learn.zone01oujda.ma/git/relmallo/social-network
cd social-network
docker compose up --build
```

### Windows

Use **Git Bash** (installed with Git for Windows) rather than PowerShell/CMD — it behaves like Linux and avoids syntax mismatches with the commands below.

```bash
git clone https://learn.zone01oujda.ma/git/relmallo/social-network
cd social-network
docker compose up --build
```

### First run vs later runs

- **First run** takes several minutes — Docker downloads base images (Maven, JDK, Node) and compiles both apps from scratch.
- **Later runs**, if you haven't changed dependencies (`pom.xml` / `package.json`), are much faster:
  ```bash
  docker compose up          # fast, reuses cached build
  docker compose up --build  # only needed after changing code/dependencies
  ```
- **Stop everything:**
  ```bash
  docker compose down
  ```

Once running, open:
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8080](http://localhost:8080)

---

## Project Structure

```
social-network/
├── backend/                  # Spring Boot API
├── frontend/                 # Next.js app
└── docker-compose.yml        # Runs both containers together
```

### `backend/`

```
backend/
├── Dockerfile
├── pom.xml                                  # Maven dependencies & build config
├── src/main/java/com/example/socialnetwork/
│   ├── SocialNetworkApplication.java        # Entry point
│   ├── config/
│   │   ├── SecurityConfig.java              # Auth rules, password encoding, session policy
│   │   └── CorsConfig.java                  # Allows the frontend origin to call the API with cookies
│   ├── controller/
│   │   └── AuthController.java              # /api/auth/register, /login, /me, /logout
│   ├── entity/
│   │   └── User.java                        # JPA entity mapped to the `users` table
│   ├── repository/
│   │   └── UserRepository.java              # Data access for User (Spring Data JPA)
│   ├── dto/                                 # Request/response data shapes (empty — extend as needed)
│   ├── service/                             # Business logic layer (empty — extend as needed)
│   └── websocket/                           # WebSocket config & chat handlers (empty — extend as needed)
└── src/main/resources/
    ├── application.yml                      # Server port, datasource, Flyway, session config
    └── db/migration/sqlite/                 # Flyway migrations — one file per schema change
        ├── V1__create_users_table.sql
        ├── V2__create_follows_table.sql
        ├── V3__create_posts_table.sql
        ├── V4__create_post_allowed_viewers_table.sql
        ├── V5__create_comments_table.sql
        ├── V6__create_groups_table.sql
        ├── V7__create_group_members_table.sql
        ├── V8__create_events_table.sql
        ├── V9__create_event_responses_table.sql
        ├── V10__create_messages_table.sql
        ├── V11__create_group_messages_table.sql
        ├── V12__create_notifications_table.sql
        └── V13__create_indexes.sql
```

**How migrations work:** every time the backend starts, Flyway automatically runs any `.sql` file in `db/migration/sqlite/` that hasn't been applied yet, in order (`V1`, `V2`, `V3`...). You never run migrations manually — just add a new `V<next_number>__description.sql` file and restart the app.

### `frontend/`

```
frontend/
├── Dockerfile
├── package.json                  # npm dependencies & scripts
├── .env.local                    # NEXT_PUBLIC_API_URL=http://localhost:8080 (not committed to git)
├── app/
│   ├── layout.tsx                # Root layout, wraps the app in AuthProvider
│   ├── login/page.tsx            # Login page
│   └── register/page.tsx         # Registration page
├── context/
│   └── AuthContext.tsx           # Global auth state (current user, login, logout)
├── lib/
│   └── api.ts                    # Fetch wrapper that talks to the Spring Boot API
└── middleware.ts                 # Redirects unauthenticated users to /login
```

### Root

```
docker-compose.yml   # Defines the backend + frontend containers, ports, and shared volume
```

---

## How the pieces fit together

1. **Frontend (port 3000)** sends requests to **Backend (port 8080)** using `fetch(..., { credentials: "include" })`, so the session cookie is sent with every request.
2. **Backend** authenticates via Spring Security + session cookies (not JWT) — sessions are stored in the database via Spring Session JDBC, so a user stays logged in even if the backend restarts.
3. **Backend** talks to **SQLite**, stored in a Docker-managed volume (`db-data`) so data survives container restarts.
4. **Flyway** owns the database schema — all tables are created/updated through the migration files, never manually.

---

## Common Issues

| Problem | Fix |
|---|---|
| `docker compose up` fails with a Docker API/virtualization error | See the Windows note above — enable virtualization + WSL2, restart |
| `npm ci` fails inside the frontend build | Run `npm install` locally first to sync `package-lock.json`, commit it, then rebuild |
| Backend can't find the SQLite file (`path ... does not exist`) | Make sure `application.yml`'s datasource URL is `jdbc:sqlite:/data/social-network.db` (absolute path, matching the Docker volume) |
| `mkdir a b` fails in PowerShell | Use Git Bash instead, or run `mkdir a` then `mkdir b` separately |

---
