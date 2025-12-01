package models

// APIResponse adalah struktur standard untuk semua response API
// Gunakan struct ini supaya response kita konsisten
type APIResponse struct {
	Success bool        `json:"success"`              // true = sukses, false = gagal
	Message string      `json:"message"`              // Pesan untuk user
	Data    any         `json:"data"`                 // Data apapun (bisa User, Film, array, dll)
}

// ErrorResponse adalah struktur khusus untuk error response
type ErrorResponse struct {
	Success bool   `json:"success"`  // Selalu false untuk error
	Message string `json:"message"`  // Error message
	Error   string `json:"error"`    // Detail error (untuk debugging)
}