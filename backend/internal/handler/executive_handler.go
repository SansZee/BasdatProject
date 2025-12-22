package handler

import (
	"fmt"
	"net/http"

	"film-dashboard-api/internal/service"
	"film-dashboard-api/internal/utils"
)

// ExecutiveHandler adalah struct yang berisi semua handler untuk executive dashboard operations
type ExecutiveHandler struct {
	executiveService *service.ExecutiveService
}

// NewExecutiveHandler adalah constructor untuk bikin instance ExecutiveHandler
func NewExecutiveHandler(executiveService *service.ExecutiveService) *ExecutiveHandler {
	return &ExecutiveHandler{
		executiveService: executiveService,
	}
}

// GetKPIMetrics adalah handler untuk endpoint GET /api/dashboard/kpi
// Public route untuk get KPI metrics
func (h *ExecutiveHandler) GetKPIMetrics(w http.ResponseWriter, r *http.Request) {
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

	// 3. Get companyID dari URL query parameter
	companyID := r.URL.Query().Get("company_id")
	if companyID == "" {
		utils.WriteError(w, http.StatusBadRequest, "company_id parameter is required", nil)
		return
	}

	// 4. Get optional year parameter
	yearStr := r.URL.Query().Get("year")
	var year *int
	if yearStr != "" {
		yearVal := 0
		fmt.Sscanf(yearStr, "%d", &yearVal)
		year = &yearVal
	}

	// 5. Call service untuk get KPI metrics
	kpi, err := h.executiveService.GetKPIMetrics(r.Context(), companyID, year)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Failed to get KPI metrics", err)
		return
	}

	// 6. Return success response
	utils.WriteSuccess(w, "KPI metrics retrieved successfully", kpi)
}

// GetBestTitles handler untuk endpoint GET /api/dashboard/best-titles
func (h *ExecutiveHandler) GetBestTitles(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	companyID := r.URL.Query().Get("company_id")
	if companyID == "" {
		utils.WriteError(w, http.StatusBadRequest, "company_id parameter is required", nil)
		return
	}

	topStr := r.URL.Query().Get("top")
	top := 5 // default
	if topStr != "" {
		fmt.Sscanf(topStr, "%d", &top)
	}

	yearStr := r.URL.Query().Get("year")
	var year *int
	if yearStr != "" {
		yearVal := 0
		fmt.Sscanf(yearStr, "%d", &yearVal)
		year = &yearVal
	}

	titles, err := h.executiveService.GetBestTitles(r.Context(), companyID, top, year)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Failed to get best titles", err)
		return
	}

	utils.WriteSuccess(w, "Best titles retrieved successfully", titles)
}

// GetGenreTrend handler untuk endpoint GET /api/dashboard/genre-trend
func (h *ExecutiveHandler) GetGenreTrend(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	companyID := r.URL.Query().Get("company_id")
	if companyID == "" {
		utils.WriteError(w, http.StatusBadRequest, "company_id parameter is required", nil)
		return
	}

	trends, err := h.executiveService.GetGenreTrend(r.Context(), companyID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Failed to get genre trend", err)
		return
	}

	utils.WriteSuccess(w, "Genre trend retrieved successfully", trends)
}

// GetSummaryTrend handler untuk endpoint GET /api/dashboard/summary-trend
func (h *ExecutiveHandler) GetSummaryTrend(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	companyID := r.URL.Query().Get("company_id")
	if companyID == "" {
		utils.WriteError(w, http.StatusBadRequest, "company_id parameter is required", nil)
		return
	}

	yearRangeStr := r.URL.Query().Get("year_range")
	yearRange := 5 // default
	if yearRangeStr != "" {
		fmt.Sscanf(yearRangeStr, "%d", &yearRange)
	}

	trends, err := h.executiveService.GetSummaryTrend(r.Context(), companyID, yearRange)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Failed to get summary trend", err)
		return
	}

	utils.WriteSuccess(w, "Summary trend retrieved successfully", trends)
}

// GetTopCompanies handler untuk endpoint GET /api/dashboard/top-companies
func (h *ExecutiveHandler) GetTopCompanies(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	topStr := r.URL.Query().Get("top")
	var top *int
	if topStr != "" {
		topVal := 0
		fmt.Sscanf(topStr, "%d", &topVal)
		top = &topVal
	}

	companies, err := h.executiveService.GetTopCompanies(r.Context(), top)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Failed to get top companies", err)
		return
	}

	utils.WriteSuccess(w, "Top companies retrieved successfully", companies)
}

// GetAvailableYears handler untuk endpoint GET /api/dashboard/available-years
func (h *ExecutiveHandler) GetAvailableYears(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	companyID := r.URL.Query().Get("company_id")
	if companyID == "" {
		utils.WriteError(w, http.StatusBadRequest, "company_id parameter is required", nil)
		return
	}

	years, err := h.executiveService.GetAvailableYears(r.Context(), companyID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Failed to get available years", err)
		return
	}

	utils.WriteSuccess(w, "Available years retrieved successfully", years)
}
