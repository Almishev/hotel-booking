#!/bin/bash

# Deployment script for Hetzner server
# This script is executed by GitHub Actions

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /root/hotel-booking

# Note: git pull is done in workflow before executing this script
# This ensures deploy.sh exists before we try to run it

# Stop old containers
echo "🛑 Stopping old containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml down || true

# Build and start new containers
echo "🔨 Building and starting new containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check container status
echo "📊 Container status:"
docker compose ps

# Check if containers are healthy
echo "🏥 Health check:"
if docker compose ps | grep -q "unhealthy"; then
    echo "⚠️  Warning: Some containers are unhealthy"
    docker compose logs --tail=50
    exit 1
else
    echo "✅ All containers are healthy!"
fi

echo "✅ Deployment completed successfully!"

