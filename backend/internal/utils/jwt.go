package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims adalah struktur data yang akan disimpan dalam JWT token
// jwt.RegisteredClaims berisi field standard seperti exp (expiration), iat (issued at)
type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	RoleID   int    `json:"role_id"`
	RoleName string `json:"role_name"`
	jwt.RegisteredClaims
}

// GenerateToken membuat JWT token baru untuk user
// Parameter:
// - userID: ID user dari database
// - username: Username user
// - roleID: Role ID user
// - roleName: Nama role (native_user, executive, production)
// - secretKey: Secret key untuk sign token (dari config)
// - expirationHours: Token valid untuk berapa jam
func GenerateToken(userID int, username string, roleID int, roleName string, secretKey string, expirationHours int) (string, error) {
	// Set expiration time
	expirationTime := time.Now().Add(time.Duration(expirationHours) * time.Hour)

	// Buat claims (payload) untuk token
	claims := &Claims{
		UserID:   userID,
		Username: username,
		RoleID:   roleID,
		RoleName: roleName,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	// Buat token dengan signing method HS256 dan claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign token dengan secret key
	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken memverifikasi JWT token dan return claims-nya
// Return claims jika token valid, return error jika token invalid
func ValidateToken(tokenString string, secretKey string) (*Claims, error) {
	// Parse token
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(secretKey), nil
	})

	// Check parsing error
	if err != nil {
		return nil, err
	}

	// Extract claims dari token
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}