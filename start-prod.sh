#!/bin/bash

# Production startup script
# This script starts the application in production mode

echo "🚀 Starting production environment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production from .env.example"
    exit 1
fi

# Copy production environment variables
echo "📋 Copying production environment variables..."
cp .env.production .env

# Validate critical environment variables
echo "🔍 Validating environment variables..."
if [ -z "$NEXT_PUBLIC_API_URL" ] || [ -z "$JWT_SECRET" ] || [ -z "$POSTGRES_PASSWORD" ]; then
    echo "⚠️  Warning: Some critical environment variables may be missing"
    echo "Please check your .env.production file"
    echo "Required: NEXT_PUBLIC_API_URL, JWT_SECRET, POSTGRES_PASSWORD"
fi

# Start services with production configuration
echo "🐳 Starting Docker containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Wait a moment for services to start
sleep 5

# Check if containers are running
if docker compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Production environment started successfully!"
    echo ""
    echo "📍 Services available at:"
    echo "   HTTP:  http://$(hostname -I | awk '{print $1}')"
    echo "   HTTPS: https://$(hostname -I | awk '{print $1}') (if SSL configured)"
    echo ""
    echo "📊 View logs: docker compose logs -f"
    echo "🛑 Stop:      docker compose down"
    echo ""
    echo "⚠️  Remember to:"
    echo "   - Configure SSL/TLS certificates"
    echo "   - Update CORS_ALLOWED_ORIGINS with your domain"
    echo "   - Use strong JWT_SECRET"
else
    echo "❌ Error: Some containers failed to start"
    echo "Check logs with: docker compose logs"
    exit 1
fi

