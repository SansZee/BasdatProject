package repository

import (
	"context"
	"database/sql"
	"fmt"

	"film-dashboard-api/internal/models"
)

type ExecutiveRepository struct {
	db *sql.DB
}

// NewExecutiveRepository adalah constructor untuk bikin instance ExecutiveRepository
func NewExecutiveRepository(db *sql.DB) *ExecutiveRepository {
	return &ExecutiveRepository{
		db: db,
	}
}

func (r *ExecutiveRepository) GetKPIMetrics(ctx context.Context, companyID string) (*models.KPIMetrics, error) {
	rows, err := r.db.QueryContext(ctx, "EXEC sp_KPI_executive @p1", companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to execute sp_KPI_executive: %w", err)
	}
	defer rows.Close()

	kpi := &models.KPIMetrics{
		TotalProduced: &models.TotalProduced{
			TopTypes: []models.TypeBreakdown{},
		},
		AverageRating: &models.AverageRating{},
		TopGenre:      &models.TopGenre{},
	}

	// Result Set 1: Total and Average Rating
	for rows.Next() {
		err := rows.Scan(&kpi.TotalProduced.TotalTitles, &kpi.AverageRating.AverageRating)
		if err != nil {
			return nil, fmt.Errorf("failed to scan total and average: %w", err)
		}
	}

	// Result Set 2: Top Types
	if !rows.NextResultSet() {
		return nil, fmt.Errorf("failed to move to second result set")
	}
	for rows.Next() {
		var typeBreakdown models.TypeBreakdown
		err := rows.Scan(&typeBreakdown.Count, &typeBreakdown.TypeName)
		if err != nil {
			return nil, fmt.Errorf("failed to scan type breakdown: %w", err)
		}
		kpi.TotalProduced.TopTypes = append(kpi.TotalProduced.TopTypes, typeBreakdown)
	}

	// Result Set 3: Top Genre
	if !rows.NextResultSet() {
		return nil, fmt.Errorf("failed to move to third result set")
	}
	for rows.Next() {
		err := rows.Scan(&kpi.TopGenre.GenreName, &kpi.TopGenre.TotalTitle, &kpi.TopGenre.AverageRating)
		if err != nil {
			return nil, fmt.Errorf("failed to scan top genre: %w", err)
		}
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating result sets: %w", err)
	}

	return kpi, nil
}
