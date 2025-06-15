# Backend Setup Guide

## Prerequisites

- **Ruby 3.4**: [Download from ruby-lang.org](https://ruby-lang.org) or use version manager
- **PostgreSQL**: [Download from postgresql.org](https://postgresql.org)
- **Docker** (for containerization): [Download from docker.com](https://docker.com)
- **Git**: [Download from git-scm.com](https://git-scm.com)
- **Mise** (optional, for version management): [Install from mise.jdx.dev](https://mise.jdx.dev)

## Version Management with Mise (Recommended)

Run:
```bash
# Install mise
curl https://mise.jdx.dev/install.sh | sh

# Install specified versions
mise install

# Activate versions for this project
mise use
```

## Local Development

### 1. Setup Environment
```bash
# Clone the repository
git clone https://github.com/bottolo/tasks.git
cd backend

# Install Ruby dependencies
bundle install

# Setup database
rails db:create
rails db:migrate
rails db:seed
```

### 2. Start Development Server
```bash
# Run Rails server
rails server

# Or use the custom dev script
bin/dev
```
The API will be available at `http://localhost:3000`

### 3. Available Scripts
```bash
rails server           # Start development server
rails console          # Interactive Rails console
rails generate         # Generate scaffolds, models, etc.
rails db:migrate        # Run database migrations
rails db:rollback       # Rollback last migration
rails db:reset          # Drop, create, migrate, and seed
rails test             # Run test suite
bin/rubocop            # Run code linting
bin/brakeman           # Security analysis
```

## Docker Setup

### Option 1: Using Docker Compose (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Run database migrations
docker-compose run migrate
```

### Option 2: Individual Services
```bash
# Start only the database
docker-compose up db

# Build and run the app (after db is running)
docker-compose up app
```

The API will be available at `http://localhost:3000`

### Database Management
```bash
# Run migrations
docker-compose run app rails db:migrate

# Access Rails console
docker-compose run app rails console

# Access database directly
docker-compose exec db psql -U postgres -d tasks_development
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Project Structure

```
backend/
├── app/
│   ├── controllers/    # API controllers
│   ├── models/         # ActiveRecord models
│   ├── jobs/          # Background jobs
│   ├── mailers/       # Email templates
│   └── views/         # View templates (if any)
├── config/
│   ├── routes.rb      # API routes
│   ├── database.yml   # Database configuration
│   └── environments/  # Environment configs
├── db/
│   ├── migrate/       # Database migrations
│   └── schema.rb      # Current database schema
├── test/              # Test suite
├── bruno/             # API testing collection
└── bin/               # Executable scripts
```

## Environment Variables

The application uses these environment variables:
```bash
RAILS_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/tasks_development
RAILS_MASTER_KEY=ae440dac1d45e6769056e81121b3afac
```

## Technologies Used

- **Rails 8.0.2** with Ruby 3.4
- **PostgreSQL 16** for database
- **Puma** web server
- **Solid Cache/Queue/Cable** for caching and background jobs
- **Rack CORS** for cross-origin requests
- **Kamal** for deployment
- **Bruno** for API testing

## API Testing

There is a collection under the `bruno/` directory for API testing. 
[Install bruno](https://docs.usebruno.com/get-started/bruno-basics/download) to test the API endpoints.

## Platform-Specific Notes

### Windows
- Use WSL2 for best experience
- Install PostgreSQL via installer or use Docker
- Ensure Docker Desktop is running

### macOS
- Install Ruby via Homebrew: `brew install ruby@3.4`
- Install PostgreSQL: `brew install postgresql@16`
- Use Mise: `brew install mise`

### Linux
- Install Ruby via package manager or build from source
- Install PostgreSQL via package manager
- Use Mise: `curl https://mise.jdx.dev/install.sh | sh`

## Development Tips

- Use `bin/dev` for enhanced development experience
- Check logs with `tail -f log/development.log`
- Use `rails credentials:edit` to manage secrets
- Run `bin/rubocop -A` to auto-fix code style issues
