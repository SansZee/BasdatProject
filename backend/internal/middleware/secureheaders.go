package middleware

import "net/http"

// SecureHeaders middleware untuk menambah security headers
// Headers yang ditambahkan:
// - X-Content-Type-Options: nosniff (prevent MIME type sniffing)
// - X-Frame-Options: DENY (prevent clickjacking)
// - X-XSS-Protection: 1; mode=block (enable XSS protection)
// - Strict-Transport-Security: enforce HTTPS
// - Content-Security-Policy: prevent XSS, clickjacking, dll
func SecureHeaders() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Prevent MIME type sniffing
			w.Header().Set("X-Content-Type-Options", "nosniff")

			// Prevent clickjacking
			w.Header().Set("X-Frame-Options", "DENY")

			// Enable XSS protection
			w.Header().Set("X-XSS-Protection", "1; mode=block")

			// Enforce HTTPS (HSTS)
			// max-age=31536000 = 1 year
			// includeSubDomains = apply to all subdomains
			// preload = allow submission to browser preload list
			w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

			// Content Security Policy
			// default-src 'self' = hanya allow resources dari same origin
			// script-src 'self' = hanya allow scripts dari same origin
			// style-src 'self' 'unsafe-inline' = allow inline styles (diperlukan beberapa framework)
			// img-src 'self' data: https: = allow images dari same origin, data URLs, dan HTTPS
			w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'")

			// Referrer Policy
			w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

			// Permissions Policy (formerly Feature Policy)
			w.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

			next.ServeHTTP(w, r)
		})
	}
}
