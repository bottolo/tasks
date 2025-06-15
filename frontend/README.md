# Frontend Setup Guide

## Prerequisites

- **Bun** (v1.2.16+): [Download from bun.sh](https://bun.sh)
- **Docker** (for containerization): [Download from docker.com](https://docker.com)
- **Git**: [Download from git-scm.com](https://git-scm.com)

## Local Development

### 1. Clone and Install
```bash
# Clone the repository
git clone https://github.com/bottolo/tasks.git
cd frontend

# Install dependencies
bun install
```

### 2. Start Development Server
```bash
# Run development server
bun dev
```
The app will be available at `http://localhost:5173`

### 3. Available Scripts
```bash
bun run build      # Build for production
bun run lint       # Run ESLint
bun run preview    # Preview production build
bun run test       # Run tests with Vitest
```

## Docker Setup

### Option 1: Using Docker Compose (Recommended)
```bash
# Build and run the container
docker-compose up --build

# Run in background
docker-compose up -d --build
```
The app will be available at `http://localhost:5173`

### Option 2: Using Docker Directly
```bash
# Build the image
docker build -t fiscotasks .

# Run the container
docker run -p 5173:80 fiscotasks
```

### Stop the Application
```bash
# Docker Compose
docker-compose down

# Docker directly
docker stop <container-id>
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # shadcn/ui or custom components
│   ├── routes/         # React Router routes (I have treated them as file-based routes)
│   ├── stores/         # Zustand stores
│   ├── api/           # API layer
│   ├── lib/           # Utilities
│   └── types/         # TypeScript types
├── public/            # Static assets
└── dist/              # Production build output
```

## Technologies Used

- **React 19** with TypeScript
- **Vite** for build tooling
- **Bun** for package management
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Tanstack Query** for data fetching
- **React Router** for routing
- **shadcn/ui** for accessible, plug and play components

For more information on the technologies used, refer to the [package.json](../frontend/package.json).

## Platform-Specific Notes

### Windows
- Use PowerShell or WSL2 for best experience
- Ensure Docker Desktop is running

### macOS
- Install Bun via Homebrew: `brew install bun`
- Docker Desktop required for containerization

### Linux
- Install Bun via curl: `curl -fsSL https://bun.sh/install | bash`
- Install Docker Engine or Docker Desktop
