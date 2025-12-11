package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"film-dashboard-api/internal/models"
)

type TitleRepository struct {
	db *sql.DB
}

func NewTitleRepository(db *sql.DB) *TitleRepository {
	return &TitleRepository{db: db}
}

// GetFilterOptions mengambil semua filter options (genres, types, statuses, years) dari database
func (r *TitleRepository) GetFilterOptions() (*models.FilterOptionsResponse, error) {
	response := &models.FilterOptionsResponse{
		Genres:   make([]*models.GenreOption, 0),
		Types:    make([]*models.TypeOption, 0),
		Statuses: make([]*models.StatusOption, 0),
		Years:    make([]int, 0),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Get Genres
	fmt.Println("📊 Fetching genres...")
	genreQuery := `SELECT DISTINCT genre_type_id, genre_name FROM genre_types ORDER BY genre_name`
	rows, err := r.db.QueryContext(ctx, genreQuery)
	if err != nil {
		fmt.Printf("⚠️  Genre Query Error: %v\n", err)
	} else {
		defer rows.Close()
		for rows.Next() {
			genre := &models.GenreOption{}
			if err := rows.Scan(&genre.GenreTypeID, &genre.GenreName); err == nil {
				response.Genres = append(response.Genres, genre)
			}
		}
		fmt.Printf("✅ Found %d genres\n", len(response.Genres))
	}

	// 2. Get Types
	fmt.Println("📊 Fetching types...")
	typeQuery := `SELECT type_id, type_name FROM types ORDER BY type_name`
	rows, err = r.db.QueryContext(ctx, typeQuery)
	if err != nil {
		fmt.Printf("⚠️  Type Query Error: %v\n", err)
	} else {
		defer rows.Close()
		for rows.Next() {
			typeOpt := &models.TypeOption{}
			if err := rows.Scan(&typeOpt.TypeID, &typeOpt.TypeName); err == nil {
				response.Types = append(response.Types, typeOpt)
			}
		}
		fmt.Printf("✅ Found %d types\n", len(response.Types))
	}

	// 3. Get Statuses
	fmt.Println("📊 Fetching statuses...")
	statusQuery := `SELECT status_id, status_name FROM status ORDER BY status_name`
	rows, err = r.db.QueryContext(ctx, statusQuery)
	if err != nil {
		fmt.Printf("⚠️  Status Query Error: %v\n", err)
	} else {
		defer rows.Close()
		for rows.Next() {
			status := &models.StatusOption{}
			if err := rows.Scan(&status.StatusID, &status.StatusName); err == nil {
				response.Statuses = append(response.Statuses, status)
			}
		}
		fmt.Printf("✅ Found %d statuses\n", len(response.Statuses))
	}

	// 4. Get Years (from 1900 to current year, descending)
	currentYear := time.Now().Year()
	for year := currentYear; year >= 1900; year-- {
		response.Years = append(response.Years, year)
	}
	fmt.Printf("✅ Generated %d years\n", len(response.Years))

	return response, nil
}

func (r *TitleRepository) GetTrendingTitles(limit int) ([]*models.TrendingTitle, error) {
	query := `EXEC sp_getTrendings @Limit = @p1`

	// Query returns multiple rows
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	rows, err := r.db.QueryContext(ctx, query, limit)
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
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	rows, err := r.db.QueryContext(ctx, query, limit)
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
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	rows, err := r.db.QueryContext(ctx, query, keyword)
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

// GetTitleDetail mengambil detail lengkap title berdasarkan title_id menggunakan 8 query terpisah
// Setiap data diambil dengan query terpisah untuk compatibility dengan driver go-mssqldb
// Return: TitleDetailResponse dan error (kalau ada)
func (r *TitleRepository) GetTitleDetail(titleID string) (*models.TitleDetailResponse, error) {
	fmt.Printf("\n📖 Getting title detail for: '%s'\n", titleID)

	response := &models.TitleDetailResponse{
		Genres:      make([]*models.Genre, 0),
		Languages:   make([]*models.Language, 0),
		Countries:   make([]*models.ProductionCountry, 0),
		Companies:   make([]*models.ProductionCompany, 0),
		Networks:    make([]*models.Network, 0),
		AirDates:    make([]*models.AirDate, 0),
		CastAndCrew: make([]*models.CastCrew, 0),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// 1. Get title detail
	fmt.Println("📊 QUERY 1: Title Detail")
	query1 := `SELECT 
        t.title_id,
        t.name,
        t.original_name,
        t.overview,
        t.popularity,
        t.vote_average,
        t.vote_count,
        t.runtimeMinutes,
        t.startYear,
        t.endYear,
        t.number_of_seasons,
        t.number_of_episodes,
        ty.type_name,
        s.status_name,
        t.tagline
    FROM titles t
    LEFT JOIN types ty ON t.type_id = ty.type_id
    LEFT JOIN status s ON t.status_id = s.status_id
    WHERE t.title_id = @p1`

	rows, err := r.db.QueryContext(ctx, query1, titleID)
	if err != nil {
		fmt.Printf("❌ Query 1 Error: %v\n", err)
		return nil, fmt.Errorf("failed to execute query 1: %w", err)
	}
	defer rows.Close()

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
		fmt.Printf("✅ Got title: %s (ID: %s)\n", *detail.Name, *detail.TitleID)
	} else {
		fmt.Println("⚠️  No title detail found")
		return response, nil
	}
	rows.Close()
	// 2. Get genres
	fmt.Println("📊 QUERY 2: Genres")
	query2 := `SELECT gt.genre_name
    FROM genres g
    JOIN genre_types gt ON g.genre_type_id = gt.genre_type_id
    WHERE g.title_id = @p1`

	rows, err = r.db.QueryContext(ctx, query2, titleID)
	if err != nil {
		fmt.Printf("⚠️  Genres Query Error: %v\n", err)
	} else {
		defer rows.Close()
		genreCount := 0
		for rows.Next() {
			genre := &models.Genre{}
			err := rows.Scan(&genre.GenreName)
			if err == nil {
				response.Genres = append(response.Genres, genre)
				genreCount++
			}
		}
		fmt.Printf("✅ Found %d genres\n", genreCount)
	}

	// 3. Get languages
	fmt.Println("📊 QUERY 3: Languages")
	query3 := `SELECT lt.language_name
    FROM languages l
    JOIN language_types lt ON l.language_type_id = lt.language_type_id
    WHERE l.title_id = @p1`

	rows, err = r.db.QueryContext(ctx, query3, titleID)
	if err != nil {
		fmt.Printf("⚠️  Languages Query Error: %v\n", err)
	} else {
		defer rows.Close()
		langCount := 0
		for rows.Next() {
			lang := &models.Language{}
			err := rows.Scan(&lang.LanguageName)
			if err == nil {
				response.Languages = append(response.Languages, lang)
				langCount++
			}
		}
		fmt.Printf("✅ Found %d languages\n", langCount)
	}

	// 4. Get production countries
	fmt.Println("📊 QUERY 4: Production Countries")
	query4 := `SELECT pct.production_country_name
    FROM production_countries pc
    JOIN production_country_types pct ON pc.production_country_type_id = pct.production_country_type_id
    WHERE pc.title_id = @p1`

	rows, err = r.db.QueryContext(ctx, query4, titleID)
	if err != nil {
		fmt.Printf("⚠️  Countries Query Error: %v\n", err)
	} else {
		defer rows.Close()
		countryCount := 0
		for rows.Next() {
			country := &models.ProductionCountry{}
			err := rows.Scan(&country.CountryName)
			if err == nil {
				response.Countries = append(response.Countries, country)
				countryCount++
			}
		}
		fmt.Printf("✅ Found %d countries\n", countryCount)
	}

	// 5. Get production companies
	fmt.Println("📊 QUERY 5: Production Companies")
	query5 := `SELECT pct.production_company_name
    FROM production_companies pc
    JOIN production_company_types pct ON pc.production_company_type_id = pct.production_company_type_id
    WHERE pc.title_id = @p1`

	rows, err = r.db.QueryContext(ctx, query5, titleID)
	if err != nil {
		fmt.Printf("⚠️  Companies Query Error: %v\n", err)
	} else {
		defer rows.Close()
		companyCount := 0
		for rows.Next() {
			company := &models.ProductionCompany{}
			err := rows.Scan(&company.CompanyName)
			if err == nil {
				response.Companies = append(response.Companies, company)
				companyCount++
			}
		}
		fmt.Printf("✅ Found %d companies\n", companyCount)
	}

	// 6. Get networks
	fmt.Println("📊 QUERY 6: Networks")
	query6 := `SELECT nt.network_name
    FROM networks n
    JOIN network_types nt ON n.network_type_id = nt.network_type_id
    WHERE n.title_id = @p1`

	rows, err = r.db.QueryContext(ctx, query6, titleID)
	if err != nil {
		fmt.Printf("⚠️  Networks Query Error: %v\n", err)
	} else {
		defer rows.Close()
		networkCount := 0
		for rows.Next() {
			network := &models.Network{}
			err := rows.Scan(&network.NetworkName)
			if err == nil {
				response.Networks = append(response.Networks, network)
				networkCount++
			}
		}
		fmt.Printf("✅ Found %d networks\n", networkCount)
	}

	// 7. Get air dates
	fmt.Println("📊 QUERY 7: Air Dates")
	query7 := `SELECT a.date, a.is_first, e.seasonNumber, e.episodeNumber
    FROM air_dates a
    LEFT JOIN episodes e ON a.title_id = e.title_id
    WHERE a.title_id = @p1`

	rows, err = r.db.QueryContext(ctx, query7, titleID)
	if err != nil {
		fmt.Printf("⚠️  Air Dates Query Error: %v\n", err)
	} else {
		defer rows.Close()
		airDateCount := 0
		for rows.Next() {
			airDate := &models.AirDate{}
			err := rows.Scan(
				&airDate.Date,
				&airDate.IsFirst,
				&airDate.SeasonNumber,
				&airDate.EpisodeNumber,
			)
			if err == nil {
				response.AirDates = append(response.AirDates, airDate)
				airDateCount++
			}
		}
		fmt.Printf("✅ Found %d air dates\n", airDateCount)
	}

	// 8. Get cast and crew
	fmt.Println("📊 QUERY 8: Cast & Crew")
	query8 := `SELECT tp.ordering, p.primaryName AS person_name, tp.category AS job_category, tp.characters
    FROM title_principals tp
    JOIN persons p ON tp.person_id = p.person_id
    WHERE tp.title_id = @p1
    ORDER BY tp.ordering`

	rows, err = r.db.QueryContext(ctx, query8, titleID)
	if err != nil {
		fmt.Printf("⚠️  Cast/Crew Query Error: %v\n", err)
	} else {
		defer rows.Close()
		castCount := 0
		for rows.Next() {
			castCrew := &models.CastCrew{}
			err := rows.Scan(
				&castCrew.Ordering,
				&castCrew.PersonName,
				&castCrew.JobCategory,
				&castCrew.Characters,
			)
			if err == nil {
				response.CastAndCrew = append(response.CastAndCrew, castCrew)
				castCount++
			}
		}
		fmt.Printf("✅ Found %d cast/crew members\n\n", castCount)
	}

	return response, nil
}

// FilterTitles melakukan filter titles berdasarkan berbagai parameter menggunakan sp_filter_titles
// Supports multiple selections untuk Genre, Type, Status, dan Countries
// Pagination handled in SP using Page and Limit parameters
func (r *TitleRepository) FilterTitles(
	genreIDs []string,
	typeIDs []string,
	statusIDs []string,
	originCountryIDs []string,
	productionCountryIDs []string,
	year *int,
	sortBy string,
	offset int,
	limit int,
) ([]*models.FilteredTitle, int, error) {
	// Calculate page from offset and limit
	// SP expects: Page parameter (1-based), not offset
	// offset = (page - 1) * limit, so page = (offset / limit) + 1
	page := (offset / limit) + 1
	if page < 1 {
		page = 1
	}

	// Convert slices to pointers (use first value if multiple, or nil if empty)
	var genreID, typeID, statusID, originCountryID, productionCountryID *string
	if len(genreIDs) > 0 {
		genreID = &genreIDs[0]
	}
	if len(typeIDs) > 0 {
		typeID = &typeIDs[0]
	}
	if len(statusIDs) > 0 {
		statusID = &statusIDs[0]
	}
	if len(originCountryIDs) > 0 {
		originCountryID = &originCountryIDs[0]
	}
	if len(productionCountryIDs) > 0 {
		productionCountryID = &productionCountryIDs[0]
	}

	query := `EXEC sp_filter_titles 
		@GenreId = @p1,
		@TypeId = @p2,
		@StatusId = @p3,
		@OriginCountryId = @p4,
		@ProductionCountryId = @p5,
		@Year = @p6,
		@SortBy = @p7,
		@Page = @p8,
		@Limit = @p9`

	fmt.Println("\n=== FILTER REQUEST ===")
	fmt.Printf("GenreIDs: %v (%d items), TypeIDs: %v (%d items), StatusIDs: %v (%d items)\n", 
		genreIDs, len(genreIDs), typeIDs, len(typeIDs), statusIDs, len(statusIDs))
	fmt.Printf("OriginCountryIDs: %v, ProductionCountryIDs: %v, Year: %v\n", originCountryIDs, productionCountryIDs, year)
	fmt.Printf("SortBy: %s, Page: %d, Limit: %d\n", sortBy, page, limit)

	// Execute query with pagination handled in SP
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	rows, err := r.db.QueryContext(ctx, query, genreID, typeID, statusID, originCountryID, productionCountryID, year, sortBy, page, limit)
	if err != nil {
		fmt.Printf("❌ Database Query Error: %v\n", err)
		return nil, 0, fmt.Errorf("failed to execute filter query: %w", err)
	}
	defer rows.Close()

	fmt.Println("✅ Query executed successfully")

	// Slice untuk store results (will contain exactly `limit` rows or fewer for last page)
	var titles []*models.FilteredTitle

	// Loop through rows
	for rows.Next() {
		var title models.FilteredTitle

		// Scan each row - match SP columns: SELECT t.* (all columns from titles table)
		// Column order: title_id, name, number_of_seasons, number_of_episodes, overview, adult,
		//              in_production, original_name, popularity, tagline, runtimeMinutes,
		//              type_id, status_id, vote_count, vote_average, startYear, endYear
		var numberOfSeasons sql.NullInt32
		var numberOfEpisodes sql.NullInt32
		var overview sql.NullString
		var adult sql.NullBool
		var inProduction sql.NullBool
		var originalName sql.NullString
		var popularity sql.NullInt32
		var tagline sql.NullString
		var runtimeMinutes sql.NullInt32
		var typeID sql.NullString
		var statusID sql.NullString
		var voteCount sql.NullInt32
		var voteAverage sql.NullFloat64
		var startYear sql.NullInt32
		var endYear sql.NullInt32

		err := rows.Scan(
			&title.TitleID,
			&title.Name,
			&numberOfSeasons,
			&numberOfEpisodes,
			&overview,
			&adult,
			&inProduction,
			&originalName,
			&popularity,
			&tagline,
			&runtimeMinutes,
			&typeID,
			&statusID,
			&voteCount,
			&voteAverage,
			&startYear,
			&endYear,
		)
		if err != nil {
			fmt.Printf("❌ Scan Error: %v\n", err)
			return nil, 0, fmt.Errorf("failed to scan row: %w", err)
		}

		// Map nullable fields to title struct (convert int32 to int)
		if numberOfSeasons.Valid {
			val := int(numberOfSeasons.Int32)
			title.NumberSeasons = &val
		}
		if numberOfEpisodes.Valid {
			val := int(numberOfEpisodes.Int32)
			title.NumberEpisodes = &val
		}
		if overview.Valid {
			title.Overview = &overview.String
		}
		if adult.Valid {
			title.Adult = &adult.Bool
		}
		if inProduction.Valid {
			title.InProduction = &inProduction.Bool
		}
		if originalName.Valid {
			title.OriginalName = &originalName.String
		}
		if popularity.Valid {
			val := int(popularity.Int32)
			title.Popularity = &val
		}
		if tagline.Valid {
			title.Tagline = &tagline.String
		}
		if runtimeMinutes.Valid {
			val := int(runtimeMinutes.Int32)
			title.RuntimeMinutes = &val
		}
		if typeID.Valid {
			title.TypeID = &typeID.String
		}
		if statusID.Valid {
			title.StatusID = &statusID.String
		}
		if voteCount.Valid {
			val := int(voteCount.Int32)
			title.VoteCount = &val
		}
		if voteAverage.Valid {
			title.VoteAverage = &voteAverage.Float64
		}
		if startYear.Valid {
			val := int(startYear.Int32)
			title.StartYear = &val
		}
		if endYear.Valid {
			val := int(endYear.Int32)
			title.EndYear = &val
		}

		// Append ke slice
		titles = append(titles, &title)
		ratingStr := "N/A"
		if title.VoteAverage != nil {
			ratingStr = fmt.Sprintf("%.1f", *title.VoteAverage)
		}
		yearStr := "N/A"
		if title.StartYear != nil {
			yearStr = fmt.Sprintf("%d", *title.StartYear)
		}
		fmt.Printf("✅ Found: %s (Rating: %s, Year: %s)\n", title.Name, ratingStr, yearStr)
	}

	// Check error dari rows iteration
	if err = rows.Err(); err != nil {
		fmt.Printf("❌ Rows Iteration Error: %v\n", err)
		return nil, 0, fmt.Errorf("error iterating rows: %w", err)
	}

	// Get total count - need to query separately to get accurate total
	totalCount, err := r.GetFilterTitlesCount(genreID, typeID, statusID, originCountryID, productionCountryID, year)
	if err != nil {
		fmt.Printf("⚠️  Warning: Could not get total count: %v\n", err)
		totalCount = len(titles) // Fallback to returned count
	}

	fmt.Printf("📊 Total matching titles: %d\n", totalCount)
	fmt.Printf("📊 Returned (page %d): %d\n", page, len(titles))
	fmt.Println("====================\n")

	return titles, totalCount, nil
}

// GetFilterTitlesCount menghitung total matching titles (untuk pagination info)
// Matches the same filters as sp_filter_titles
func (r *TitleRepository) GetFilterTitlesCount(
	genreID *string,
	typeID *string,
	statusID *string,
	originCountryID *string,
	productionCountryID *string,
	year *int,
) (int, error) {
	// Build query with proper parameter handling
	query := `SELECT COUNT(*) FROM (
		SELECT TOP 1000 t.title_id
		FROM titles t`

	where := " WHERE 1=1"
	var params []interface{}
	paramNum := 1

	// Add joins based on which filters are active
	if genreID != nil {
		query += " JOIN genres g ON g.title_id = t.title_id"
	}
	if originCountryID != nil {
		query += " JOIN production_countries oc ON oc.title_id = t.title_id"
	}
	if productionCountryID != nil {
		query += " JOIN production_countries pc ON pc.title_id = t.title_id"
	}

	// Add WHERE conditions with proper parameter binding
	if genreID != nil {
		where += fmt.Sprintf(" AND g.genre_type_id = @p%d", paramNum)
		params = append(params, genreID)
		paramNum++
	}
	if typeID != nil {
		where += fmt.Sprintf(" AND t.type_id = @p%d", paramNum)
		params = append(params, typeID)
		paramNum++
	}
	if statusID != nil {
		where += fmt.Sprintf(" AND t.status_id = @p%d", paramNum)
		params = append(params, statusID)
		paramNum++
	}
	if originCountryID != nil {
		where += fmt.Sprintf(" AND oc.origin_country_type_id = @p%d", paramNum)
		params = append(params, originCountryID)
		paramNum++
	}
	if productionCountryID != nil {
		where += fmt.Sprintf(" AND pc.production_country_type_id = @p%d", paramNum)
		params = append(params, productionCountryID)
		paramNum++
	}
	if year != nil {
		where += fmt.Sprintf(" AND t.startYear = @p%d", paramNum)
		params = append(params, year)
		paramNum++
	}

	query += where + ") AS cnt"

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	var count int
	err := r.db.QueryRowContext(ctx, query, params...).Scan(&count)
	if err != nil {
		fmt.Printf("❌ Count Query Error: %v\n", err)
		fmt.Printf("📝 Query: %s\n", query)
		fmt.Printf("📝 Params: %v\n", params)
		return 0, fmt.Errorf("failed to get filter titles count: %w", err)
	}

	return count, nil
}
