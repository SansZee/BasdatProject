package handler

import (
	"fmt"
	"net/http"
	"strconv"

	"film-dashboard-api/internal/repository"
	"film-dashboard-api/internal/utils"
)

// TitleHandler adalah struct yang berisi semua handler untuk title/film operations
type TitleHandler struct {
	titleRepo *repository.TitleRepository
}

// NewTitleHandler adalah constructor untuk bikin instance TitleHandler
func NewTitleHandler(titleRepo *repository.TitleRepository) *TitleHandler {
	return &TitleHandler{
		titleRepo: titleRepo,
	}
}

// GetTrendingTitles adalah handler untuk endpoint GET /api/titles/trending
// Query param: limit (default 6)
// Return: array of trending titles
func (h *TitleHandler) GetTrendingTitles(w http.ResponseWriter, r *http.Request) {
	// 1. Handle CORS preflight OPTIONS request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Check method GET
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 3. Get limit dari query param (default 6)
	limitStr := r.URL.Query().Get("limit")
	limit := 6
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	// 4. Call repository untuk get trending titles
	titles, err := h.titleRepo.GetTrendingTitles(limit)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Failed to fetch trending titles", err)
		return
	}

	// 5. Return success response
	utils.WriteSuccess(w, "Trending titles retrieved successfully", titles)
}

// GetTopRatedTitles adalah handler untuk endpoint GET /api/titles/top-rated
// Query param: limit (default 6)
// Return: array of top-rated titles
func (h *TitleHandler) GetTopRatedTitles(w http.ResponseWriter, r *http.Request) {
	// 1. Handle CORS preflight OPTIONS request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Check method GET
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 3. Get limit dari query param (default 6)
	limitStr := r.URL.Query().Get("limit")
	limit := 6
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	// 4. Call repository untuk get top-rated titles
	titles, err := h.titleRepo.GetTopRatedTitles(limit)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Failed to fetch top-rated titles", err)
		return
	}

	// 5. Return success response
	utils.WriteSuccess(w, "Top-rated titles retrieved successfully", titles)
}

// SearchTitles adalah handler untuk endpoint GET /api/titles/search
// Query param: q (search keyword) - required
// Return: array of matching titles
func (h *TitleHandler) SearchTitles(w http.ResponseWriter, r *http.Request) {
	// 1. Handle CORS preflight OPTIONS request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Check method GET
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 3. Get search keyword dari query param
	keyword := r.URL.Query().Get("q")
	if keyword == "" {
		utils.WriteError(w, http.StatusBadRequest, "Search keyword (q) is required", nil)
		return
	}

	fmt.Println("=== SEARCH REQUEST ===")
	fmt.Printf("Endpoint: /api/titles/search\n")
	fmt.Printf("Query Param 'q': %s\n", keyword)

	// 4. Call repository untuk search titles
	titles, err := h.titleRepo.SearchTitles(keyword)
	if err != nil {
		fmt.Printf("❌ Handler Error: %v\n", err)
		utils.WriteError(w, http.StatusInternalServerError, "Failed to search titles", err)
		return
	}

	// 5. Return success response
	fmt.Printf("📤 Returning %d results to frontend\n", len(titles))
	fmt.Println("====================\n")
	utils.WriteSuccess(w, "Search results retrieved successfully", titles)
}

// GetTitleDetail adalah handler untuk endpoint GET /api/titles/{id}/detail
// Path param: id (title_id)
// Return: TitleDetailResponse dengan semua informasi detail
func (h *TitleHandler) GetTitleDetail(w http.ResponseWriter, r *http.Request) {
	// 1. Handle CORS preflight OPTIONS request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Check method GET
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 3. Get title_id dari URL path
	// Path format: /api/titles/{id}/detail
	titleID := r.URL.Path[len("/api/titles/"):]
	titleID = titleID[:len(titleID)-len("/detail")]

	if titleID == "" {
		utils.WriteError(w, http.StatusBadRequest, "Title ID is required", nil)
		return
	}

	fmt.Println("=== GET TITLE DETAIL REQUEST ===")
	fmt.Printf("Endpoint: /api/titles/%s/detail\n", titleID)

	// 4. Call repository untuk get title detail
	detail, err := h.titleRepo.GetTitleDetail(titleID)
	if err != nil {
		fmt.Printf("❌ Handler Error: %v\n", err)
		utils.WriteError(w, http.StatusInternalServerError, "Failed to fetch title detail", err)
		return
	}

	// 5. Return success response
	fmt.Printf("📤 Returning detail for title: %s\n", titleID)
	fmt.Println("================================\n")
	utils.WriteSuccess(w, "Title detail retrieved successfully", detail)
}
