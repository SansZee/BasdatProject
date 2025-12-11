package models

// GenreOption merepresentasikan genre option dari database
type GenreOption struct {
	GenreTypeID string `json:"genre_type_id"`
	GenreName   string `json:"genre_name"`
}

// TypeOption merepresentasikan type option dari database
type TypeOption struct {
	TypeID   string `json:"type_id"`
	TypeName string `json:"type_name"`
}

// StatusOption merepresentasikan status option dari database
type StatusOption struct {
	StatusID   string `json:"status_id"`
	StatusName string `json:"status_name"`
}

// FilterOptionsResponse merepresentasikan semua filter options
type FilterOptionsResponse struct {
	Genres   []*GenreOption   `json:"genres"`
	Types    []*TypeOption    `json:"types"`
	Statuses []*StatusOption  `json:"statuses"`
	Years    []int            `json:"years"`
}
