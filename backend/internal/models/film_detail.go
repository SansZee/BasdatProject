package models

import "time"

// FilmDetail merepresentasikan informasi lengkap sebuah film
type FilmDetail struct {
	TitleID           string    `json:"title_id"`
	Name              *string   `json:"name"`
	StartYear         *int      `json:"start_year"`
	EndYear           *int      `json:"end_year"`
	VoteAverage       *float64  `json:"vote_average"`
	VoteCount         *int      `json:"vote_count"`
	Runtime           *int      `json:"runtime"` // minutes
	Genres            []string  `json:"genres"`
	Synopsis          *string   `json:"synopsis"`
	ProductionCompany *string   `json:"production_company"`
	SpokenLanguage    *string   `json:"spoken_language"`
	EpisodeCount      *int      `json:"episode_count"`      // nullable, hanya untuk series
	SeasonCount       *int      `json:"season_count"`       // nullable, hanya untuk series
	Directors         []string  `json:"directors"`
	Writers           []string  `json:"writers"`
	Cast              []Actor   `json:"cast"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// FilmDetailResponse untuk API response (safe untuk frontend)
type FilmDetailResponse struct {
	TitleID           string              `json:"title_id"`
	Name              *string             `json:"name"`
	StartYear         *int                `json:"start_year"`
	EndYear           *int                `json:"end_year"`
	VoteAverage       *float64            `json:"vote_average"`
	VoteCount         *int                `json:"vote_count"`
	Runtime           *int                `json:"runtime"`
	Genres            []string            `json:"genres"`
	Synopsis          *string             `json:"synopsis"`
	ProductionCompany *string             `json:"production_company"`
	SpokenLanguage    *string             `json:"spoken_language"`
	EpisodeCount      *int                `json:"episode_count"`
	SeasonCount       *int                `json:"season_count"`
	Directors         []string            `json:"directors"`
	Writers           []string            `json:"writers"`
	Cast              []ActorResponse     `json:"cast"`
}

// ToResponse converts FilmDetail ke FilmDetailResponse
func (f *FilmDetail) ToResponse() FilmDetailResponse {
	castResponses := make([]ActorResponse, len(f.Cast))
	for i, actor := range f.Cast {
		castResponses[i] = actor.ToResponse()
	}

	return FilmDetailResponse{
		TitleID:           f.TitleID,
		Name:              f.Name,
		StartYear:         f.StartYear,
		EndYear:           f.EndYear,
		VoteAverage:       f.VoteAverage,
		VoteCount:         f.VoteCount,
		Runtime:           f.Runtime,
		Genres:            f.Genres,
		Synopsis:          f.Synopsis,
		ProductionCompany: f.ProductionCompany,
		SpokenLanguage:    f.SpokenLanguage,
		EpisodeCount:      f.EpisodeCount,
		SeasonCount:       f.SeasonCount,
		Directors:         f.Directors,
		Writers:           f.Writers,
		Cast:              castResponses,
	}
}
