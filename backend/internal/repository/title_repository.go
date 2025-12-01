package repository

import (
	"database/sql"
	"fmt"
	
	"film-dashboard-api/internal/models"
)

type TitleRepository struct {
	db *sql.DB
}

func NewTitleRepository(db *sql.DB) *TitleRepository {
	return &TitleRepository{db: db}
}

func (r *TitleRepository) GetTrendingTitles(limit int) ([]*models.TrendingTitle, error) {
	query := `EXEC sp_getTrendings @Limit = @p1`

	// Query returns multiple rows
	rows, err := r.db.Query(query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	// Slice untuk store results
	var titles []*models.TrendingTitle

	// Loop through rows
	for rows.Next() {
		var title models.TrendingTitle

		// Scan each row
		err := rows.Scan(
			&title.TitleID,
			&title.Name,
			&title.StartYear,
			&title.VoteAverage,
			&title.VoteCount,
			&title.GenreName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		// Append ke slice
		titles = append(titles, &title)
	}

	// Check error dari rows iteration
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return titles, nil
}

func (r *TitleRepository) GetTopRatedTitles(limit int) ([]*models.TrendingTitle, error) {
	query := `EXEC sp_getTopRated @Limit = @p1`

	// Query returns multiple rows
	rows, err := r.db.Query(query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	// Slice untuk store results
	var titles []*models.TrendingTitle

	// Loop through rows
	for rows.Next() {
		var title models.TrendingTitle

		// Scan each row
		err := rows.Scan(
			&title.TitleID,
			&title.Name,
			&title.StartYear,
			&title.VoteAverage,
			&title.VoteCount,
			&title.GenreName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		// Append ke slice
		titles = append(titles, &title)
	}

	// Check error dari rows iteration
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return titles, nil
}