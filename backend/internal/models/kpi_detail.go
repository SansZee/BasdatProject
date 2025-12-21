package models

type TotalProduced struct {
	TotalTitles 	int 			`json:"total_produced"`
	TopTypes		[]TypeBreakdown `json:"top_type"`
}

type TypeBreakdown struct {
	Count 		int		`json:"count"`
	TypeName	string	`json:"type_name"`
}

type AverageRating struct {
	AverageRating	float64 `json:"average_rating"`
}

type TopGenre struct {
	GenreName     string  `json:"genre_name"`
	TotalTitle    int     `json:"total_title"`
	AverageRating float64 `json:"average_rating"`
}

type KPIMetrics struct {
	TotalProduced  *TotalProduced `json:"total_produced"`
	AverageRating  *AverageRating `json:"average_rating"`
	TopGenre       *TopGenre      `json:"top_genre"`
}

// GenreTrend untuk line chart genre trend
type GenreTrend struct {
	GenreName string  `json:"genre_name"`
	TotalVotes int    `json:"total_votes"`
	StartYear int    `json:"start_year"`
}

// SummaryTrendItem untuk bar+line chart production summary trend
type SummaryTrendItem struct {
	ProductionYear int     `json:"production_year"`
	TotalProduction int    `json:"total_production"`
	AvgRating      float64 `json:"avg_rating"`
}

// BestTitle untuk list best title
type BestTitle struct {
	Name       string  `json:"name"`
	VoteAverage float64 `json:"vote_average"`
	VoteCount  int     `json:"vote_count"`
}

// TopCompany untuk list top companies
type TopCompany struct {
	ProductionCompanyTypeID string  `json:"production_company_type_id"`
	ProductionCompanyName   string  `json:"production_company_name"`
	JumlahTayangan          int     `json:"jumlah_tayangan"`
	AvgRating               float64 `json:"avg_rating"`
}