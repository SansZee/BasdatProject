package main

import (
	"film-dashboard-api/internal/config"
	"film-dashboard-api/internal/database"
	"film-dashboard-api/internal/repository"
	"film-dashboard-api/internal/utils"
	"fmt"
	"log"
)

func main() {
	fmt.Println("=== Testing User Repository ===\n")

	// 1. Load config & connect database
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	db, err := database.Connect(cfg.GetConnectionString())
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}
	defer db.Close()

	// 2. Bikin instance repository
	userRepo := repository.NewUserRepository(db)

	// 3. Test CreateUser
	fmt.Println("Test 1: Create New User")
	password := "TestPassword123!"
	passwordHash, err := utils.HashPassword(password)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	user, err := userRepo.CreateUser(
		"testuser123",
		"test2@example.com",
		passwordHash,
		"Test User",
	)

	if err != nil {
		fmt.Println("Create user failed:", err)
	} else {
		fmt.Println(" User created successfully!")
		fmt.Printf("   User ID: %d\n", user.UserID)
		fmt.Printf("   Username: %s\n", user.Username)
		fmt.Printf("   Email: %s\n", user.Email)
		fmt.Printf("   Role: %s\n", user.RoleName)
	}

	// 4. Test GetUserByUsername
	fmt.Println("\nTest 2: Get User by Username")
	fetchedUser, err := userRepo.GetUserByUsername("testuser123")
	if err != nil {
		fmt.Println("Get user failed:", err)
	} else {
		fmt.Println("User found!")
		fmt.Printf("   User ID: %d\n", fetchedUser.UserID)
		fmt.Printf("   Username: %s\n", fetchedUser.Username)
		fmt.Printf("   Role: %s\n", fetchedUser.RoleName)
		
		// Verify password
		isValid := utils.CheckPassword(password, fetchedUser.PasswordHash)
		fmt.Printf("   Password valid: %v\n", isValid)
	}

	// 5. Test GetUserByID
	if user != nil {
		fmt.Println("\nTest 3: Get User by ID")
		userByID, err := userRepo.GetUserByID(user.UserID)
		if err != nil {
			fmt.Println("Get user by ID failed:", err)
		} else {
			fmt.Println("User found by ID!")
			fmt.Printf("   Username: %s\n", userByID.Username)
		}

		// 6. Test UpdateLastLogin
		fmt.Println("\nTest 4: Update Last Login")
		err = userRepo.UpdateLastLogin(user.UserID)
		if err != nil {
			fmt.Println("Update last login failed:", err)
		} else {
			fmt.Println("Last login updated!")
		}
	}

	fmt.Println("\n=== All Repository Tests Completed ===")
}