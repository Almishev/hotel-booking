#!/bin/bash

# Development startup script
# This script starts the application in development mode

echo "🚀 Starting development environment..."

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    echo "Please create .env.development from env.example"
    exit 1
fi

# Check if POSTGRES_PASSWORD is set
if ! grep -q "POSTGRES_PASSWORD=" .env.development || grep -q "POSTGRES_PASSWORD=YOUR" .env.development; then
    echo "⚠️  Warning: POSTGRES_PASSWORD not set in .env.development"
    echo "Please set a password for PostgreSQL"
fi

# Copy development environment variables
echo "📋 Copying development environment variables..."
cp .env.development .env

# Start services with development configuration
echo "🐳 Starting Docker containers..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Wait a moment for services to start
sleep 3

# Check if containers are running
if docker compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Development environment started successfully!"
    echo ""
    echo "📍 Services available at:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:8081"
    echo "   Nginx:    http://localhost:8080"
    echo ""
    echo "📊 View logs: docker compose logs -f"
    echo "🛑 Stop:      docker compose down"
else
    echo "❌ Error: Some containers failed to start"
    echo "Check logs with: docker compose logs"
    exit 1
fi

