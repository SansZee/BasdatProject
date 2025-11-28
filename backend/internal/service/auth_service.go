package service

import (
	"errors"
	"fmt"

	"film-dashboard-api/internal/models"
	"film-dashboard-api/internal/repository"
	"film-dashboard-api/internal/utils"
)

// AuthService adalah service untuk handle authentication & authorization
type AuthService struct {
	userRepo  *repository.UserRepository
	jwtSecret string
	jwtExpiry int
}

// NewAuthService adalah constructor untuk bikin instance AuthService
// Parameter:
// - userRepo: Repository untuk operasi database user
// - jwtSecret: Secret key untuk sign JWT token (dari config)
// - jwtExpiry: Berapa jam token valid (dari config)
func NewAuthService(userRepo *repository.UserRepository, jwtSecret string, jwtExpiry int) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
		jwtExpiry: jwtExpiry,
	}
}

// RegisterRequest adalah struktur data untuk request registration
type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
}

// LoginRequest adalah struktur data untuk request login
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// AuthResponse adalah struktur data untuk response authentication (register & login)
type AuthResponse struct {
	User  models.UserResponse `json:"user"`
	Token string              `json:"token"`
}

// Register melakukan registrasi user baru
// Business logic:
// 1. Validate input (username, email, password tidak boleh kosong)
// 2. Validate format email
// 3. Validate password strength (minimal 8 karakter)
// 4. Hash password dengan bcrypt
// 5. Create user di database (otomatis role native_user)
// 6. Generate JWT token
// 7. Return user data & token
func (s *AuthService) Register(req RegisterRequest) (*AuthResponse, error) {
	// 1. Validate input tidak boleh kosong
	if req.Username == "" {
		return nil, errors.New("username is required")
	}
	if req.Email == "" {
		return nil, errors.New("email is required")
	}
	if req.Password == "" {
		return nil, errors.New("password is required")
	}
	if req.FullName == "" {
		return nil, errors.New("full name is required")
	}

	// 2. Validate username length (minimal 3 karakter)
	if len(req.Username) < 3 {
		return nil, errors.New("username must be at least 3 characters")
	}

	// 3. Validate email format (simple check)
	// Bisa pakai regex untuk validasi lebih detail
	if !contains(req.Email, "@") || !contains(req.Email, ".") {
		return nil, errors.New("invalid email format")
	}

	// 4. Validate password strength (minimal 8 karakter)
	if len(req.Password) < 8 {
		return nil, errors.New("password must be at least 8 characters")
	}

	// 5. Hash password dengan bcrypt
	passwordHash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// 6. Create user di database melalui repository
	user, err := s.userRepo.CreateUser(req.Username, req.Email, passwordHash, req.FullName)
	if err != nil {
		// Error bisa karena username/email duplicate
		// Repository akan return error message yang descriptive
		return nil, err
	}

	// 7. Generate JWT token untuk user yang baru dibuat
	token, err := utils.GenerateToken(
		user.UserID,
		user.Username,
		user.RoleID,
		user.RoleName,
		s.jwtSecret,
		s.jwtExpiry,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	// 8. Convert User ke UserResponse (hide password)
	userResponse := user.ToResponse()

	// 9. Return response dengan user data & token
	return &AuthResponse{
		User:  userResponse,
		Token: token,
	}, nil
}

// Login melakukan authentication user
// Business logic:
// 1. Validate input (username & password tidak boleh kosong)
// 2. Get user dari database by username
// 3. Verify password dengan bcrypt
// 4. Check apakah user aktif (is_active = true)
// 5. Generate JWT token
// 6. Update last_login timestamp
// 7. Return user data & token
func (s *AuthService) Login(req LoginRequest) (*AuthResponse, error) {
	// 1. Validate input
	if req.Username == "" {
		return nil, errors.New("username is required")
	}
	if req.Password == "" {
		return nil, errors.New("password is required")
	}

	// 2. Get user dari database by username
	user, err := s.userRepo.GetUserByUsername(req.Username)
	if err != nil {
		// Jangan kasih tau detail error (security)
		// Jangan bilang "user not found" atau "password wrong"
		// Cukup bilang "invalid credentials" untuk keduanya
		return nil, errors.New("invalid username or password")
	}

	// 3. Verify password dengan bcrypt
	isPasswordValid := utils.CheckPassword(req.Password, user.PasswordHash)
	if !isPasswordValid {
		// Password salah - return error yang sama dengan user not found
		return nil, errors.New("invalid username or password")
	}

	// 4. Check apakah user aktif
	if !user.IsActive {
		return nil, errors.New("account is inactive. please contact administrator")
	}

	// 5. Generate JWT token
	token, err := utils.GenerateToken(
		user.UserID,
		user.Username,
		user.RoleID,
		user.RoleName,
		s.jwtSecret,
		s.jwtExpiry,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	// 6. Update last_login timestamp (async - tidak perlu tunggu)
	// Kalau error, kita ignore saja (not critical)
	go func() {
		_ = s.userRepo.UpdateLastLogin(user.UserID)
	}()

	// 7. Convert User ke UserResponse (hide password & sensitive data)
	userResponse := user.ToResponse()

	// 8. Return response
	return &AuthResponse{
		User:  userResponse,
		Token: token,
	}, nil
}

// ValidateToken memvalidasi JWT token dan return user data
// Digunakan untuk verify token di middleware
func (s *AuthService) ValidateToken(tokenString string) (*models.User, error) {
	// 1. Validate token dengan JWT utils
	claims, err := utils.ValidateToken(tokenString, s.jwtSecret)
	if err != nil {
		return nil, errors.New("invalid or expired token")
	}

	// 2. Get user dari database by ID (untuk ensure user masih exist & aktif)
	user, err := s.userRepo.GetUserByID(claims.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// 3. Check apakah user masih aktif
	if !user.IsActive {
		return nil, errors.New("account is inactive")
	}

	// 4. Return user data
	return user, nil
}

// contains adalah helper function untuk check apakah string contains substring
// Digunakan untuk validasi email sederhana
func contains(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}