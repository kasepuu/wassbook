package sqlDB

import (
	"database/sql"
	"io/ioutil"
	"log"
)

var DataBase *sql.DB

func InitDatabase() {
	log.Println("Initializing database...")

	// open db file
	file, err := ioutil.ReadFile("database/database.sql")
	if err != nil {
		log.Println(err)
		return
	}

	_, errExec := DataBase.Exec(string(file))
	if errExec != nil {
		log.Println("Error executing SQL:", err)
		return
	}

	log.Println("Database initialized.")
}

func SessionCleanup() {
	DataBase.Exec("DELETE FROM session")
}
