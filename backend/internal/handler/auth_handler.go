package handler

import (
	"encoding/json"
	"net/http"

	"film-dashboard-api/internal/middleware"
	"film-dashboard-api/internal/service"
	"film-dashboard-api/internal/utils"
)

// AuthHandler adalah struct yang berisi semua handler untuk authentication
type AuthHandler struct {
	authService *service.AuthService
}

// NewAuthHandler adalah constructor untuk bikin instance AuthHandler
func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Register adalah handler untuk endpoint POST /api/auth/register
// Terima: JSON body dengan username, email, password, full_name
// Return: User data & JWT token
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	// 1. Handle CORS preflight OPTIONS request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Pastikan method adalah POST
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 3. Parse JSON request body ke struct RegisterRequest
	var req service.RegisterRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// 4. Call service untuk process registration
	response, err := h.authService.Register(req)
	if err != nil {
		// Service akan return error dengan message yang descriptive
		// Error bisa karena: validation failed, username duplicate, dll
		utils.WriteError(w, http.StatusBadRequest, err.Error(), err)
		return
	}

	// 5. Return success response
	utils.WriteSuccess(w, "Registration successful", response)
}

// Login adalah handler untuk endpoint POST /api/auth/login
// Terima: JSON body dengan username & password
// Return: User data & JWT token
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	// 1. Handle CORS preflight OPTIONS request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Pastikan method adalah POST
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 3. Parse JSON request body
	var req service.LoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// 4. Call service untuk authentication
	response, err := h.authService.Login(req)
	if err != nil {
		// Error bisa karena: invalid credentials, user inactive, dll
		utils.WriteError(w, http.StatusUnauthorized, err.Error(), err)
		return
	}

	// 5. Set JWT token di httpOnly cookie (secure against XSS)
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    response.Token,
		Path:     "/",
		HttpOnly: true,            // Tidak bisa diakses dari JavaScript (XSS protection)
		Secure:   true,            // Hanya dikirim via HTTPS
		SameSite: http.SameSite(3), // Lax mode - CSRF protection
		MaxAge:   24 * 60 * 60,    // 24 hours
	})

	// 6. Return success response dengan user data (tanpa token di response body)
	utils.WriteSuccess(w, "Login successful", response.User)
}

// GetProfile adalah handler untuk endpoint GET /api/auth/profile
// Protected route - butuh JWT token
// Return: User profile (current logged in user)
func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	// 1. Handle CORS preflight OPTIONS request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Pastikan method adalah GET
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 3. Get user dari context (di-set oleh Auth middleware)
	user, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "User not found", nil)
		return
	}

	// 4. Convert User ke UserResponse (hide sensitive data)
	userResponse := user.ToResponse()

	// 5. Return user profile
	utils.WriteSuccess(w, "Profile retrieved successfully", userResponse)
}

// Logout adalah handler untuk endpoint POST /api/auth/logout
// Protected route - butuh JWT token
// Clears httpOnly cookie di client
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// 1. Handle CORS preflight OPTIONS request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Pastikan method adalah POST
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 3. Clear httpOnly cookie dengan set MaxAge = -1
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSite(3), // Lax mode
		MaxAge:   -1, // Delete cookie
	})

	// 4. Return success response
	utils.WriteSuccess(w, "Logout successful", nil)
}