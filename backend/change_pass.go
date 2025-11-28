package main

import (
	"film-dashboard-api/internal/config"
	"film-dashboard-api/internal/database"
	"film-dashboard-api/internal/utils"
	"fmt"
	"log"
)

func main() {
	fmt.Println("=== Fixing Demo Users Password ===\n")

	// 1. Setup
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	db, err := database.Connect(cfg.GetConnectionString())
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}
	defer db.Close()

	// 2. Password yang mau di-set untuk semua demo users
	newPassword := "Demo123!"
	
	fmt.Printf("Setting password '%s' for all demo users...\n\n", newPassword)

	// 3. Hash password
	passwordHash, err := utils.HashPassword(newPassword)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	fmt.Println("Password hash generated:")
	fmt.Println(passwordHash)
	fmt.Println()

	// 4. Update setiap demo user
	demoUsers := []string{"native_demo", "exec_demo", "prod_demo"}

	for _, username := range demoUsers {
		fmt.Printf("Updating %s...\n", username)
		
		query := `UPDATE Users SET password_hash = @p1 WHERE username = @p2`
		result, err := db.Exec(query, passwordHash, username)
		
		if err != nil {
			fmt.Printf("❌ Failed to update %s: %v\n", username, err)
			continue
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected > 0 {
			fmt.Printf("✅ %s password updated successfully\n", username)
		} else {
			fmt.Printf("⚠️  %s not found in database\n", username)
		}
	}

	fmt.Println("\n=== All Demo Users Fixed ===")
	fmt.Println("You can now login with:")
	fmt.Println("  Username: native_demo | Password: Demo123!")
	fmt.Println("  Username: exec_demo   | Password: Demo123!")
	fmt.Println("  Username: prod_demo   | Password: Demo123!")
}