#!/bin/bash

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing dependencies..."
    npm install --prefix frontend/
    echo "Dependencies installed."
fi

npm start --prefix frontend