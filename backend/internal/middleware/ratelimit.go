package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"

	"film-dashboard-api/internal/utils"
)

// RateLimiter struktur untuk track requests per IP
type RateLimiter struct {
	clients map[string]*clientData
	mu      sync.Mutex
	limit   int       // requests per window
	window  time.Duration
}

type clientData struct {
	requests []time.Time
}

// NewRateLimiter membuat instance rate limiter baru
// limit: jumlah requests yang diizinkan
// window: durasi time window (contoh: 1 minute)
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		clients: make(map[string]*clientData),
		limit:   limit,
		window:  window,
	}

	// Cleanup old entries setiap 5 menit
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			rl.cleanup()
		}
	}()

	return rl
}

// Allow checks apakah request dari IP ini diizinkan
func (rl *RateLimiter) Allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	client, exists := rl.clients[ip]

	if !exists {
		rl.clients[ip] = &clientData{
			requests: []time.Time{now},
		}
		return true
	}

	// Remove requests older than window
	var validRequests []time.Time
	for _, req := range client.requests {
		if now.Sub(req) < rl.window {
			validRequests = append(validRequests, req)
		}
	}

	if len(validRequests) < rl.limit {
		validRequests = append(validRequests, now)
		client.requests = validRequests
		return true
	}

	return false
}

// cleanup menghapus IP entries yang sudah lama tidak digunakan
func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for ip, client := range rl.clients {
		if len(client.requests) == 0 || now.Sub(client.requests[len(client.requests)-1]) > rl.window*2 {
			delete(rl.clients, ip)
		}
	}
}

// RateLimitMiddleware middleware untuk rate limiting
// Default: 10 requests per minute per IP
func RateLimitMiddleware(limiter *RateLimiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get client IP
			ip := getClientIP(r)

			if !limiter.Allow(ip) {
				utils.WriteError(w, http.StatusTooManyRequests, "Too many requests. Please try again later.", nil)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// getClientIP extract client IP dari request
func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header (untuk proxy/load balancer)
	ip := r.Header.Get("X-Forwarded-For")
	if ip != "" {
		return ip
	}

	// Check X-Real-IP header
	ip = r.Header.Get("X-Real-IP")
	if ip != "" {
		return ip
	}

	// Get dari RemoteAddr
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}

	return ip
}
