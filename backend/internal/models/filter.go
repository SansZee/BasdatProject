package models

// FilterRequest merepresentasikan request body untuk filter titles
// Semua parameter bersifat optional
// Supports multiple selections untuk Genre, Type, Status, dan Countries
type FilterRequest struct {
	GenreIDs              []string `json:"genreIds"`              // Optional: multiple genre IDs
	TypeIDs               []string `json:"typeIds"`               // Optional: multiple type IDs
	StatusIDs             []string `json:"statusIds"`             // Optional: multiple status IDs
	OriginCountryIDs      []string `json:"originCountryIds"`      // Optional: multiple origin country IDs
	ProductionCountryIDs  []string `json:"productionCountryIds"`  // Optional: multiple production country IDs
	Year                  *int     `json:"year"`                  // Optional: release year
	SortBy                string   `json:"sortBy"`                // Default: "released" (rating, popularity, etc)
	Page                  int      `json:"page"`                  // Pagination: page number (default 1)
	Limit                 int      `json:"limit"`                 // Pagination: items per page (default 20)
}

// FilteredTitle merepresentasikan hasil filter titles (dari sp_filter_titles)
// Match dengan semua columns dari titles table: SELECT t.*
type FilteredTitle struct {
	TitleID          string  `json:"title_id"`             // film ID (Primary Key)
	Name             string  `json:"name"`                 // film name
	NumberSeasons    *int    `json:"number_of_seasons"`    // nullable
	NumberEpisodes   *int    `json:"number_of_episodes"`   // nullable
	Overview         *string `json:"overview"`             // nullable
	Adult            *bool   `json:"adult"`                // nullable
	InProduction     *bool   `json:"in_production"`        // nullable
	OriginalName     *string `json:"original_name"`        // nullable
	Popularity       *int    `json:"popularity"`           // nullable
	Tagline          *string `json:"tagline"`              // nullable
	RuntimeMinutes   *int    `json:"runtime_minutes"`      // nullable
	TypeID           *string `json:"type_id"`              // nullable
	StatusID         *string `json:"status_id"`            // nullable
	VoteCount        *int    `json:"vote_count"`           // nullable
	VoteAverage      *float64 `json:"vote_average"`        // vote average rating
	StartYear        *int    `json:"start_year"`           // release/start year
	EndYear          *int    `json:"end_year"`             // nullable, for TV series
}

// FilterResponse merepresentasikan response structure untuk filter results
type FilterResponse struct {
	Success bool             `json:"success"` // true/false
	Data    []*FilteredTitle `json:"data"`    // array of filtered titles
	Count   int              `json:"count"`   // total count from database
}

// PaginationInfo merepresentasikan informasi pagination
type PaginationInfo struct {
	Page      int `json:"page"`
	Limit     int `json:"limit"`
	Total     int `json:"total"`
	TotalPage int `json:"totalPage"`
}
