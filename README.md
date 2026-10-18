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
├── .env.example          # Environment variables template
├── .dockerignore         # Root Docker ignore rules
├── .gitignore            # Git ignore configuration
└── README.md             # Project documentation
```

---

## Running with Docker (Recommended)

### Prerequisites
- Docker Engine 20+ & Docker Compose v2+

### Quick Start

1. **Configure Environment Variables (Optional)**
   Copy `.env.example` to `.env` if you wish to customize ports, credentials, or secrets:
   ```bash
   cp .env.example .env
   ```
   *(Default values are pre-configured in `docker-compose.yml` to run out of the box).*

2. **Build and Start All Containers**
   ```bash
   docker compose up --build -d
   ```

3. **Check Service Status**
   ```bash
   docker compose ps
   ```

4. **Access the Application**
   - **Frontend Web UI**: [http://localhost](http://localhost) (or port `80`)
   - **Backend API Direct**: [http://localhost:8080/api](http://localhost:8080/api)
   - **Backend Health Check**: [http://localhost:8080/api/health](http://localhost:8080/api/health)
   - **MongoDB Direct**: `localhost:27018` (mapped to internal `27017` to prevent collisions with any host MongoDB)

5. **View Logs**
   ```bash
   # Follow all logs
   docker compose logs -f

   # Follow specific service
   docker compose logs -f backend
   docker compose logs -f frontend
   docker compose logs -f mongodb
   ```

6. **Stop the Application**
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
