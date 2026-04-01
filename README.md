# 🚀 Agile Project Management Platform

A full-stack, enterprise-grade **Agile project management solution** for tracking sprints, managing issues, and fostering team collaboration, designed with scalability, security, and developer experience in mind.

## 🖥 Tech Stack

### Frontend
- **Framework**: Nextjs (TypeScript)
- **UI**: TailwindCSS, Chadcn UI
- **API Integration**: Axios, React Query

### Backend
- **Primary API & Logic**: Python (Flask)
- **Real-time & Notifications**: Node.js (Express + Socket.io)
- **Database**: MongoDB
- **Caching & Performance**: Redis (Rate Limiting, Caching)
- **Containerization**: Docker & Docker Compose
- **Security**: JWT Authentication, Role-Based Access Control, Secure Coding Practices, Token and Authentication Management, 

---

## ✨ Core Features
- **Board & Sprint Management** — Organize work into sprints, track progress, and visualize workflows  
- **Issue Tracking** — Create, assign, and prioritize issues with real-time updates  
- **User Management** — Role-based permissions for Admins, Developers, and Viewers.
- **Work Log & History** — Maintain a transparent timeline of all changes and contributions. 
- **Cloud Deployment Ready** — Fully containerized for seamless deployment to platforms like Render, AWS, or DigitalOcean.

---

## 📦 Installation & Setup

### Prerequisites
Before you begin, ensure you have the following installed:
* [Git](https://git-scm.com/)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Recommended)
* [Node.js](https://nodejs.org/) & [Python 3.x](https://www.python.org/) (If running manually)

```bash
# Clone the repository
git clone [https://github.com/OMODON-ETEMI/agile-project-management.git](https://github.com/OMODON-ETEMI/agile-project-management.git)

cd agile-project-management
```

2. Environment Configuration
Create a .env file in the root directory. You will need to define the following variables (refer to the individual service folders for specific .env.example files):

MONGO_URI

JWT_SECRET_KEY

REDIS_HOST

REDIS_PORT

🐳 Method A: Run with Docker (Recommended)
The easiest way to spin up the infrastructure (Flask, Node, and Redis) is using Docker Compose.

```Bash
# Build and start all backend containers
docker-compose up --build

# To run in detached mode (background):
docker-compose up -d --build
Flask API: http://localhost:5000

Node/Socket API: http://localhost:4000

Redis: localhost:6379
```

Start the Frontend:
Once the containers are up, open a new terminal:

```Bash
cd frontend
npm install
npm run dev
```
💻 Method B: Manual Local Setup
If you prefer to run the services individually:

1. Start Redis
Ensure a local Redis instance is running on port 6379.

2. Backend (Flask Setup)
```Bash
cd Python
pip install -r requirements.txt
python app.py
```

3. Backend (Node Setup)
```Bash
cd Node
npm install
npm run dev
```

4. Frontend
```Bash
cd frontend
npm install
npm run dev
```

### Testing
🧪 Running Tests
To ensure the integrity of the Auth and Board logic, run the Pytest suite:
```Bash
cd Python
pytest
```

### One final tip:
Since your `docker.yml` uses the filename `Dockerfile.dev`, make sure your actual files in the `./Python` and `./Node` folders are named exactly `Dockerfile.dev`. 

If you decide to deploy to **Render** using Docker, Render usually looks for a file named just `Dockerfile`. You might want to create a standard `Dockerfile` for production in each folder, or tell Render specifically to use the `.dev` one in the settings!