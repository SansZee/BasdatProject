package cache

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"film-dashboard-api/internal/models"
)

type FilterCacheEntry struct {
	Data      []*models.FilmCardData
	TotalCount int
	Timestamp time.Time
	ExpiresAt time.Time
}

type FilterCache struct {
	cache    map[string]*FilterCacheEntry
	mu       sync.RWMutex
	ttl      time.Duration
}

// NewFilterCache creates a new filter cache with specified TTL (Time To Live)
func NewFilterCache(ttl time.Duration) *FilterCache {
	fc := &FilterCache{
		cache: make(map[string]*FilterCacheEntry),
		ttl:   ttl,
	}

	// Start cleanup goroutine every minute
	go fc.cleanupExpired()

	return fc
}

// GenerateCacheKey creates a hash key from filter parameters
func (fc *FilterCache) GenerateCacheKey(
	genreIDs []string,
	typeIDs []string,
	statusIDs []string,
	originCountryIDs []string,
	productionCountryIDs []string,
	year *int,
	sortBy string,
	offset int,
	limit int,
) string {
	// Create a struct to represent the filter parameters
	key := map[string]interface{}{
		"genreIDs":              genreIDs,
		"typeIDs":               typeIDs,
		"statusIDs":             statusIDs,
		"originCountryIDs":      originCountryIDs,
		"productionCountryIDs":  productionCountryIDs,
		"year":                  year,
		"sortBy":                sortBy,
		"offset":                offset,
		"limit":                 limit,
	}

	// Convert to JSON
	jsonBytes, _ := json.Marshal(key)

	// Create MD5 hash
	hash := md5.Sum(jsonBytes)
	return hex.EncodeToString(hash[:])
}

// Get retrieves cached filter results
func (fc *FilterCache) Get(cacheKey string) ([]*models.FilmCardData, int, bool) {
	fc.mu.RLock()
	defer fc.mu.RUnlock()

	entry, exists := fc.cache[cacheKey]
	if !exists {
		return nil, 0, false
	}

	// Check if cache has expired
	if time.Now().After(entry.ExpiresAt) {
		return nil, 0, false
	}

	return entry.Data, entry.TotalCount, true
}

// Set stores filter results in cache
func (fc *FilterCache) Set(cacheKey string, data []*models.FilmCardData, totalCount int) {
	fc.mu.Lock()
	defer fc.mu.Unlock()

	fc.cache[cacheKey] = &FilterCacheEntry{
		Data:       data,
		TotalCount: totalCount,
		Timestamp:  time.Now(),
		ExpiresAt:  time.Now().Add(fc.ttl),
	}

	fmt.Printf("💾 Cache SET: %s (TTL: %v, Total: %d)\n", cacheKey, fc.ttl, totalCount)
}

// Clear removes all cache entries
func (fc *FilterCache) Clear() {
	fc.mu.Lock()
	defer fc.mu.Unlock()

	fc.cache = make(map[string]*FilterCacheEntry)
	fmt.Println("🗑️  Cache CLEARED")
}

// cleanupExpired removes expired entries from cache
func (fc *FilterCache) cleanupExpired() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		fc.mu.Lock()
		now := time.Now()
		expiredCount := 0

		for key, entry := range fc.cache {
			if now.After(entry.ExpiresAt) {
				delete(fc.cache, key)
				expiredCount++
			}
		}

		if expiredCount > 0 {
			fmt.Printf("🧹 Cache cleanup: removed %d expired entries\n", expiredCount)
		}
		fc.mu.Unlock()
	}
}

// GetCacheStats returns cache statistics
func (fc *FilterCache) GetCacheStats() map[string]interface{} {
	fc.mu.RLock()
	defer fc.mu.RUnlock()

	return map[string]interface{}{
		"size": len(fc.cache),
		"ttl":  fc.ttl,
	}
}
