package models

// APIResponse adalah struktur standard untuk semua response API
// Gunakan struct ini supaya response kita konsisten
type APIResponse struct {
    Success bool        // true = sukses, false = gagal
    Message string      // Pesan untuk user
    Data    any			// Data apapun (bisa User, Film, array, dll)
}

// ErrorResponse adalah struktur khusus untuk error response
type ErrorResponse struct {
    Success bool   // Selalu false untuk error
    Message string // Error message
    Error   string // Detail error (untuk debugging)
}