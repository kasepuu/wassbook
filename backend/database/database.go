package sqlDB

import (
	"database/sql"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3" // SQLite3 driver
)

var DataBase *sql.DB

func SessionCleanup() {
	DataBase.Exec("DELETE FROM session")
}

func OpenDatabase() (*sql.DB, error) {

	db, err := sql.Open("sqlite3", "backend/database/database.db")
	if err != nil {
		return nil, err
	}

	if dbIsEmpty(db) {
		err = MigrateDB(db)
		if err != nil {
			return nil, err
		}
	}

	return db, nil
}

func dbIsEmpty(db *sql.DB) bool {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		return true
	}
	return count == 0
}

func MigrateDB(db *sql.DB) error {
	driver, err := sqlite.WithInstance(db, &sqlite.Config{})
	if err != nil {
		return err
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://backend/database/migrations",
		"sqlite3", driver)
	if err != nil {
		return err
	}

	err = m.Up()
	if err != nil && err != migrate.ErrNoChange {
		return err
	}

	fmt.Println("Migrations applied successfully.")
	return nil
}
