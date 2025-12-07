package service

import (
	"errors"
	"fmt"

	"film-dashboard-api/internal/models"
	"film-dashboard-api/internal/repository"
)

// ReviewService adalah service untuk handle review operations
type ReviewService struct {
	reviewRepo *repository.ReviewRepository
}

// NewReviewService adalah constructor untuk bikin instance ReviewService
func NewReviewService(reviewRepo *repository.ReviewRepository) *ReviewService {
	return &ReviewService{
		reviewRepo: reviewRepo,
	}
}

// CreateOrUpdateReview membuat atau update review user
// Business logic:
// 1. Validate input (rating 1-10, review_text tidak boleh kosong)
// 2. Call repository untuk create/update
// 3. Return review response
func (s *ReviewService) CreateOrUpdateReview(userID int, req models.ReviewRequest) (*models.ReviewResponse, error) {
	// 1. Validate input
	if req.TitleID == "" {
		return nil, errors.New("title_id is required")
	}

	if req.Rating < 1 || req.Rating > 10 {
		return nil, errors.New("rating must be between 1 and 10")
	}

	if req.ReviewText == "" {
		return nil, errors.New("review_text is required")
	}

	// 2. Create or update review via repository
	review, err := s.reviewRepo.CreateOrUpdateReview(userID, req.TitleID, req.Rating, req.ReviewText)
	if err != nil {
		return nil, fmt.Errorf("failed to create/update review: %w", err)
	}

	// 3. Convert to response
	response := &models.ReviewResponse{
		ReviewID:   review.ReviewID,
		UserID:     review.UserID,
		TitleID:    review.TitleID,
		Rating:     review.Rating,
		ReviewText: review.ReviewText,
		CreatedAt:  review.CreatedAt,
		UpdatedAt:  review.UpdatedAt,
	}

	return response, nil
}

// GetReviewsByTitle mengambil semua review untuk sebuah title
func (s *ReviewService) GetReviewsByTitle(titleID string) ([]models.ReviewResponse, error) {
	if titleID == "" {
		return nil, errors.New("title_id is required")
	}

	reviews, err := s.reviewRepo.GetReviewsByTitle(titleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get reviews: %w", err)
	}

	// Return empty array jika tidak ada review
	if reviews == nil {
		reviews = []models.ReviewResponse{}
	}

	return reviews, nil
}

// GetReviewsByUser mengambil semua review yang ditulis user
func (s *ReviewService) GetReviewsByUser(userID int) ([]models.ReviewResponse, error) {
	reviews, err := s.reviewRepo.GetReviewsByUser(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user reviews: %w", err)
	}

	// Return empty array jika tidak ada review
	if reviews == nil {
		reviews = []models.ReviewResponse{}
	}

	return reviews, nil
}

// DeleteReview menghapus review (hanya owner yang bisa delete)
func (s *ReviewService) DeleteReview(reviewID int, userID int) error {
	if reviewID == 0 {
		return errors.New("review_id is required")
	}

	// Repository akan verify ownership
	err := s.reviewRepo.DeleteReview(reviewID, userID)
	if err != nil {
		return err
	}

	return nil
}

// GetUserReviewForTitle mengecek apakah user sudah review title ini
func (s *ReviewService) GetUserReviewForTitle(userID int, titleID string) (*models.ReviewResponse, error) {
	if titleID == "" {
		return nil, errors.New("title_id is required")
	}

	review, err := s.reviewRepo.GetUserReviewForTitle(userID, titleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user review: %w", err)
	}

	return review, nil
}
