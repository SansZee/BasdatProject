package handler

import (
	"fmt"
	"net/http"
	"strconv"

	"film-dashboard-api/internal/repository"
	"film-dashboard-api/internal/utils"
	"github.com/gorilla/mux"
)

// ArtistHandler handles artist-related endpoints
type ArtistHandler struct {
	artistRepo *repository.ArtistRepository
}

// NewArtistHandler creates a new artist handler instance
func NewArtistHandler(artistRepo *repository.ArtistRepository) *ArtistHandler {
	return &ArtistHandler{
		artistRepo: artistRepo,
	}
}

// SearchArtists handles GET /api/artists/search?q=keyword
func (h *ArtistHandler) SearchArtists(w http.ResponseWriter, r *http.Request) {
	// Handle CORS preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// Get search keyword
	keyword := r.URL.Query().Get("q")
	if keyword == "" {
		utils.WriteError(w, http.StatusBadRequest, "Search keyword (q) is required", nil)
		return
	}

	// Get optional limit parameter
	limitStr := r.URL.Query().Get("limit")
	maxResults := 20
	if limitStr != "" {
		if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 && parsed <= 100 {
			maxResults = parsed
		}
	}

	fmt.Println("=== ARTIST SEARCH REQUEST ===")
	fmt.Printf("Endpoint: /api/artists/search\n")
	fmt.Printf("Query Param 'q': %s\n", keyword)
	fmt.Printf("Limit: %d\n", maxResults)

	// Search artists
	artists, err := h.artistRepo.SearchArtists(keyword, maxResults)
	if err != nil {
		fmt.Printf("❌ Handler Error: %v\n", err)
		utils.WriteError(w, http.StatusInternalServerError, "Failed to search artists", err)
		return
	}

	fmt.Printf("📤 Returning %d artist results to frontend\n", len(artists))
	fmt.Println("=============================\n")
	utils.WriteSuccess(w, "Artist search results retrieved successfully", artists)
}

// GetArtistDetail handles GET /api/artists/{id}/detail
func (h *ArtistHandler) GetArtistDetail(w http.ResponseWriter, r *http.Request) {
	// Handle CORS preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// Get person_id from URL path
	vars := mux.Vars(r)
	personID := vars["id"]
	if personID == "" {
		utils.WriteError(w, http.StatusBadRequest, "Artist ID is required", nil)
		return
	}

	fmt.Println("=== ARTIST DETAIL REQUEST ===")
	fmt.Printf("Endpoint: /api/artists/{id}/detail\n")
	fmt.Printf("Person ID: %s\n", personID)

	// Get artist detail
	detail, err := h.artistRepo.GetArtistDetail(personID)
	if err != nil {
		fmt.Printf("❌ Handler Error: %v\n", err)
		utils.WriteError(w, http.StatusInternalServerError, "Failed to get artist detail", err)
		return
	}

	if detail == nil {
		utils.WriteError(w, http.StatusNotFound, "Artist not found", nil)
		return
	}

	fmt.Printf("📤 Returning artist detail: %s\n", detail.PrimaryName)
	fmt.Println("=============================\n")
	utils.WriteSuccess(w, "Artist detail retrieved successfully", detail)
}
