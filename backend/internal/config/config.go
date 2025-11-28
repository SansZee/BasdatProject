package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config menyimpan semua konfigurasi aplikasi
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	CORS     CORSConfig
}

// ServerConfig untuk konfigurasi server
type ServerConfig struct {
	Port        string
	Host        string
	Environment string
}

// DatabaseConfig untuk konfigurasi database SQL Server
type DatabaseConfig struct {
	Server   string
	Port     int
	User     string
	Password string
	Database string
}

// JWTConfig untuk konfigurasi JSON Web Token
type JWTConfig struct {
	Secret                string
	ExpirationHours       int
	RefreshExpirationDays int
}

// CORSConfig untuk konfigurasi Cross-Origin Resource Sharing
type CORSConfig struct {
	AllowedOrigins string
}

// Load membaca environment variables dan return Config
func Load() (*Config, error) {
	// Load .env file (kalau ada)
	// Error di-ignore karena .env opsional (bisa pakai system env vars)
	_ = godotenv.Load()

	// Parse DB_PORT dari string ke int
	dbPort, err := strconv.Atoi(getEnv("DB_PORT", "1433"))
	if err != nil {
		return nil, fmt.Errorf("invalid DB_PORT: %v", err)
	}

	// Parse JWT expiration
	jwtExpHours, err := strconv.Atoi(getEnv("JWT_EXPIRATION_HOURS", "24"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_EXPIRATION_HOURS: %v", err)
	}

	jwtRefreshDays, err := strconv.Atoi(getEnv("JWT_REFRESH_EXPIRATION_DAYS", "7"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_REFRESH_EXPIRATION_DAYS: %v", err)
	}

	config := &Config{
		Server: ServerConfig{
			Port:        getEnv("SERVER_PORT", "8080"),
			Host:        getEnv("SERVER_HOST", "localhost"),
			Environment: getEnv("ENVIRONMENT", "development"),
		},
		Database: DatabaseConfig{
			Server:   getEnv("DB_SERVER", ""),
			Port:     dbPort,
			User:     getEnv("DB_USER", ""),
			Password: getEnv("DB_PASSWORD", ""),
			Database: getEnv("DB_NAME", ""),
		},
		JWT: JWTConfig{
			Secret:                getEnv("JWT_SECRET", ""),
			ExpirationHours:       jwtExpHours,
			RefreshExpirationDays: jwtRefreshDays,
		},
		CORS: CORSConfig{
			AllowedOrigins: getEnv("ALLOWED_ORIGINS", "http://localhost:3000"),
		},
	}

	// Validasi konfigurasi penting
	if err := config.Validate(); err != nil {
		return nil, err
	}

	return config, nil
}

// Validate melakukan validasi terhadap konfigurasi
func (c *Config) Validate() error {
	if c.Database.Password == "" {
		return fmt.Errorf("DB_PASSWORD is required")
	}

	if c.JWT.Secret == "" {
		fmt.Println("WARNING: Using default JWT secret. Please change it in production!")
	}

	return nil
}

// GetConnectionString membuat connection string untuk SQL Server
func (c *Config) GetConnectionString() string {
	// Format connection string untuk go-mssqldb:
	// sqlserver://username:password@host:port?database=dbname
	return fmt.Sprintf(
		"server=%s;user id=%s;password=%s;port=%d;database=%s;encrypt=disable",
		c.Database.Server,
		c.Database.User,
		c.Database.Password,
		c.Database.Port,
		c.Database.Database,
	)
}

// getEnv adalah helper function untuk ambil env variable dengan default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
