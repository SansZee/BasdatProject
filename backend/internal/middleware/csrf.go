package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"

	"film-dashboard-api/internal/utils"
)

// CSRFTokenLength panjang CSRF token (32 bytes = 64 hex chars)
const CSRFTokenLength = 32

// CSRFTokenCookie nama cookie untuk CSRF token
const CSRFTokenCookie = "X-CSRF-Token"

// CSRFTokenHeader nama header untuk CSRF token
const CSRFTokenHeader = "X-CSRF-Token"

// GenerateCSRFToken membuat CSRF token baru (random 32 bytes)
func GenerateCSRFToken() (string, error) {
	b := make([]byte, CSRFTokenLength)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// CSRFProtection middleware untuk CSRF protection
// Cara kerja:
// 1. GET requests: set CSRF token di cookie
// 2. POST/PUT/DELETE requests: validate CSRF token dari header vs cookie
// Exempted paths: /api/auth/* (protected by rate limiting & SameSite cookie)
func CSRFProtection() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Exempt auth endpoints, titles endpoints, dan reviews endpoints dari CSRF
			// (protected by JWT authentication & rate limiting & SameSite)
			path := r.URL.Path
			if strings.HasPrefix(path, "/api/auth/") || 
			   strings.HasPrefix(path, "/api/titles/") ||
			   strings.HasPrefix(path, "/api/reviews") {
				next.ServeHTTP(w, r)
				return
			}

			// Safe methods (GET, HEAD, OPTIONS) - cukup set token
			if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
				// Generate dan set CSRF token jika belum ada
				token, err := r.Cookie(CSRFTokenCookie)
				if err != nil || token.Value == "" {
					newToken, err := GenerateCSRFToken()
					if err != nil {
						utils.WriteError(w, http.StatusInternalServerError, "Failed to generate CSRF token", err)
						return
					}
					http.SetCookie(w, &http.Cookie{
						Name:     CSRFTokenCookie,
						Value:    newToken,
						Path:     "/",
						HttpOnly: false,
						Secure:   true,
						SameSite: http.SameSite(3), // Lax
					})
				}
				next.ServeHTTP(w, r)
				return
			}

			// Unsafe methods (POST, PUT, DELETE) - validate token
			if r.Method == http.MethodPost || r.Method == http.MethodPut || r.Method == http.MethodDelete {
				// Get CSRF token dari cookie
				cookieToken, err := r.Cookie(CSRFTokenCookie)
				if err != nil || cookieToken.Value == "" {
					utils.WriteError(w, http.StatusForbidden, "CSRF token missing", nil)
					return
				}

				// Get CSRF token dari header
				headerToken := r.Header.Get(CSRFTokenHeader)
				if headerToken == "" {
					// Coba dari form value
					headerToken = r.FormValue("csrf_token")
				}

				if headerToken == "" {
					utils.WriteError(w, http.StatusForbidden, "CSRF token missing in request", nil)
					return
				}

				// Compare tokens
				if !strings.EqualFold(cookieToken.Value, headerToken) {
					utils.WriteError(w, http.StatusForbidden, "Invalid CSRF token", nil)
					return
				}

				next.ServeHTTP(w, r)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
