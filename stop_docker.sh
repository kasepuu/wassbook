#!/bin/bash

echo "Stopping containers"
docker-compose down

echo "Removing docker images"
docker rmi frontend backend
docker rmi frontend backend

echo "Docker images removed"