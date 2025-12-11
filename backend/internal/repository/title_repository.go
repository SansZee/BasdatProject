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

// SearchTitles mencari titles berdasarkan keyword menggunakan sp_SearchTitles
// Parameter: keyword (search term)
// Return: slice dari SearchTitle dan error (kalau ada)
func (r *TitleRepository) SearchTitles(keyword string) ([]*models.SearchTitle, error) {
	query := `EXEC sp_SearchTitles @keyword = @p1`

	// Query returns multiple rows
	rows, err := r.db.Query(query, keyword)
	if err != nil {
		return nil, fmt.Errorf("failed to execute search query: %w", err)
	}
	defer rows.Close()

	// Slice untuk store results
	var titles []*models.SearchTitle

	// Loop through rows
	for rows.Next() {
		var title models.SearchTitle

		// Scan each row (4 columns: title_id, name, overview, vote_average)
		err := rows.Scan(
			&title.TitleID,
			&title.Name,
			&title.Overview,
			&title.VoteAverage,
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

// GetTitleDetail mengambil detail lengkap title berdasarkan title_id menggunakan sp_GetTitleDetail
// Procedure mengembalikan 8 result set berbeda
// Return: TitleDetailResponse dan error (kalau ada)
func (r *TitleRepository) GetTitleDetail(titleID string) (*models.TitleDetailResponse, error) {
	query := `EXEC sp_GetTitleDetail @title_id = @p1`

	// Execute query yang mengembalikan multiple result sets
	rows, err := r.db.Query(query, titleID)

	if err != nil {
		return nil, fmt.Errorf("failed to execute detail query: %w", err)
	}
	defer rows.Close()

	response := &models.TitleDetailResponse{
		Genres:      make([]*models.Genre, 0),
		Languages:   make([]*models.Language, 0),
		Countries:   make([]*models.ProductionCountry, 0),
		Companies:   make([]*models.ProductionCompany, 0),
		Networks:    make([]*models.Network, 0),
		AirDates:    make([]*models.AirDate, 0),
		CastAndCrew: make([]*models.CastCrew, 0),
	}

	// 1. Read title detail (first result set)
	if rows.Next() {
		detail := &models.TitleDetail{}
		err := rows.Scan(
			&detail.TitleID,
			&detail.Name,
			&detail.OriginalName,
			&detail.Overview,
			&detail.Popularity,
			&detail.VoteAverage,
			&detail.VoteCount,
			&detail.RuntimeMinutes,
			&detail.StartYear,
			&detail.EndYear,
			&detail.NumberSeasons,
			&detail.NumberEpisodes,
			&detail.Type,
			&detail.Status,
			&detail.Tagline,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan title detail: %w", err)
		}
		response.Detail = detail
	}

	// Move to next result set (Genres)
	if !rows.NextResultSet() {
		return response, nil
	}

	// 2. Read genres
	for rows.Next() {
		genre := &models.Genre{}
		err := rows.Scan(&genre.GenreName)
		if err != nil {
			return nil, fmt.Errorf("failed to scan genre: %w", err)
		}
		response.Genres = append(response.Genres, genre)
	}

	// Move to next result set (Languages)
	if !rows.NextResultSet() {
		return response, nil
	}

	// 3. Read languages
	for rows.Next() {
		lang := &models.Language{}
		err := rows.Scan(&lang.LanguageName)
		if err != nil {
			return nil, fmt.Errorf("failed to scan language: %w", err)
		}
		response.Languages = append(response.Languages, lang)
	}

	// Move to next result set (Countries)
	if !rows.NextResultSet() {
		return response, nil
	}

	// 4. Read production countries
	for rows.Next() {
		country := &models.ProductionCountry{}
		err := rows.Scan(&country.CountryName)
		if err != nil {
			return nil, fmt.Errorf("failed to scan country: %w", err)
		}
		response.Countries = append(response.Countries, country)
	}

	// Move to next result set (Companies)
	if !rows.NextResultSet() {
		return response, nil
	}

	// 5. Read production companies
	for rows.Next() {
		company := &models.ProductionCompany{}
		err := rows.Scan(&company.CompanyName)
		if err != nil {
			return nil, fmt.Errorf("failed to scan company: %w", err)
		}
		response.Companies = append(response.Companies, company)
	}

	// Move to next result set (Networks)
	if !rows.NextResultSet() {
		return response, nil
	}

	// 6. Read networks
	for rows.Next() {
		network := &models.Network{}
		err := rows.Scan(&network.NetworkName)
		if err != nil {
			return nil, fmt.Errorf("failed to scan network: %w", err)
		}
		response.Networks = append(response.Networks, network)
	}

	// Move to next result set (Air dates)
	if !rows.NextResultSet() {
		return response, nil
	}

	// 7. Read air dates
	for rows.Next() {
		airDate := &models.AirDate{}
		err := rows.Scan(
			&airDate.Date,
			&airDate.IsFirst,
			&airDate.SeasonNumber,
			&airDate.EpisodeNumber,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan air date: %w", err)
		}
		response.AirDates = append(response.AirDates, airDate)
	}

	// Move to next result set (Cast & Crew)
	if !rows.NextResultSet() {
		return response, nil
	}

	// 8. Read cast and crew
	for rows.Next() {
		castCrew := &models.CastCrew{}
		err := rows.Scan(
			&castCrew.Ordering,
			&castCrew.PersonName,
			&castCrew.JobCategory,
			&castCrew.Characters,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan cast/crew: %w", err)
		}
		response.CastAndCrew = append(response.CastAndCrew, castCrew)
	}

	return response, nil
}
