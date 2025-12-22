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

// ReviewResponse - Response model untuk frontend
// Untuk SP-based query (GetReviewsByUser): only review_id, title_id, title_name, rating, review_text, created_at, updated_at are populated
// Untuk direct SQL query (GetReviewByID, GetReviewsByTitle): user_id dan username juga populated
type ReviewResponse struct {
	ReviewID   int       `json:"review_id"`
	UserID     int       `json:"user_id,omitempty"`        // Optional: filled only for public review endpoints
	Username   string    `json:"username,omitempty"`        // Optional: filled only for public review endpoints
	TitleID    string    `json:"title_id"`
	TitleName  string    `json:"title_name,omitempty"`     // Optional: filled by SP only
	Rating     int       `json:"rating"`
	ReviewText string    `json:"review_text"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
