package models

import "time"

// Film merepresentasikan data film dari database
// Struct ini mirror table Movies di SQL Server
type Film struct {
	MovieID          int       // movie_id (Primary Key)
	Title            string    // title
	ReleaseYear      int       // release_year
	Duration         int       // duration (dalam menit)
	Rating           float64   // rating (misal: 8.5)
	Synopsis         string    // synopsis
	PosterURL        string    // poster_url
	Budget           *float64  // budget (bisa NULL, makanya pakai pointer)
	Revenue          *float64  // revenue (bisa NULL)
	Country          string    // country
	Language         string    // language
	CreatedAt        time.Time // created_at
	UpdatedAt        time.Time // updated_at
}

// FilmResponse adalah model film untuk response ke frontend
// Bisa dimodifikasi sesuai kebutuhan (misal: hide budget/revenue untuk native user)
type FilmResponse struct {
	MovieID     int     `json:"movie_id"`
	Title       string  `json:"title"`
	ReleaseYear int     `json:"release_year"`
	Duration    int     `json:"duration"`
	Rating      float64 `json:"rating"`
	Synopsis    string  `json:"synopsis"`
	PosterURL   string  `json:"poster_url"`
	Country     string  `json:"country"`
	Language    string  `json:"language"`
}

// ToResponse convert Film ke FilmResponse
func (f *Film) ToResponse() FilmResponse {
	return FilmResponse{
		MovieID:     f.MovieID,
		Title:       f.Title,
		ReleaseYear: f.ReleaseYear,
		Duration:    f.Duration,
		Rating:      f.Rating,
		Synopsis:    f.Synopsis,
		PosterURL:   f.PosterURL,
		Country:     f.Country,
		Language:    f.Language,
	}
}

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