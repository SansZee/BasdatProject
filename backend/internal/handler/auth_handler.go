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
	// 1. Pastikan method adalah POST
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 2. Parse JSON request body ke struct RegisterRequest
	var req service.RegisterRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// 3. Call service untuk process registration
	response, err := h.authService.Register(req)
	if err != nil {
		// Service akan return error dengan message yang descriptive
		// Error bisa karena: validation failed, username duplicate, dll
		utils.WriteError(w, http.StatusBadRequest, err.Error(), err)
		return
	}

	// 4. Return success response
	utils.WriteSuccess(w, "Registration successful", response)
}

// Login adalah handler untuk endpoint POST /api/auth/login
// Terima: JSON body dengan username & password
// Return: User data & JWT token
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	// 1. Pastikan method adalah POST
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 2. Parse JSON request body
	var req service.LoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// 3. Call service untuk authentication
	response, err := h.authService.Login(req)
	if err != nil {
		// Error bisa karena: invalid credentials, user inactive, dll
		utils.WriteError(w, http.StatusUnauthorized, err.Error(), err)
		return
	}

	// 4. Return success response dengan user data & token
	utils.WriteSuccess(w, "Login successful", response)
}

// GetProfile adalah handler untuk endpoint GET /api/auth/profile
// Protected route - butuh JWT token
// Return: User profile (current logged in user)
func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	// 1. Pastikan method adalah GET
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 2. Get user dari context (di-set oleh Auth middleware)
	user, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "User not found", nil)
		return
	}

	// 3. Convert User ke UserResponse (hide sensitive data)
	userResponse := user.ToResponse()

	// 4. Return user profile
	utils.WriteSuccess(w, "Profile retrieved successfully", userResponse)
}