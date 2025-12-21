package service

import (
	"context"
	"fmt"

	"film-dashboard-api/internal/models"
	"film-dashboard-api/internal/repository"
)

// ExecutiveService adalah service untuk handle executive dashboard operations
type ExecutiveService struct {
	executiveRepo *repository.ExecutiveRepository
}

// NewExecutiveService adalah constructor untuk bikin instance ExecutiveService
func NewExecutiveService(executiveRepo *repository.ExecutiveRepository) *ExecutiveService {
	return &ExecutiveService{
		executiveRepo: executiveRepo,
	}
}

// GetKPIMetrics mengambil KPI metrics untuk executive dashboard
// Business logic:
// 1. Validate companyID
// 2. Call repository untuk get metrics
// 3. Return KPI response
func (s *ExecutiveService) GetKPIMetrics(ctx context.Context, companyID string) (*models.KPIMetrics, error) {
	// 1. Validate input
	if companyID == "" {
		return nil, fmt.Errorf("company_id is required")
	}

	// 2. Get metrics via repository
	kpi, err := s.executiveRepo.GetKPIMetrics(ctx, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to get KPI metrics: %w", err)
	}

	return kpi, nil
}

// GetBestTitles mengambil best titles untuk company
func (s *ExecutiveService) GetBestTitles(ctx context.Context, companyID string, top int) ([]models.BestTitle, error) {
	if companyID == "" {
		return nil, fmt.Errorf("company_id is required")
	}
	if top <= 0 {
		top = 5
	}
	
	titles, err := s.executiveRepo.GetBestTitles(ctx, companyID, top)
	if err != nil {
		return nil, fmt.Errorf("failed to get best titles: %w", err)
	}
	
	return titles, nil
}

// GetGenreTrend mengambil genre trend data
func (s *ExecutiveService) GetGenreTrend(ctx context.Context, companyID string) ([]models.GenreTrend, error) {
	if companyID == "" {
		return nil, fmt.Errorf("company_id is required")
	}
	
	trends, err := s.executiveRepo.GetGenreTrend(ctx, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to get genre trend: %w", err)
	}
	
	return trends, nil
}

// GetSummaryTrend mengambil production summary trend
func (s *ExecutiveService) GetSummaryTrend(ctx context.Context, companyID string, yearRange int) ([]models.SummaryTrendItem, error) {
	if companyID == "" {
		return nil, fmt.Errorf("company_id is required")
	}
	if yearRange <= 0 {
		yearRange = 5
	}
	
	trends, err := s.executiveRepo.GetSummaryTrend(ctx, companyID, yearRange)
	if err != nil {
		return nil, fmt.Errorf("failed to get summary trend: %w", err)
	}
	
	return trends, nil
}

// GetTopCompanies mengambil top production companies
func (s *ExecutiveService) GetTopCompanies(ctx context.Context, top *int) ([]models.TopCompany, error) {
	companies, err := s.executiveRepo.GetTopCompanies(ctx, top)
	if err != nil {
		return nil, fmt.Errorf("failed to get top companies: %w", err)
	}
	
	return companies, nil
}
