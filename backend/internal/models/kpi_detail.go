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
	GenreName      string  `json:"genre_name"`
	TotalTitle     int     `json:"total_title"`
	AverageRating  float64 `json:"average_rating"`
}

type KPIMetrics struct {
    TotalProduced  *TotalProduced `json:"total_produced"`
    AverageRating  *AverageRating `json:"average_rating"`
    TopGenre       *TopGenre      `json:"top_genre"`
}