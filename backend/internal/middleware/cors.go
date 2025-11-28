package middleware

import (
	"net/http"
)

// CORS adalah middleware untuk handle Cross-Origin Resource Sharing
// Tanpa ini, frontend (React di localhost:3000) tidak bisa akses API (Go di localhost:8080)
// Browser akan block request karena "different origin"
func CORS(allowedOrigins string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Set CORS headers
			// Header ini kasih tau browser: "Frontend dari origin ini boleh akses API"
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigins)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")

			// Handle preflight request
			// Browser kirim OPTIONS request dulu sebelum request asli (untuk check CORS)
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			// Lanjut ke handler berikutnya
			next.ServeHTTP(w, r)
		})
	}
}
