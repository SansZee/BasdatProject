package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"film-dashboard-api/internal/models"
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

	// 5. Check if title exists (detail should not be nil)
	if detail == nil || detail.Detail == nil {
		fmt.Printf("❌ Movie not found: %s\n", titleID)
		fmt.Println("================================\n")
		utils.WriteError(w, http.StatusNotFound, "Movie not found", nil)
		return
	}

	// 6. Return success response
	fmt.Printf("📤 Returning detail for title: %s\n", titleID)
	fmt.Println("================================\n")
	utils.WriteSuccess(w, "Title detail retrieved successfully", detail)
}

// GetFilterOptions adalah handler untuk endpoint GET /api/titles/filter-options
// Return: FilterOptionsResponse dengan semua available filter options
func (h *TitleHandler) GetFilterOptions(w http.ResponseWriter, r *http.Request) {
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

	fmt.Println("=== GET FILTER OPTIONS REQUEST ===")

	// 3. Call repository untuk get filter options
	options, err := h.titleRepo.GetFilterOptions()
	if err != nil {
		fmt.Printf("❌ Handler Error: %v\n", err)
		utils.WriteError(w, http.StatusInternalServerError, "Failed to fetch filter options", err)
		return
	}

	// 4. Return success response
	fmt.Printf("📤 Returning filter options: %d genres, %d types, %d statuses\n",
		len(options.Genres), len(options.Types), len(options.Statuses))
	fmt.Println("================================\n")
	utils.WriteSuccess(w, "Filter options retrieved successfully", options)
}

// FilterTitles adalah handler untuk endpoint POST /api/titles/filter
// Body: JSON dengan filter parameters (semua optional)
// Query param: page, limit untuk pagination
// Return: FilterResponse dengan array of filtered titles dan total count
func (h *TitleHandler) FilterTitles(w http.ResponseWriter, r *http.Request) {
	// 1. Handle CORS preflight OPTIONS request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Check method POST
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// 3. Parse request body
	var filterReq models.FilterRequest
	err := json.NewDecoder(r.Body).Decode(&filterReq)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}
	defer r.Body.Close()

	// 4. Validate and set defaults
	if filterReq.Page <= 0 {
		filterReq.Page = 1
	}
	if filterReq.Limit <= 0 || filterReq.Limit > 100 {
		filterReq.Limit = 20 // Default limit
	}
	if filterReq.SortBy == "" {
		filterReq.SortBy = "released" // Default sort
	}

	// Calculate offset untuk pagination
	offset := (filterReq.Page - 1) * filterReq.Limit

	fmt.Println("=== FILTER TITLES REQUEST ===")
	fmt.Printf("Page: %d, Limit: %d, Offset: %d\n", filterReq.Page, filterReq.Limit, offset)
	fmt.Printf("Filters: GenreIDs=%v (%d), TypeIDs=%v (%d), StatusIDs=%v (%d), Year=%v, SortBy=%s\n",
		filterReq.GenreIDs, len(filterReq.GenreIDs), filterReq.TypeIDs, len(filterReq.TypeIDs), 
		filterReq.StatusIDs, len(filterReq.StatusIDs), filterReq.Year, filterReq.SortBy)

	// 5. Call repository untuk filter titles
	titles, totalCount, err := h.titleRepo.FilterTitles(
		filterReq.GenreIDs,
		filterReq.TypeIDs,
		filterReq.StatusIDs,
		filterReq.OriginCountryIDs,
		filterReq.ProductionCountryIDs,
		filterReq.Year,
		filterReq.SortBy,
		offset,
		filterReq.Limit,
	)
	if err != nil {
		fmt.Printf("❌ Handler Error: %v\n", err)
		utils.WriteError(w, http.StatusInternalServerError, "Failed to filter titles", err)
		return
	}

	// 6. Build response
	response := models.FilterResponse{
		Success: true,
		Data:    titles,
		Count:   totalCount,
	}

	// 7. Return success response
	fmt.Printf("📤 Returning %d filtered titles (Total: %d)\n", len(titles), totalCount)
	fmt.Println("=============================\n")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
