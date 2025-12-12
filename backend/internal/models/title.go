package models

import (
	"time"
)

// FilmCardData merepresentasikan consistent filmcard data dari semua SP
// Digunakan oleh: sp_getTrendings, sp_getTopRated, sp_SearchTitles
type FilmCardData struct {
	TitleID     string  `json:"title_id"`
	Name        string  `json:"name"`
	StartYear   int     `json:"start_year"`
	VoteAverage float64 `json:"vote_average"`
	VoteCount   int     `json:"vote_count"`
	GenreName   string  `json:"genre_name"`
}

// TrendingTitle - alias untuk backwards compatibility
type TrendingTitle = FilmCardData

// SearchTitle - alias untuk backwards compatibility
type SearchTitle = FilmCardData

// Actor merepresentasikan data actor dari database
type Actor struct {
	ActorID     int       // actor_id (Primary Key)
	Name        string    // name
	BirthDate   time.Time // birth_date
	Country     string    // country
	Biography   string    // biography
	PhotoURL    string    // photo_url
	CreatedAt   time.Time // created_at
	UpdatedAt   time.Time // updated_at
}

// ActorResponse adalah model actor untuk response ke frontend
type ActorResponse struct {
	ActorID   int    `json:"actor_id"`
	Name      string `json:"name"`
	BirthDate string `json:"birth_date"` // Format: "1990-01-15"
	Country   string `json:"country"`
	Biography string `json:"biography"`
	PhotoURL  string `json:"photo_url"`
}

// ToResponse convert Actor ke ActorResponse
func (a *Actor) ToResponse() ActorResponse {
	return ActorResponse{
		ActorID:   a.ActorID,
		Name:      a.Name,
		BirthDate: a.BirthDate.Format("2006-01-02"), // Format tanggal jadi string
		Country:   a.Country,
		Biography: a.Biography,
		PhotoURL:  a.PhotoURL,
	}
}
