#!/bin/bash

# Deployment script for Google Drive CDN Worker
# This script configures Cloudflare secrets and deploys the worker

set -e

echo "🚀 Deploying Google Drive CDN Worker..."
echo ""

# Extract values from files
CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
REFRESH_TOKEN=$(cat temp/oauth-tokens.json | grep -o '"refresh_token": "[^"]*"' | cut -d'"' -f4 || echo "YOUR_REFRESH_TOKEN")
FOLDER_ID="YOUR_DRIVE_FOLDER_ID"

echo "📋 Configuration:"
echo "  - Client ID: ${CLIENT_ID:0:20}..."
echo "  - Folder ID: $FOLDER_ID"
echo ""

# Configure secrets
echo "🔐 Setting Cloudflare secrets..."

echo "$CLIENT_ID" | npx wrangler secret put GOOGLE_CLIENT_ID
echo "$CLIENT_SECRET" | npx wrangler secret put GOOGLE_CLIENT_SECRET  
echo "$REFRESH_TOKEN" | npx wrangler secret put GOOGLE_REFRESH_TOKEN

echo ""
echo "✅ Secrets configured successfully!"
echo ""

# Deploy
echo "📦 Deploying worker..."
npx wrangler deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Your CDN is now live and files should load properly."
