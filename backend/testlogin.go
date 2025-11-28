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
	fmt.Println("=== Testing User Login ===\n")

	// 1. Setup - Load config & connect database
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

	// 3. Test data - sesuai dengan data di database kamu
	testCases := []struct {
		username string
		password string
		expected string // "success" atau "fail"
	}{
		// User dengan password hash yang belum proper (akan gagal)
		{"native_demo", "Demo123!", "fail"},
		{"exec_demo", "Demo123!", "fail"},
		{"prod_demo", "Demo123!", "fail"},
		
		// User yang kita bikin di test_repository (harusnya berhasil)
		{"testuser123", "TestPassword123!", "success"},
	}

	// 4. Test setiap case
	for i, tc := range testCases {
		fmt.Printf("Test Case %d: Login as '%s'\n", i+1, tc.username)
		fmt.Println("----------------------------------------")

		// Step 1: Get user dari database
		user, err := userRepo.GetUserByUsername(tc.username)
		if err != nil {
			fmt.Printf("❌ Failed to get user: %v\n\n", err)
			continue
		}

		fmt.Printf("✅ User found in database\n")
		fmt.Printf("   User ID: %d\n", user.UserID)
		fmt.Printf("   Username: %s\n", user.Username)
		fmt.Printf("   Email: %s\n", user.Email)
		fmt.Printf("   Role: %s\n", user.RoleName)
		fmt.Printf("   Is Active: %v\n", user.IsActive)

		// Step 2: Verify password
		fmt.Printf("\nVerifying password...\n")
		isPasswordValid := utils.CheckPassword(tc.password, user.PasswordHash)

		if isPasswordValid {
			fmt.Printf("✅ Password is VALID\n")

			// Step 3: Generate JWT token (simulasi login berhasil)
			token, err := utils.GenerateToken(
				user.UserID,
				user.Username,
				user.RoleID,
				user.RoleName,
				cfg.JWT.Secret,
				cfg.JWT.ExpirationHours,
			)

			if err != nil {
				fmt.Printf("❌ Failed to generate token: %v\n", err)
			} else {
				fmt.Printf("✅ JWT Token generated:\n")
				fmt.Printf("   %s\n", token)

				// Verify token (untuk memastikan token valid)
				claims, err := utils.ValidateToken(token, cfg.JWT.Secret)
				if err != nil {
					fmt.Printf("❌ Token validation failed: %v\n", err)
				} else {
					fmt.Printf("✅ Token validated successfully\n")
					fmt.Printf("   User ID from token: %d\n", claims.UserID)
					fmt.Printf("   Username from token: %s\n", claims.Username)
					fmt.Printf("   Role from token: %s\n", claims.RoleName)
				}
			}

			// Step 4: Update last login
			fmt.Printf("\nUpdating last login...\n")
			err = userRepo.UpdateLastLogin(user.UserID)
			if err != nil {
				fmt.Printf("❌ Failed to update last login: %v\n", err)
			} else {
				fmt.Printf("✅ Last login updated\n")
			}

			fmt.Printf("\n🎉 LOGIN SUCCESS for user '%s'\n", tc.username)
		} else {
			fmt.Printf("❌ Password is INVALID\n")
			fmt.Printf("\n❌ LOGIN FAILED for user '%s'\n", tc.username)
		}

		fmt.Println("========================================\n")
	}

	// 5. Bonus: Test login dengan user yang tidak ada
	fmt.Println("Bonus Test: Login with non-existent user")
	fmt.Println("----------------------------------------")
	_, err = userRepo.GetUserByUsername("nonexistentuser")
	if err != nil {
		fmt.Printf("✅ Correctly rejected: %v\n", err)
	} else {
		fmt.Printf("❌ Security issue: Non-existent user should not be found!\n")
	}

	fmt.Println("\n=== All Login Tests Completed ===")
}