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
