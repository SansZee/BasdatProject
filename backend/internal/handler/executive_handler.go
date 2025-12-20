package handler

import (
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

// GetKPIMetrics adalah handler untuk endpoint GET /api/dashboard/kpi/{companyID}
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

	// 4. Call service untuk get KPI metrics
	kpi, err := h.executiveService.GetKPIMetrics(r.Context(), companyID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Failed to get KPI metrics", err)
		return
	}

	// 5. Return success response
	utils.WriteSuccess(w, "KPI metrics retrieved successfully", kpi)
}
