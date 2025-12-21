package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"film-dashboard-api/internal/models"
)

// ArtistRepository handles artist data operations
type ArtistRepository struct {
	db *sql.DB
}

// NewArtistRepository creates a new artist repository instance
func NewArtistRepository(db *sql.DB) *ArtistRepository {
	return &ArtistRepository{db: db}
}

// SearchArtists searches artists by name keyword using sp_search_artists
func (r *ArtistRepository) SearchArtists(keyword string, limit int) ([]*models.ArtistCard, error) {
	query := `EXEC sp_search_artists @keyword = @p1, @limit = @p2`

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if limit <= 0 {
		limit = 15
	}

	rows, err := r.db.QueryContext(ctx, query, keyword, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to execute sp_search_artists: %w", err)
	}
	defer rows.Close()

	var artists []*models.ArtistCard

	for rows.Next() {
		var artist models.ArtistCard
		var totalTitles int
		var totalVotes int
		var avgRating float64

		err := rows.Scan(
			&artist.PersonID,
			&artist.PrimaryName,
			&artist.BirthYear,
			&artist.DeathYear,
			&totalTitles,
			&totalVotes,
			&avgRating,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan artist row: %w", err)
		}

		// Set pointers for optional fields
		artist.TotalTitles = &totalTitles
		if totalVotes > 0 {
			artist.TotalVotes = &totalVotes
		}
		if avgRating > 0 {
			artist.AvgRating = &avgRating
		}

		artists = append(artists, &artist)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating artist rows: %w", err)
	}

	return artists, nil
}

// GetArtistDetail mengambil detail lengkap artist berdasarkan person_id
// Menggunakan 4 SP terpisah untuk compatibility dengan go-mssqldb driver
func (r *ArtistRepository) GetArtistDetail(personID string) (*models.ArtistDetail, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	detail := &models.ArtistDetail{}

	// QUERY 1: Get Artist Detail
	query1 := `EXEC sp_get_artist_detail @person_id = @p1`
	rows1, err := r.db.QueryContext(ctx, query1, personID)
	if err != nil {
		return nil, fmt.Errorf("failed to execute sp_get_artist_detail: %w", err)
	}
	defer rows1.Close()

	if rows1.Next() {
		err := rows1.Scan(
			&detail.PersonID,
			&detail.PrimaryName,
			&detail.BirthYear,
			&detail.DeathYear,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan artist detail: %w", err)
		}
	}

	// QUERY 2: Get Professions
	query2 := `EXEC sp_get_artist_professions @person_id = @p1`
	rows2, err := r.db.QueryContext(ctx, query2, personID)
	if err != nil {
		return nil, fmt.Errorf("failed to execute sp_get_artist_professions: %w", err)
	}
	defer rows2.Close()

	var professions []string
	for rows2.Next() {
		var profession string
		if err := rows2.Scan(&profession); err != nil {
			return nil, fmt.Errorf("failed to scan profession: %w", err)
		}
		professions = append(professions, profession)
	}
	detail.Professions = professions

	// QUERY 3: Get Known For (Top Films)
	query3 := `EXEC sp_get_artist_known_for @person_id = @p1`
	rows3, err := r.db.QueryContext(ctx, query3, personID)
	if err != nil {
		return nil, fmt.Errorf("failed to execute sp_get_artist_known_for: %w", err)
	}
	defer rows3.Close()

	var knownFor []models.FilmCardData
	for rows3.Next() {
		var film models.FilmCardData
		var startYear *int
		var endYear *int
		var popularity *float64
		if err := rows3.Scan(
			&film.TitleID,
			&film.Name,
			&startYear,
			&endYear,
			&film.VoteAverage,
			&film.VoteCount,
			&popularity,
		); err != nil {
			return nil, fmt.Errorf("failed to scan known_for film: %w", err)
		}
		film.StartYear = startYear
		film.EndYear = endYear
		knownFor = append(knownFor, film)
	}
	detail.KnownFor = knownFor

	// QUERY 4: Get All Titles
	query4 := `EXEC sp_get_artist_all_titles @person_id = @p1`
	rows4, err := r.db.QueryContext(ctx, query4, personID)
	if err != nil {
		return nil, fmt.Errorf("failed to execute sp_get_artist_all_titles: %w", err)
	}
	defer rows4.Close()

	var allTitles []models.ArtistTitle
	for rows4.Next() {
		var title models.ArtistTitle
		var startYear *int
		var endYear *int
		if err := rows4.Scan(
			&title.TitleID,
			&title.Name,
			&title.TypeID,
			&startYear,
			&endYear,
			&title.Category,
			&title.Job,
			&title.Characters,
		); err != nil {
			return nil, fmt.Errorf("failed to scan all_titles: %w", err)
		}
		title.StartYear = startYear
		title.EndYear = endYear
		allTitles = append(allTitles, title)
	}
	detail.AllTitles = allTitles
	detail.TotalTitles = len(allTitles)

	return detail, nil
}
