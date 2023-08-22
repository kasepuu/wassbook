#!/bin/bash

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing dependencies..."
    npm install --prefix frontend/
    echo "Dependencies installed."
fi

# Start both frontend and backend servers concurrently
(
    echo "Starting frontend server..."
    npm start --prefix frontend
) & (
    
    echo "Starting backend server..."
    go run .
)

# Wait for both servers to finish
wait