package main

import (
	"log"
	"os"
	"strconv"

	sqlDB "01.kood.tech/git/kasepuu/social-network/backend/database"
)

func main() {
	db, err := sqlDB.OpenDatabase()
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	defer db.Close()

	sqlDB.DataBase = db
	log.Println("[SERVER] New database created.")
	// Proceed with starting the server
	port := getPort()
	StartServer(port) // server
}

func getPort() string {
	serverPort := "8081" // 8081 port by default
	if len(os.Args) > 1 {
		port, err := strconv.Atoi(os.Args[1])
		if err == nil {
			serverPort = strconv.Itoa(port)
		}
	}
	return serverPort
}
