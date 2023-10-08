#!/bin/bash
    echo "Installing dependencies..."
    npm install --prefix frontend/
    echo "Dependencies installed."
    
# Start both frontend and backend servers concurrently
(
    echo "Starting frontend server..."
    npm start --prefix frontend
) & (
    
    echo "Starting backend server..."
    go run ./backend/cmd
)

# Wait for both servers to finish
wait