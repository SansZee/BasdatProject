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

type BestTitle struct {
	Name		string	`json:"name"`
	VoteAverage	float64	`json:"vote_average"`
	VoteCount	int		`json:"vote_count"`
}

type KPIMetrics struct {
    TotalProduced  *TotalProduced `json:"total_produced"`
    AverageRating  *AverageRating `json:"average_rating"`
    BestTitle      *BestTitle     `json:"best_title"`
}