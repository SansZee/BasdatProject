package handler

import (
	"database/sql"
	"encoding/json"
	"film-dashboard-api/internal/models"
	"log"
	"net/http"
	"strconv"
)

type DashboardHandler struct {
	db *sql.DB
}

func NewDashboardHandler(db *sql.DB) *DashboardHandler {
	return &DashboardHandler{db: db}
}

func (h *DashboardHandler) respondJSON(w http.ResponseWriter, data interface{}, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

func (h *DashboardHandler) respondError(w http.ResponseWriter, err error) {
	log.Printf("Dashboard error: %v", err)
	h.respondJSON(w, map[string]string{"error": err.Error()}, http.StatusInternalServerError)
}

// GetStatusDistribution - Pie Chart Data
func (h *DashboardHandler) GetStatusDistribution(w http.ResponseWriter, r *http.Request) {
	companyID := "11454"

	var query string

	if companyID != "" {
		query = "EXEC sp_StatusDistribution @CompanyId = '" + companyID + "'"
	} else {
		query = "EXEC sp_StatusDistribution @CompanyId = NULL"
	}

	rows, err := h.db.Query(query)
	if err != nil {
		h.respondError(w, err)
		return
	}
	defer rows.Close()

	data := make([]models.StatusDistribution, 0)
	for rows.Next() {
		var item models.StatusDistribution
		if err := rows.Scan(&item.StatusID, &item.StatusName, &item.TotalTitles); err != nil {
			h.respondError(w, err)
			return
		}
		data = append(data, item)
	}

	h.respondJSON(w, data, http.StatusOK)
}

// GetInProductionDetails - Table Data
func (h *DashboardHandler) GetInProductionDetails(w http.ResponseWriter, r *http.Request) {
	companyID := "11454"

	var query string

	if companyID != "" {
		query = "EXEC sp_InProductionDetails @CompanyId = '" + companyID + "'"
	} else {
		query = "EXEC sp_InProductionDetails @CompanyId = NULL"
	}

	rows, err := h.db.Query(query)
	if err != nil {
		h.respondError(w, err)
		return
	}
	defer rows.Close()

	data := make([]models.InProductionDetail, 0)
	for rows.Next() {
		var item models.InProductionDetail
		if err := rows.Scan(&item.TitleID, &item.TitleName, &item.Genres, &item.ProductionCompanies,
			&item.CastCount, &item.Rating, &item.RuntimeMinutes, &item.Popularity, &item.VoteCount); err != nil {
			h.respondError(w, err)
			return
		}
		data = append(data, item)
	}

	h.respondJSON(w, data, http.StatusOK)
}

// GetPlannedProjects - Table Data
func (h *DashboardHandler) GetPlannedProjects(w http.ResponseWriter, r *http.Request) {
	companyID := "11454"

	var query string

	if companyID != "" {
		query = "EXEC sp_PlannedProjects @CompanyId = '" + companyID + "'"
	} else {
		query = "EXEC sp_PlannedProjects @CompanyId = NULL"
	}

	rows, err := h.db.Query(query)
	if err != nil {
		h.respondError(w, err)
		return
	}
	defer rows.Close()

	data := make([]models.PlannedProject, 0)
	for rows.Next() {
		var item models.PlannedProject
		if err := rows.Scan(&item.TitleID, &item.TitleName, &item.Overview, &item.Genres,
			&item.ProductionCompanies, &item.StartYear, &item.PlannedCastCount); err != nil {
			h.respondError(w, err)
			return
		}
		data = append(data, item)
	}

	h.respondJSON(w, data, http.StatusOK)
}

// GetTopProductionCompanies - Bar Chart Data
func (h *DashboardHandler) GetTopProductionCompanies(w http.ResponseWriter, r *http.Request) {
	topN := 10
	if n := r.URL.Query().Get("topN"); n != "" {
		if val, err := strconv.Atoi(n); err == nil && val > 0 {
			topN = val
		}
	}

	query := "EXEC sp_TopProductionCompanies @TopN = " + strconv.Itoa(topN)
	rows, err := h.db.Query(query)
	if err != nil {
		h.respondError(w, err)
		return
	}
	defer rows.Close()

	data := make([]models.TopProductionCompany, 0)
	for rows.Next() {
		var item models.TopProductionCompany
		if err := rows.Scan(&item.CompanyID, &item.CompanyName, &item.TotalTitles,
			&item.InProductionCount, &item.PlannedCount, &item.AvgRating); err != nil {
			h.respondError(w, err)
			return
		}
		data = append(data, item)
	}

	h.respondJSON(w, data, http.StatusOK)
}

// GetGenreDistribution - Bar Chart Data
func (h *DashboardHandler) GetGenreDistribution(w http.ResponseWriter, r *http.Request) {
	companyID := "11454"

	var query string

	if companyID != "" {
		query = "EXEC sp_GenreDistributionInProduction @CompanyId = '" + companyID + "'"
	} else {
		query = "EXEC sp_GenreDistributionInProduction @CompanyId = NULL"
	}

	rows, err := h.db.Query(query)
	if err != nil {
		h.respondError(w, err)
		return
	}
	defer rows.Close()

	data := make([]models.GenreDistribution, 0)
	for rows.Next() {
		var item models.GenreDistribution
		if err := rows.Scan(&item.GenreName, &item.TotalTitles, &item.TotalPopularity); err != nil {
			h.respondError(w, err)
			return
		}
		data = append(data, item)
	}

	h.respondJSON(w, data, http.StatusOK)
}

// GetTopCast - Table Data
func (h *DashboardHandler) GetTopCast(w http.ResponseWriter, r *http.Request) {
	topN := 20
	if n := r.URL.Query().Get("topN"); n != "" {
		if val, err := strconv.Atoi(n); err == nil && val > 0 {
			topN = val
		}
	}

	query := "EXEC sp_TopCastMostActive @TopN = " + strconv.Itoa(topN)
	rows, err := h.db.Query(query)
	if err != nil {
		h.respondError(w, err)
		return
	}
	defer rows.Close()

	data := make([]models.TopCast, 0)
	for rows.Next() {
		var item models.TopCast
		if err := rows.Scan(&item.PersonID, &item.PersonName, &item.Professions, &item.TotalProjects,
			&item.InProductionProjects, &item.AvgRating, &item.Projects); err != nil {
			h.respondError(w, err)
			return
		}
		// Set default 0 if AvgRating is NULL
		if !item.AvgRating.Valid {
			item.AvgRating.Float64 = 0
		}
		data = append(data, item)
	}

	h.respondJSON(w, data, http.StatusOK)
}

// GetDashboardSummary - KPIs
func (h *DashboardHandler) GetDashboardSummary(w http.ResponseWriter, r *http.Request) {
	companyID := "11454"

	var query string

	if companyID != "" {
		query = "EXEC sp_DashboardSummary @CompanyId = '" + companyID + "'"
	} else {
		query = "EXEC sp_DashboardSummary @CompanyId = NULL"
	}

	rows, err := h.db.Query(query)
	if err != nil {
		h.respondError(w, err)
		return
	}
	defer rows.Close()

	kpiMap := make(map[string]string)
	for rows.Next() {
		var metric, value string
		if err := rows.Scan(&metric, &value); err != nil {
			h.respondError(w, err)
			return
		}
		kpiMap[metric] = value
	}

	// Parse structured response
	summary := models.DashboardSummary{
		TotalInProduction:    parseIntValue(kpiMap["Total In Production"]),
		TotalPlanned:         parseIntValue(kpiMap["Total Planned"]),
		TotalPilots:          parseIntValue(kpiMap["Total Pilots"]),
		TotalReturningSeries: parseIntValue(kpiMap["Total Returning Series"]),
		TotalCanceled:        parseIntValue(kpiMap["Total Canceled"]),
		TotalPopularity:      parseFloatValue(kpiMap["Total Popularity (In Production)"]),
		TopCompany:           kpiMap["Top Production Company"],
	}

	h.respondJSON(w, summary, http.StatusOK)
}

// GetTitlesByStatus - Table Data
func (h *DashboardHandler) GetTitlesByStatus(w http.ResponseWriter, r *http.Request) {
	statusID := r.URL.Query().Get("statusId")
	companyID := "11454"

	if statusID == "" {
		h.respondJSON(w, map[string]string{"error": "statusId parameter is required"}, http.StatusBadRequest)
		return
	}

	var query string

	if companyID != "" {
		query = "EXEC sp_TitlesByStatus @StatusId = '" + statusID + "', @CompanyId = '" + companyID + "'"
	} else {
		query = "EXEC sp_TitlesByStatus @StatusId = '" + statusID + "', @CompanyId = NULL"
	}

	rows, err := h.db.Query(query)
	if err != nil {
		h.respondError(w, err)
		return
	}
	defer rows.Close()

	data := make([]models.TitleByStatus, 0)
	for rows.Next() {
		var item models.TitleByStatus
		var productionCompanies sql.NullString
		if err := rows.Scan(&item.TitleID, &item.TitleName, &item.StatusName, &item.Genres,
			&productionCompanies, &item.CastCount, &item.Rating, &item.Popularity,
			&item.RuntimeMinutes, &item.NumberOfSeasons, &item.NumberOfEpisodes); err != nil {
			h.respondError(w, err)
			return
		}
		item.ProductionCompanies = productionCompanies.String
		data = append(data, item)
	}

	h.respondJSON(w, data, http.StatusOK)
}

// Helper functions
func parseIntValue(value string) int {
	if val, err := strconv.Atoi(value); err == nil {
		return val
	}
	return 0
}

func parseFloatValue(value string) float64 {
	if val, err := strconv.ParseFloat(value, 64); err == nil {
		return val
	}
	return 0
}
