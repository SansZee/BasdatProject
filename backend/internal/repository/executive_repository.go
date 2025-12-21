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
		var avgRating *float64 // Handle NULL
		err := rows.Scan(&kpi.TotalProduced.TotalTitles, &avgRating)
		if err != nil {
			return nil, fmt.Errorf("failed to scan total and average: %w", err)
		}
		if avgRating != nil {
			kpi.AverageRating.AverageRating = *avgRating
		} else {
			kpi.AverageRating.AverageRating = 0
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
		var genreName string
		var totalTitle int
		var avgRating *float64
		err := rows.Scan(&genreName, &totalTitle, &avgRating)
		if err != nil {
			return nil, fmt.Errorf("failed to scan top genre: %w", err)
		}
		kpi.TopGenre.GenreName = genreName
		kpi.TopGenre.TotalTitle = totalTitle
		if avgRating != nil {
			kpi.TopGenre.AverageRating = *avgRating
		}
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating result sets: %w", err)
	}

	return kpi, nil
}

// GetBestTitles mengambil top titles untuk company berdasarkan rating & votes
func (r *ExecutiveRepository) GetBestTitles(ctx context.Context, companyID string, top int) ([]models.BestTitle, error) {
	query := `EXEC sp_best_title @p1, @p2`
	rows, err := r.db.QueryContext(ctx, query, companyID, top)
	if err != nil {
		return nil, fmt.Errorf("failed to execute sp_best_title: %w", err)
	}
	defer rows.Close()

	var titles []models.BestTitle
	for rows.Next() {
		var title models.BestTitle
		err := rows.Scan(&title.Name, &title.VoteAverage, &title.VoteCount)
		if err != nil {
			return nil, fmt.Errorf("failed to scan best title: %w", err)
		}
		titles = append(titles, title)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating best titles: %w", err)
	}

	return titles, nil
}

// GetGenreTrend mengambil genre trend data (votes per year)
func (r *ExecutiveRepository) GetGenreTrend(ctx context.Context, companyID string) ([]models.GenreTrend, error) {
	query := `EXEC sp_genre_trend @p1`
	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to execute sp_genre_trend: %w", err)
	}
	defer rows.Close()

	var trends []models.GenreTrend
	for rows.Next() {
		var trend models.GenreTrend
		err := rows.Scan(&trend.GenreName, &trend.StartYear, &trend.TotalVotes)
		if err != nil {
			return nil, fmt.Errorf("failed to scan genre trend: %w", err)
		}
		trends = append(trends, trend)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating genre trends: %w", err)
	}

	return trends, nil
}

// GetSummaryTrend mengambil production summary trend (production count & rating per year)
func (r *ExecutiveRepository) GetSummaryTrend(ctx context.Context, companyID string, yearRange int) ([]models.SummaryTrendItem, error) {
	query := `EXEC sp_KPI_summary_trend @p1, @p2`
	rows, err := r.db.QueryContext(ctx, query, companyID, yearRange)
	if err != nil {
		return nil, fmt.Errorf("failed to execute sp_KPI_summary_trend: %w", err)
	}
	defer rows.Close()

	var trends []models.SummaryTrendItem
	for rows.Next() {
		var trend models.SummaryTrendItem
		var avgRating *float64
		err := rows.Scan(&trend.ProductionYear, &trend.TotalProduction, &avgRating)
		if err != nil {
			return nil, fmt.Errorf("failed to scan summary trend: %w", err)
		}
		if avgRating != nil {
			trend.AvgRating = *avgRating
		}
		trends = append(trends, trend)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating summary trends: %w", err)
	}

	return trends, nil
}

// GetTopCompanies mengambil top production companies
func (r *ExecutiveRepository) GetTopCompanies(ctx context.Context, top *int) ([]models.TopCompany, error) {
	query := `EXEC sp_top_companies @p1`
	rows, err := r.db.QueryContext(ctx, query, top)
	if err != nil {
		return nil, fmt.Errorf("failed to execute sp_top_companies: %w", err)
	}
	defer rows.Close()

	var companies []models.TopCompany
	for rows.Next() {
		var company models.TopCompany
		var avgRating *float64
		err := rows.Scan(&company.ProductionCompanyTypeID, &company.ProductionCompanyName, &company.JumlahTayangan, &avgRating)
		if err != nil {
			return nil, fmt.Errorf("failed to scan top company: %w", err)
		}
		if avgRating != nil {
			company.AvgRating = *avgRating
		}
		companies = append(companies, company)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating top companies: %w", err)
	}

	return companies, nil
}
