package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"film-dashboard-api/internal/middleware"
	"film-dashboard-api/internal/models"
	"film-dashboard-api/internal/service"
	"film-dashboard-api/internal/utils"

	"github.com/gorilla/mux"
)

// ReviewHandler adalah struct yang berisi semua handler untuk review operations
type ReviewHandler struct {
	reviewService *service.ReviewService
}

// NewReviewHandler adalah constructor untuk bikin instance ReviewHandler
func NewReviewHandler(reviewService *service.ReviewService) *ReviewHandler {
	return &ReviewHandler{
		reviewService: reviewService,
	}
}

// CreateOrUpdateReview adalah handler untuk endpoint POST /api/reviews
// Protected route - butuh JWT token
// Jika user sudah review title ini, akan update; jika belum, akan create
func (h *ReviewHandler) CreateOrUpdateReview(w http.ResponseWriter, r *http.Request) {
	// 1. Handle CORS preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Pastikan method POST
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 3. Get user dari context (di-set oleh Auth middleware)
	user, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "User not found", nil)
		return
	}

	// 4. Parse request body
	var req models.ReviewRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// 5. Call service untuk create/update review
	response, err := h.reviewService.CreateOrUpdateReview(user.UserID, req)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err.Error(), err)
		return
	}

	// 6. Return success response
	utils.WriteSuccess(w, "Review created/updated successfully", response)
}

// GetReviewsByTitle adalah handler untuk endpoint GET /api/reviews/{title}
// Public route - tidak butuh authentication
func (h *ReviewHandler) GetReviewsByTitle(w http.ResponseWriter, r *http.Request) {
	// 1. Handle CORS preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Pastikan method GET
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 3. Get title ID dari URL path
	vars := mux.Vars(r)
	titleID := vars["title"]

	if titleID == "" {
		utils.WriteError(w, http.StatusBadRequest, "Title ID is required", nil)
		return
	}

	// 4. Call service untuk get reviews
	reviews, err := h.reviewService.GetReviewsByTitle(titleID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Failed to fetch reviews", err)
		return
	}

	// 5. Return response (return empty array jika tidak ada review)
	utils.WriteSuccess(w, "Reviews retrieved successfully", reviews)
}

// GetUserReviews adalah handler untuk endpoint GET /api/reviews/user/{id}
// Protected route - hanya user yang sedang login bisa get review mereka sendiri
func (h *ReviewHandler) GetUserReviews(w http.ResponseWriter, r *http.Request) {
	// 1. Handle CORS preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Pastikan method GET
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 3. Get user dari context (di-set oleh Auth middleware)
	user, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "User not found", nil)
		return
	}

	// 4. Call service untuk get user reviews
	reviews, err := h.reviewService.GetReviewsByUser(user.UserID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Failed to fetch reviews", err)
		return
	}

	// 5. Return response
	utils.WriteSuccess(w, "User reviews retrieved successfully", reviews)
}

// DeleteReview adalah handler untuk endpoint DELETE /api/reviews/{id}
// Protected route - hanya owner yang bisa delete
func (h *ReviewHandler) DeleteReview(w http.ResponseWriter, r *http.Request) {
	// 1. Handle CORS preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Pastikan method DELETE
	if r.Method != http.MethodDelete {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 3. Get user dari context
	user, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "User not found", nil)
		return
	}

	// 4. Get review ID dari URL path
	vars := mux.Vars(r)
	reviewIDStr := vars["id"]

	if reviewIDStr == "" {
		utils.WriteError(w, http.StatusBadRequest, "Review ID is required", nil)
		return
	}

	// Convert string to int
	reviewID, err := strconv.Atoi(reviewIDStr)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid review ID format", err)
		return
	}

	// 5. Call service untuk delete review
	// Service akan verify ownership
	err = h.reviewService.DeleteReview(reviewID, user.UserID)
	if err != nil {
		// Check if error is ownership issue
		if strings.Contains(err.Error(), "only delete your own") {
			utils.WriteError(w, http.StatusForbidden, err.Error(), err)
		} else if strings.Contains(err.Error(), "not found") {
			utils.WriteError(w, http.StatusNotFound, err.Error(), err)
		} else {
			utils.WriteError(w, http.StatusInternalServerError, "Failed to delete review", err)
		}
		return
	}

	// 6. Return success response
	utils.WriteSuccess(w, "Review deleted successfully", nil)
}

// GetUserReviewForTitle adalah handler untuk endpoint GET /api/reviews/check/{title}
// Protected route - check apakah user sudah review title ini
func (h *ReviewHandler) GetUserReviewForTitle(w http.ResponseWriter, r *http.Request) {
	// 1. Handle CORS preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Pastikan method GET
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 3. Get user dari context
	user, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "User not found", nil)
		return
	}

	// 4. Get title ID dari URL path
	vars := mux.Vars(r)
	titleID := vars["title"]

	if titleID == "" {
		utils.WriteError(w, http.StatusBadRequest, "Title ID is required", nil)
		return
	}

	// 5. Call service
	review, err := h.reviewService.GetUserReviewForTitle(user.UserID, titleID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Failed to fetch review", err)
		return
	}

	// 6. Return response (review bisa nil jika belum ada review)
	utils.WriteSuccess(w, "User review retrieved successfully", review)
}
