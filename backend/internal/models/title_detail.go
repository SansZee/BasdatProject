package models

// TitleDetail merepresentasikan detail utama dari sebuah title
type TitleDetail struct {
	TitleID          *string  `json:"title_id"`
	Name             *string  `json:"name"`
	OriginalName     *string  `json:"original_name"`
	Overview         *string  `json:"overview"`
	Popularity       *float64 `json:"popularity"`
	VoteAverage      *float64 `json:"vote_average"`
	VoteCount        *int     `json:"vote_count"`
	RuntimeMinutes   *int     `json:"runtime_minutes"`
	StartYear        *int     `json:"start_year"`
	EndYear          *int     `json:"end_year"`
	NumberSeasons    *int     `json:"number_of_seasons"`
	NumberEpisodes   *int     `json:"number_of_episodes"`
	Type             *string  `json:"type"`
	Status           *string  `json:"status"`
	Tagline          *string  `json:"tagline"`
}

// Genre merepresentasikan genre dari title
type Genre struct {
	GenreName *string `json:"genre_name"`
}

// Language merepresentasikan bahasa dari title
type Language struct {
	LanguageName *string `json:"language_name"`
}

// ProductionCountry merepresentasikan negara produksi
type ProductionCountry struct {
	CountryName *string `json:"country_name"`
}

// ProductionCompany merepresentasikan perusahaan produksi
type ProductionCompany struct {
	CompanyName *string `json:"company_name"`
}

// Network merepresentasikan network/channel
type Network struct {
	NetworkName *string `json:"network_name"`
}

// AirDate merepresentasikan tanggal tayang dan episode info
type AirDate struct {
	Date          *string `json:"date"`
	IsFirst       *bool   `json:"is_first"`
	SeasonNumber  *int    `json:"season_number"`
	EpisodeNumber *int    `json:"episode_number"`
}

// CastCrew merepresentasikan cast dan crew
type CastCrew struct {
	Ordering      *int    `json:"ordering"`
	PersonName    *string `json:"person_name"`
	JobCategory   *string `json:"job_category"`
	Characters    *string `json:"characters"`
}

// TitleDetailResponse merepresentasikan response lengkap untuk detail title
type TitleDetailResponse struct {
	Detail          *TitleDetail         `json:"detail"`
	Genres          []*Genre             `json:"genres"`
	Languages       []*Language          `json:"languages"`
	Countries       []*ProductionCountry `json:"countries"`
	Companies       []*ProductionCompany `json:"companies"`
	Networks        []*Network           `json:"networks"`
	AirDates        []*AirDate           `json:"air_dates"`
	CastAndCrew     []*CastCrew          `json:"cast_and_crew"`
}
