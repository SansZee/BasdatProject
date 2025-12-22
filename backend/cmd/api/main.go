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
	titleRepo := repository.NewTitleRepository(db)
	reviewRepo := repository.NewReviewRepository(db)
	executiveRepo := repository.NewExecutiveRepository(db)
	artistRepo := repository.NewArtistRepository(db)

	// 4. Initialize services
	authService := service.NewAuthService(userRepo, cfg.JWT.Secret, cfg.JWT.ExpirationHours)
	reviewService := service.NewReviewService(reviewRepo)
	executiveService := service.NewExecutiveService(executiveRepo)

	// 5. Initialize handlers
	authHandler := handler.NewAuthHandler(authService)
	titleHandler := handler.NewTitleHandler(titleRepo)
	reviewHandler := handler.NewReviewHandler(reviewService)
	executiveHandler := handler.NewExecutiveHandler(executiveService)
	artistHandler := handler.NewArtistHandler(artistRepo)
	productionDashboardHandler := handler.NewDashboardHandler(db)

	// 6. Setup router
	router := mux.NewRouter()

	// 7. Create rate limiter (10 requests per minute per IP)
	rateLimiter := middleware.NewRateLimiter(10, 1) // 10 requests per 1 minute

	// 8. Apply global middlewares (untuk semua routes)
	router.Use(middleware.SecureHeaders()) // Add security headers
	router.Use(middleware.CORS(cfg.CORS.AllowedOrigins))
	router.Use(middleware.RateLimitMiddleware(rateLimiter)) // Rate limiting
	router.Use(middleware.CSRFProtection())                 // CSRF protection
	router.Use(middleware.Logger)

	// 9. Public routes (tidak butuh authentication)
	router.HandleFunc("/api/auth/register", authHandler.Register).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/auth/login", authHandler.Login).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/titles/trending", titleHandler.GetTrendingTitles).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/titles/top-rated", titleHandler.GetTopRatedTitles).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/titles/search", titleHandler.SearchTitles).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/titles/filter-options", titleHandler.GetFilterOptions).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/titles/filter", titleHandler.FilterTitles).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/titles/{id}/detail", titleHandler.GetTitleDetail).Methods("GET", "OPTIONS")
	
	// Reviews public routes
	router.HandleFunc("/api/reviews/{title}", reviewHandler.GetReviewsByTitle).Methods("GET", "OPTIONS")
	
	// Executive dashboard routes
	router.HandleFunc("/api/dashboard/kpi", executiveHandler.GetKPIMetrics).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/dashboard/best-titles", executiveHandler.GetBestTitles).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/dashboard/genre-trend", executiveHandler.GetGenreTrend).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/dashboard/summary-trend", executiveHandler.GetSummaryTrend).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/dashboard/top-companies", executiveHandler.GetTopCompanies).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/dashboard/available-years", executiveHandler.GetAvailableYears).Methods("GET", "OPTIONS")
	
	// Production Dashboard routes
	router.HandleFunc("/api/production-dashboard/status-distribution", productionDashboardHandler.GetStatusDistribution).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/production-dashboard/in-production", productionDashboardHandler.GetInProductionDetails).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/production-dashboard/planned-projects", productionDashboardHandler.GetPlannedProjects).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/production-dashboard/top-companies", productionDashboardHandler.GetTopProductionCompanies).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/production-dashboard/genre-distribution", productionDashboardHandler.GetGenreDistribution).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/production-dashboard/top-cast", productionDashboardHandler.GetTopCast).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/production-dashboard/summary", productionDashboardHandler.GetDashboardSummary).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/production-dashboard/titles-by-status", productionDashboardHandler.GetTitlesByStatus).Methods("GET", "OPTIONS")
	
	// Artist routes
	router.HandleFunc("/api/artists/search", artistHandler.SearchArtists).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/artists/{id}/detail", artistHandler.GetArtistDetail).Methods("GET", "OPTIONS")

	// 10. Protected routes (butuh JWT token)
	// Wrap handler dengan Auth middleware - HANYA untuk /api/auth/* paths
	protectedRouter := router.PathPrefix("/api/auth").Subrouter()
	protectedRouter.Use(middleware.Auth(authService))

	// Profile endpoint (semua authenticated user bisa akses)
	protectedRouter.HandleFunc("/profile", authHandler.GetProfile).Methods("GET", "OPTIONS")

	// Logout endpoint (protected)
	protectedRouter.HandleFunc("/logout", authHandler.Logout).Methods("POST", "OPTIONS")

	// 11. Protected reviews routes (butuh JWT token) - MUST BE BEFORE PUBLIC REVIEWS ROUTE
	protectedReviewRouter := router.PathPrefix("/api/reviews").Subrouter()
	protectedReviewRouter.Use(middleware.Auth(authService))

	// Create/Update review
	protectedReviewRouter.HandleFunc("", reviewHandler.CreateOrUpdateReview).Methods("POST", "OPTIONS")

	// Get user's reviews
	protectedReviewRouter.HandleFunc("/user", reviewHandler.GetUserReviews).Methods("GET", "OPTIONS")
	fmt.Println("✅ Registered route: GET /api/reviews/user (protected)")

	// Check if user reviewed a title
	protectedReviewRouter.HandleFunc("/check/{title}", reviewHandler.GetUserReviewForTitle).Methods("GET", "OPTIONS")

	// Delete review
	protectedReviewRouter.HandleFunc("/{id}", reviewHandler.DeleteReview).Methods("DELETE", "OPTIONS")

	// Reviews public routes (AFTER protected routes to avoid path param conflict)
	router.HandleFunc("/api/reviews/{title}", reviewHandler.GetReviewsByTitle).Methods("GET", "OPTIONS")

	// Health check endpoint (untuk monitoring)
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "healthy", "message": "API is running"}`))
	}).Methods("GET", "OPTIONS")

	// 11. Start server
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
