package repository

import (
	"database/sql"
	"fmt"

	"film-dashboard-api/internal/models"
)

// ReviewRepository adalah struct yang berisi semua function untuk operasi database Review
type ReviewRepository struct {
	db *sql.DB
}

// NewReviewRepository adalah constructor untuk bikin instance ReviewRepository
func NewReviewRepository(db *sql.DB) *ReviewRepository {
	return &ReviewRepository{
		db: db,
	}
}

// CreateOrUpdateReview membuat atau update review (upsert pattern)
// Jika user sudah punya review untuk title ini, update; jika belum, buat baru
func (r *ReviewRepository) CreateOrUpdateReview(userID int, titleID string, rating int, reviewText string) (*models.Review, error) {
	var review models.Review

	query := `
		DECLARE @ReviewID INT;
		
		-- Check apakah user sudah punya review untuk title ini
		SELECT @ReviewID = review_id 
		FROM Reviews 
		WHERE user_id = @p1 AND title_id = @p2;
		
		IF @ReviewID IS NOT NULL
		BEGIN
			-- Update review yang sudah ada
			UPDATE Reviews
			SET rating = @p3, review_text = @p4
			WHERE review_id = @ReviewID;
			
			-- Return updated review
			SELECT 
				review_id, 
				user_id, 
				title_id, 
				rating, 
				review_text, 
				created_at, 
				updated_at
			FROM Reviews
			WHERE review_id = @ReviewID;
		END
		ELSE
		BEGIN
			-- Insert review baru
			INSERT INTO Reviews (user_id, title_id, rating, review_text)
			VALUES (@p1, @p2, @p3, @p4);
			
			-- Return newly created review
			SELECT 
				review_id, 
				user_id, 
				title_id, 
				rating, 
				review_text, 
				created_at, 
				updated_at
			FROM Reviews
			WHERE review_id = SCOPE_IDENTITY();
		END
	`

	row := r.db.QueryRow(query, userID, titleID, rating, reviewText)

	err := row.Scan(
		&review.ReviewID,
		&review.UserID,
		&review.TitleID,
		&review.Rating,
		&review.ReviewText,
		&review.CreatedAt,
		&review.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create or update review: %w", err)
	}

	return &review, nil
}

// GetReviewsByTitle mengambil semua review untuk sebuah title
func (r *ReviewRepository) GetReviewsByTitle(titleID string) ([]models.ReviewResponse, error) {
	query := `
		SELECT 
			r.review_id,
			r.user_id,
			u.username,
			r.title_id,
			r.rating,
			r.review_text,
			r.created_at,
			r.updated_at
		FROM Reviews r
		INNER JOIN Users u ON r.user_id = u.user_id
		WHERE r.title_id = @p1
		ORDER BY r.created_at DESC
	`

	rows, err := r.db.Query(query, titleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get reviews by title: %w", err)
	}
	defer rows.Close()

	var reviews []models.ReviewResponse
	for rows.Next() {
		var review models.ReviewResponse
		err := rows.Scan(
			&review.ReviewID,
			&review.UserID,
			&review.Username,
			&review.TitleID,
			&review.Rating,
			&review.ReviewText,
			&review.CreatedAt,
			&review.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan review: %w", err)
		}
		reviews = append(reviews, review)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating reviews: %w", err)
	}

	return reviews, nil
}

// GetReviewsByUser mengambil semua review yang ditulis oleh user tertentu
func (r *ReviewRepository) GetReviewsByUser(userID int) ([]models.ReviewResponse, error) {
	query := `
		SELECT 
			r.review_id,
			r.user_id,
			u.username,
			r.title_id,
			r.rating,
			r.review_text,
			r.created_at,
			r.updated_at
		FROM Reviews r
		INNER JOIN Users u ON r.user_id = u.user_id
		WHERE r.user_id = @p1
		ORDER BY r.created_at DESC
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get reviews by user: %w", err)
	}
	defer rows.Close()

	var reviews []models.ReviewResponse
	for rows.Next() {
		var review models.ReviewResponse
		err := rows.Scan(
			&review.ReviewID,
			&review.UserID,
			&review.Username,
			&review.TitleID,
			&review.Rating,
			&review.ReviewText,
			&review.CreatedAt,
			&review.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan review: %w", err)
		}
		reviews = append(reviews, review)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating reviews: %w", err)
	}

	return reviews, nil
}

// GetReviewByID mengambil single review by ID
func (r *ReviewRepository) GetReviewByID(reviewID int) (*models.ReviewResponse, error) {
	var review models.ReviewResponse

	query := `
		SELECT 
			r.review_id,
			r.user_id,
			u.username,
			r.title_id,
			r.rating,
			r.review_text,
			r.created_at,
			r.updated_at
		FROM Reviews r
		INNER JOIN Users u ON r.user_id = u.user_id
		WHERE r.review_id = @p1
	`

	row := r.db.QueryRow(query, reviewID)
	err := row.Scan(
		&review.ReviewID,
		&review.UserID,
		&review.Username,
		&review.TitleID,
		&review.Rating,
		&review.ReviewText,
		&review.CreatedAt,
		&review.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("review not found")
		}
		return nil, fmt.Errorf("failed to get review: %w", err)
	}

	return &review, nil
}

// DeleteReview menghapus review by ID
// Returns error jika review tidak ditemukan atau owner tidak match
func (r *ReviewRepository) DeleteReview(reviewID int, userID int) error {
	// First verify ownership
	var ownerID int
	query := `SELECT user_id FROM Reviews WHERE review_id = @p1`
	row := r.db.QueryRow(query, reviewID)

	err := row.Scan(&ownerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("review not found")
		}
		return fmt.Errorf("failed to verify review ownership: %w", err)
	}

	// Check ownership
	if ownerID != userID {
		return fmt.Errorf("you can only delete your own reviews")
	}

	// Delete review
	deleteQuery := `DELETE FROM Reviews WHERE review_id = @p1`
	_, err = r.db.Exec(deleteQuery, reviewID)
	if err != nil {
		return fmt.Errorf("failed to delete review: %w", err)
	}

	return nil
}

// GetUserReviewForTitle mengambil review yang ditulis user untuk title tertentu
// Digunakan untuk check apakah user sudah review title ini
func (r *ReviewRepository) GetUserReviewForTitle(userID int, titleID string) (*models.ReviewResponse, error) {
	var review models.ReviewResponse

	query := `
		SELECT 
			r.review_id,
			r.user_id,
			u.username,
			r.title_id,
			r.rating,
			r.review_text,
			r.created_at,
			r.updated_at
		FROM Reviews r
		INNER JOIN Users u ON r.user_id = u.user_id
		WHERE r.user_id = @p1 AND r.title_id = @p2
	`

	row := r.db.QueryRow(query, userID, titleID)
	err := row.Scan(
		&review.ReviewID,
		&review.UserID,
		&review.Username,
		&review.TitleID,
		&review.Rating,
		&review.ReviewText,
		&review.CreatedAt,
		&review.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No review yet, not an error
		}
		return nil, fmt.Errorf("failed to get user review: %w", err)
	}

	return &review, nil
}
