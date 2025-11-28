package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/microsoft/go-mssqldb" // SQL Server driver
)

// DB adalah instance database global (nanti akan kita init di main)
var DB *sql.DB

// Connect membuat koneksi ke SQL Server database
func Connect(connectionString string) (*sql.DB, error) {
	// Buka koneksi ke database
	db, err := sql.Open("sqlserver", connectionString)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	// Set connection pool settings untuk performa optimal
	db.SetMaxOpenConns(25)                 // Maksimal 25 koneksi sekaligus
	db.SetMaxIdleConns(5)                  // Keep 5 koneksi idle
	db.SetConnMaxLifetime(5 * time.Minute) // Koneksi max 5 menit

	// Test koneksi - pastikan database benar-benar bisa diakses
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to database: %w", err)
	}

	fmt.Println("Successfully connected to SQL Server database!")

	// Set global DB variable
	DB = db

	return db, nil
}

// Close menutup koneksi database
func Close() error {
	if DB != nil {
		fmt.Println("Closing database connection...")
		return DB.Close()
	}
	return nil
}

// GetDB mengembalikan instance database
// Digunakan di layer repository untuk query
func GetDB() *sql.DB {
	return DB
}

// HealthCheck mengecek apakah database masih terhubung
func HealthCheck() error {
	if DB == nil {
		return fmt.Errorf("database connection is nil")
	}

	if err := DB.Ping(); err != nil {
		return fmt.Errorf("database ping failed: %w", err)
	}

	return nil
}