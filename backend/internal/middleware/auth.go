package middleware

import (
	"context"
	"net/http"
	"strings"

	"film-dashboard-api/internal/models"
	"film-dashboard-api/internal/service"
	"film-dashboard-api/internal/utils"
)

// contextKey adalah type untuk context key (untuk avoid collision)
type contextKey string

// UserContextKey adalah key untuk store user data di context
const UserContextKey contextKey = "user"

// Auth adalah middleware untuk protect routes dengan JWT authentication
// Middleware ini akan:
// 1. Extract JWT token dari header Authorization
// 2. Validate token menggunakan AuthService
// 3. Store user data di context (untuk diakses di handler)
// 4. Reject request jika token invalid/missing
func Auth(authService *service.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// 1. Try to get token dari httpOnly cookie terlebih dahulu
			token := ""
			if cookie, err := r.Cookie("auth_token"); err == nil {
				token = cookie.Value
			}

			// 2. Fallback: get dari Authorization header (untuk backward compatibility)
			if token == "" {
				authHeader := r.Header.Get("Authorization")
				if authHeader != "" {
					// Format: "Bearer <token>"
					parts := strings.Split(authHeader, " ")
					if len(parts) == 2 && parts[0] == "Bearer" {
						token = parts[1]
					}
				}
			}

			// 3. Check apakah token ada
			if token == "" {
				utils.WriteError(w, http.StatusUnauthorized, "Missing authentication token", nil)
				return
			}

			// 4. Validate token menggunakan service
			user, err := authService.ValidateToken(token)
			if err != nil {
				utils.WriteError(w, http.StatusUnauthorized, "Invalid or expired token", err)
				return
			}

			// 5. Store user data di context
			// Context adalah cara di Go untuk pass data antar middleware & handler
			ctx := context.WithValue(r.Context(), UserContextKey, user)
			r = r.WithContext(ctx)

			// 6. Lanjut ke handler berikutnya
			next.ServeHTTP(w, r)
		})
	}
}

// GetUserFromContext adalah helper function untuk extract user dari context
// Digunakan di handler untuk get user yang sedang login
func GetUserFromContext(ctx context.Context) (*models.User, bool) {
	user, ok := ctx.Value(UserContextKey).(*models.User)
	return user, ok
}

// RequireRole adalah middleware untuk check role user
// Hanya user dengan role tertentu yang bisa akses endpoint
func RequireRole(allowedRoles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get user dari context (sudah di-set oleh Auth middleware)
			user, ok := GetUserFromContext(r.Context())
			if !ok {
				utils.WriteError(w, http.StatusUnauthorized, "User not found in context", nil)
				return
			}

			// Check apakah role user ada di allowed roles
			roleAllowed := false
			for _, role := range allowedRoles {
				if user.RoleName == role {
					roleAllowed = true
					break
				}
			}

			if !roleAllowed {
				utils.WriteError(w, http.StatusForbidden, "You don't have permission to access this resource", nil)
				return
			}

			// Role valid, lanjut ke handler
			next.ServeHTTP(w, r)
		})
	}
}