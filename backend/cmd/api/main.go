package main

import (
	"fmt"
	"log"
	"net/http"

	"film-dashboard-api/internal/config"
	"film-dashboard-api/internal/database"
	"film-dashboard-api/internal/handler"
	"film-dashboard-api/internal/middleware"
	"film-dashboard-api/internal/repository"
	"film-dashboard-api/internal/service"

	"github.com/gorilla/mux"
)

func main() {
	fmt.Println("🚀 Starting Film Dashboard API Server...")

	// 1. Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("❌ Failed to load config: %v", err)
	}
	fmt.Printf("✅ Configuration loaded (Environment: %s)\n", cfg.Server.Environment)

	// 2. Connect to database
	fmt.Println("📡 Connecting to database...")
	db, err := database.Connect(cfg.GetConnectionString())
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer db.Close()
	fmt.Println("✅ Database connected!")

	// 3. Initialize repositories
	userRepo := repository.NewUserRepository(db)

	// 4. Initialize services
	authService := service.NewAuthService(userRepo, cfg.JWT.Secret, cfg.JWT.ExpirationHours)

	// 5. Initialize handlers
	authHandler := handler.NewAuthHandler(authService)

	// 6. Setup router
	router := mux.NewRouter()

	// 7. Apply global middlewares (untuk semua routes)
	router.Use(middleware.CORS(cfg.CORS.AllowedOrigins))
	router.Use(middleware.Logger)

	// 8. Public routes (tidak butuh authentication)
	router.HandleFunc("/api/auth/register", authHandler.Register).Methods("POST")
	router.HandleFunc("/api/auth/login", authHandler.Login).Methods("POST")

	// 9. Protected routes (butuh JWT token)
	// Wrap handler dengan Auth middleware
	protectedRouter := router.PathPrefix("/api").Subrouter()
	protectedRouter.Use(middleware.Auth(authService))

	// Profile endpoint (semua authenticated user bisa akses)
	protectedRouter.HandleFunc("/auth/profile", authHandler.GetProfile).Methods("GET")

	// Health check endpoint (untuk monitoring)
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "healthy", "message": "API is running"}`))
	}).Methods("GET")

	// 10. Start server
	addr := fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port)
	fmt.Printf("\n🎉 Server is running on http://%s\n", addr)
	fmt.Println("📚 Available endpoints:")
	fmt.Println("   POST   http://" + addr + "/api/auth/register")
	fmt.Println("   POST   http://" + addr + "/api/auth/login")
	fmt.Println("   GET    http://" + addr + "/api/auth/profile (protected)")
	fmt.Println("   GET    http://" + addr + "/health")
	fmt.Println("\n Ready to accept requests!\n")

	// Start HTTP server
	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("❌ Server failed to start: %v", err)
	}
}