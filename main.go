package main

import (
	"database/sql"
	"log"
	"os"
	"strconv"

	app "01.kood.tech/git/kasepuu/social-network/backend"
	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

func main() {
	dbFilePath := "database/database.db"
	if _, err := os.Stat(dbFilePath); os.IsNotExist(err) {
		// File does not exist, create a new database and populate it with data
		db, err := sql.Open("sqlite3", dbFilePath)
		if err != nil {
			log.Println("[SERVER] Error opening the database:", err)
			return
		}
		defer db.Close()

		sqlDB.DataBase = db
		sqlDB.InitDatabase()
		log.Println("[SERVER] New database created.")
	} else {
		// File exists, open the existing database
		db, err := sql.Open("sqlite3", dbFilePath)
		if err != nil {
			log.Println("[SERVER] Error opening the database:", err)
			return
		}
		defer db.Close()

		sqlDB.DataBase = db
		log.Println("[SERVER] Database found!")
	}

	// Proceed with starting the server
	port := getPort()
	app.StartServer(port) // server
}

func getPort() string {
	serverPort := "8080" // 8080 port by default
	if len(os.Args) > 1 {
		port, err := strconv.Atoi(os.Args[1])
		if err == nil {
			serverPort = strconv.Itoa(port)
		}
	}
	return serverPort
}
