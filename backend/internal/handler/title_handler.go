package handler

import (
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
