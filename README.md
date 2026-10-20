# saree-wholesale

Full-stack project for saree wholesale web application.

## Tech Stack
- **Frontend**: React, Vite, JavaScript, Tailwind CSS, Axios, React Router DOM, Nginx
- **Backend**: Java 21, Spring Boot 3.5.x, Maven, Spring Data MongoDB, Spring Web, Spring Security with JWT, Validation, Lombok
- **Database**: MongoDB 7.0
- **Containerization**: Docker, Docker Compose, Multi-stage builds, Nginx reverse proxy

## Folder Structure
```text
saree-wholesale/
├── frontend/             # Vite + React application with Nginx config & Dockerfile
│   ├── nginx.conf        # Nginx SPA & reverse proxy configuration
│   ├── Dockerfile        # Multi-stage Dockerfile (Node -> Nginx)
│   └── ...
├── backend/              # Spring Boot Java 21 application
│   ├── Dockerfile        # Multi-stage Dockerfile (Maven -> Temurin JRE 21)
│   └── ...
├── docker-compose.yml    # Root Docker Compose orchestration
├── .dockerignore         # Root Docker ignore rules
├── .gitignore            # Git ignore configuration
└── README.md             # Project documentation
```

---

## Running with Docker (Recommended)

### Prerequisites
- Docker Engine 20+ & Docker Compose v2+

### Quick Start

1. **Build and Start All Containers**
   ```bash
   docker compose up --build -d
   ```
   *(Default configuration and ports are pre-configured in `docker-compose.yml` to run out of the box).*

2. **Check Service Status**
   ```bash
   docker compose ps
   ```

3. **Access the Application**
   - **Frontend Web UI**: [http://localhost](http://localhost) (or port `80`)
   - **Backend API Direct**: [http://localhost:8080/api](http://localhost:8080/api)
   - **Backend Health Check**: [http://localhost:8080/api/health](http://localhost:8080/api/health)
   - **MongoDB Direct**: `localhost:27018` (mapped to internal `27017` to prevent collisions with any host MongoDB)

4. **View Logs**
   ```bash
   # Follow all logs
   docker compose logs -f

   # Follow specific service
   docker compose logs -f backend
   docker compose logs -f frontend
   docker compose logs -f mongodb
   ```

5. **Stop the Application**
   ```bash
   docker compose down
   ```
   To stop and remove persistent volumes (database and uploads):
   ```bash
   docker compose down -v
   ```

---

## Local Development (Without Docker)

### Frontend
- **Prerequisites**: Node.js v18+ / npm v9+
- **Run dev server**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- **Local URL**: `http://localhost:5173`

### Backend
- **Prerequisites**: Java 21+, Maven 3.9+, MongoDB running locally (default `mongodb://localhost:27017/saree_wholesale`) or configured via `MONGODB_URI` environment variable.
- **Run server**:
  ```bash
  cd backend
  mvn spring-boot:run
  ```
- **Local URL**: `http://localhost:8080`

---

## Features & Verification
- **JWT Admin Authentication**: Login at `/api/admin/login` or via Admin Portal `/admin/login`
- **Product Management & Pagination**: CRUD operations, filtering by category/fabric/occasion, active/featured flags
- **Enquiry System**: Customer enquiries and admin management
- **Image Uploads**: Uploaded product images are saved in persistent storage (`/app/uploads` volume in Docker) and served via `/api/uploads/**`
- **React Router SPA**: Handled by Nginx `try_files` fallback

---

## Continuous Integration (CI)

This repository includes a multi-job GitHub Actions CI workflow in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) that triggers on every push and pull request to `main`.

Each job has a `timeout-minutes` guard to prevent runaway builds.

### 1. Backend Tests & Build (`timeout: 20 min`)
- Spawns a dedicated **MongoDB 6** service container with health checks.
- Sets up **Java 21** (Eclipse Temurin) with Maven dependency caching (`actions/setup-java@v4`).
- Runs a **single Maven invocation** — `mvn clean package` — which compiles, runs all unit and Spring Boot integration tests, then packages the production JAR.
- CI credentials (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`) are read from GitHub repository secrets (`CI_ADMIN_USERNAME`, `CI_ADMIN_PASSWORD`, `CI_JWT_SECRET`). Safe CI-only fallback values are used when those secrets are not set. **Production credentials are never hardcoded.**

### 2. Frontend Lint, Tests & Build (`timeout: 15 min`)
- Sets up **Node.js 24** with npm cache (`actions/setup-node@v4`).
- Checks code quality with **Oxlint** (`npm run lint`).
- Runs frontend tests via `npm test` (which runs `node --test test/**/*.test.js` as defined in `package.json`). Currently covers `test/cataloguePagination.test.js`.
- Verifies production bundle builds cleanly (`npm run build`).

### 3. Docker Compose Build Verification (`timeout: 20 min`, runs after jobs 1 & 2)
- Validates `docker-compose.yml` syntax and config (`docker compose config`).
- Builds both multi-stage Docker images (`docker compose build`) to catch container regressions early.
