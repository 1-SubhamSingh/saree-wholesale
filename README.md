# saree-wholesale

Full-stack project for saree wholesale web application.

## Tech Stack
- **Frontend**: React, Vite, JavaScript, Tailwind CSS, Axios, React Router DOM
- **Backend**: Java 11, Spring Boot (2.7.x), Maven, Spring Data MongoDB, Spring Web, Validation, Lombok
- **Database**: MongoDB

## Folder Structure
```text
saree-wholesale/
├── frontend/          # Vite + React application
├── backend/           # Spring Boot Java 11 application
├── .gitignore         # Git ignore configuration
└── README.md          # Project documentation
```

## Setup & Running

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
- **Prerequisites**: Java 11+, Maven 3.6+, MongoDB running locally (default `mongodb://localhost:27017/saree_wholesale`) or configured via `MONGODB_URI` environment variable.
- **Run server**:
  ```bash
  cd backend
  mvn spring-boot:run
  ```
- **Local URL**: `http://localhost:8080`
