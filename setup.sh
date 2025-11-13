#!/bin/bash

# PiJukebox Setup Script
# Creates required directories and initializes database

set -e

echo "🔧 Setting up PiJukebox..."

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
  mkdir -p data
  echo "✅ Created data/ directory"
fi

# Initialize database if it doesn't exist
if [ ! -f "data/db.json" ]; then
  echo "{}" > data/db.json
  echo "✅ Initialized data/db.json"
fi

# Create music directory if it doesn't exist
if [ ! -d "static/music" ]; then
  mkdir -p static/music
  echo "✅ Created static/music/ directory"
fi

# Add .gitkeep to preserve empty directories
touch data/.gitkeep
touch static/music/.gitkeep

echo "✨ Setup complete!"
echo ""
echo "📁 Next steps:"
echo "   1. Add MP3 albums to static/music/ (each album in its own folder)"
echo "   2. Run 'bun run dev' to start the development server"
echo "   3. Visit http://localhost:5173/admin to manage RFID card mappings"
