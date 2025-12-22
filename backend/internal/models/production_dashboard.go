package models

import (
	"database/sql"
	"encoding/json"
)

// Status Distribution
type StatusDistribution struct {
	StatusID    string `json:"status_id"`
	StatusName  string `json:"status_name"`
	TotalTitles int    `json:"total_titles"`
}

// In Production Details
type InProductionDetail struct {
	TitleID              string        `json:"title_id"`
	TitleName            string        `json:"title_name"`
	Genres               sql.NullString `json:"genres"`
	ProductionCompanies  sql.NullString `json:"production_companies"`
	CastCount            int           `json:"cast_count"`
	Rating               float64       `json:"rating"`
	RuntimeMinutes       int           `json:"runtime_minutes"`
	Popularity           float64       `json:"popularity"`
	VoteCount            int           `json:"vote_count"`
}

// Planned Projects
type PlannedProject struct {
	TitleID              string        `json:"title_id"`
	TitleName            string        `json:"title_name"`
	Overview             sql.NullString `json:"overview"`
	Genres               sql.NullString `json:"genres"`
	ProductionCompanies  sql.NullString `json:"production_companies"`
	StartYear            sql.NullInt64  `json:"start_year"`
	PlannedCastCount     int           `json:"planned_cast_count"`
}

// Top Production Companies
type TopProductionCompany struct {
	CompanyID           string  `json:"company_id"`
	CompanyName         string  `json:"company_name"`
	TotalTitles         int     `json:"total_titles"`
	InProductionCount   int     `json:"in_production_count"`
	PlannedCount        int     `json:"planned_count"`
	AvgRating           float64 `json:"avg_rating"`
}

// Genre Distribution
type GenreDistribution struct {
	GenreName       string  `json:"genre_name"`
	TotalTitles     int     `json:"total_titles"`
	TotalPopularity float64 `json:"total_popularity"`
}

// Top Cast
type TopCast struct {
	PersonID              string        `json:"person_id"`
	PersonName            string        `json:"person_name"`
	Professions           string        `json:"professions"`
	TotalProjects         int           `json:"total_projects"`
	InProductionProjects  int           `json:"in_production_projects"`
	AvgRating             sql.NullFloat64 `json:"avg_rating"`
	Projects              string        `json:"projects"`
}

// Dashboard Summary KPI
type DashboardKPI struct {
	Metric string `json:"metric"`
	Value  string `json:"value"`
}

// Titles by Status
type TitleByStatus struct {
	TitleID              string        `json:"title_id"`
	TitleName            string        `json:"title_name"`
	StatusName           string        `json:"status_name"`
	Genres               string        `json:"genres"`
	ProductionCompanies  string        `json:"production_companies"`
	CastCount            int           `json:"cast_count"`
	Rating               float64       `json:"rating"`
	Popularity           float64       `json:"popularity"`
	RuntimeMinutes       int           `json:"runtime_minutes"`
	NumberOfSeasons      *int          `json:"number_of_seasons"`
	NumberOfEpisodes     *int          `json:"number_of_episodes"`
}

// Dashboard Summary Response (structured KPIs)
type DashboardSummary struct {
	TotalInProduction    int     `json:"total_in_production"`
	TotalPlanned         int     `json:"total_planned"`
	TotalPilots          int     `json:"total_pilots"`
	TotalReturningSeries int     `json:"total_returning_series"`
	TotalCanceled        int     `json:"total_canceled"`
	TotalPopularity      float64 `json:"total_popularity"`
	TopCompany           string  `json:"top_company"`
}

// Custom MarshalJSON for InProductionDetail to handle sql.NullString
func (i *InProductionDetail) MarshalJSON() ([]byte, error) {
	type Alias InProductionDetail
	return json.Marshal(&struct {
		Genres              string `json:"genres"`
		ProductionCompanies string `json:"production_companies"`
		*Alias
	}{
		Genres:              i.Genres.String,
		ProductionCompanies: i.ProductionCompanies.String,
		Alias:               (*Alias)(i),
	})
}

// Custom MarshalJSON for PlannedProject to handle sql.NullString and sql.NullInt64
func (p *PlannedProject) MarshalJSON() ([]byte, error) {
	type Alias PlannedProject
	return json.Marshal(&struct {
		Overview            string `json:"overview"`
		Genres              string `json:"genres"`
		ProductionCompanies string `json:"production_companies"`
		StartYear           int    `json:"start_year"`
		*Alias
	}{
		Overview:            p.Overview.String,
		Genres:              p.Genres.String,
		ProductionCompanies: p.ProductionCompanies.String,
		StartYear:           int(p.StartYear.Int64),
		Alias:               (*Alias)(p),
	})
}

// Custom MarshalJSON for TopCast to handle sql.NullFloat64
func (t *TopCast) MarshalJSON() ([]byte, error) {
	type Alias TopCast
	avgRating := 0.0
	if t.AvgRating.Valid {
		avgRating = t.AvgRating.Float64
	}
	return json.Marshal(&struct {
		AvgRating float64 `json:"avg_rating"`
		*Alias
	}{
		AvgRating: avgRating,
		Alias:     (*Alias)(t),
	})
}
