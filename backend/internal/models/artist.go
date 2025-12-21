package models

// ArtistCard merepresentasikan data artist untuk search results
type ArtistCard struct {
	PersonID    string  `json:"person_id"`
	PrimaryName string  `json:"primary_name"`
	BirthYear   *int    `json:"birth_year"`
	DeathYear   *int    `json:"death_year"`
	TotalTitles *int    `json:"total_titles"`
	TotalVotes  *int    `json:"total_votes"`
	AvgRating   *float64 `json:"avg_rating"`
}

// ArtistDetail merepresentasikan detail lengkap artist
type ArtistDetail struct {
	PersonID       string   `json:"person_id"`
	PrimaryName    string   `json:"primary_name"`
	BirthYear      *int     `json:"birth_year"`
	DeathYear      *int     `json:"death_year"`
	Professions    []string `json:"professions"`
	KnownFor       []FilmCardData `json:"known_for"`
	AllTitles      []ArtistTitle `json:"all_titles"`
	TotalTitles    int      `json:"total_titles"`
}

// ArtistTitle merepresentasikan film/series yang dikerjakan artist
type ArtistTitle struct {
	TitleID    string `json:"title_id"`
	Name       string `json:"name"`
	TypeID     string `json:"type_id"`
	StartYear  *int   `json:"start_year"`
	EndYear    *int   `json:"end_year"`
	PosterURL  *string `json:"poster_url"`
	Category   string `json:"category"`
	Job        *string `json:"job"`
	Characters *string `json:"characters"`
}
