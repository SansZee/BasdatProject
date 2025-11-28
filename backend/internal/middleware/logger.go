package middleware

import (
	"log"
	"net/http"
	"time"
)

// Logger adalah middleware untuk log setiap HTTP request
// Berguna untuk debugging dan monitoring
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Record start time
		start := time.Now()

		// Log request info
		log.Printf("Started %s %s", r.Method, r.URL.Path)

		// Call next handler
		next.ServeHTTP(w, r)

		// Log duration
		duration := time.Since(start)
		log.Printf("Completed %s %s in %v", r.Method, r.URL.Path, duration)
	})
}