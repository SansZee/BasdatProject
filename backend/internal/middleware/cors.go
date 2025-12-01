package middleware

import (
	"net/http"
	"strings"
)

// CORS middleware - handles preflight dan actual CORS requests
func CORS(allowedOrigins string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			
			// For development: allow all origins. For production: validate against allowedOrigins
			if origin != "" {
				// Development: accept all origins
				if allowedOrigins == "" || strings.Contains(allowedOrigins, "localhost") {
					w.Header().Set("Access-Control-Allow-Origin", origin)
				} else if origin == allowedOrigins {
					w.Header().Set("Access-Control-Allow-Origin", origin)
				}
			}
			
			// Set required CORS headers
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Max-Age", "3600")
			
			// Handle preflight OPTIONS request
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			
			// Continue to next handler
			next.ServeHTTP(w, r)
		})
	}
}