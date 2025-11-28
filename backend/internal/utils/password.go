package utils

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword mengubah password plain text menjadi hash
// Menggunakan bcrypt dengan cost 10 (balance antara security & performance)
func HashPassword(password string) (string, error) {
	// bcrypt.GenerateFromPassword akan:
	// 1. Generate random salt
	// 2. Hash password dengan salt tersebut
	// 3. Return hasil hash sebagai []byte
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	// Convert []byte ke string
	return string(hashedBytes), nil
}

// CheckPassword membandingkan password plain text dengan hash
// Return true jika match, false jika tidak match
func CheckPassword(password, hash string) bool {
	// bcrypt.CompareHashAndPassword akan:
	// 1. Extract salt dari hash
	// 2. Hash password dengan salt yang sama
	// 3. Compare hasil hash dengan hash yang ada
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	
	// Kalau err == nil, berarti password cocok
	return err == nil
}