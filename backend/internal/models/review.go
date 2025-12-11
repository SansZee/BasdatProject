package models

import "time"

// Review - Full model (internal use)
type Review struct {
	ReviewID  int       `json:"review_id"`
	UserID    int       `json:"user_id"`
	TitleID   string    `json:"title_id"`
	Rating    int       `json:"rating"`
	ReviewText string   `json:"review_text"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ReviewRequest - Request body untuk create/update review
type ReviewRequest struct {
	TitleID    string `json:"title_id"`
	Rating     int    `json:"rating"`
	ReviewText string `json:"review_text"`
}

// ReviewResponse - Safe response model untuk frontend
type ReviewResponse struct {
	ReviewID   int       `json:"review_id"`
	UserID     int       `json:"user_id"`
	Username   string    `json:"username"` // Added for display
	TitleID    string    `json:"title_id"`
	Rating     int       `json:"rating"`
	ReviewText string    `json:"review_text"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
