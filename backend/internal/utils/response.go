package utils

import (
	"encoding/json"
	"net/http"

	"film-dashboard-api/internal/models"
)

// WriteJSON adalah helper function untuk menulis JSON response
// Mempermudah kita kirim response ke frontend dengan format yang konsisten
func WriteJSON(w http.ResponseWriter, status int, data interface{}) error {
	// Set header Content-Type sebagai JSON
	w.Header().Set("Content-Type", "application/json")
	
	// Set HTTP status code (200, 400, 500, dll)
	w.WriteHeader(status)
	
	// Encode data ke JSON dan kirim ke response writer
	return json.NewEncoder(w).Encode(data)
}

// WriteSuccess adalah helper untuk kirim success response
func WriteSuccess(w http.ResponseWriter, message string, data interface{}) error {
	response := models.APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	}
	return WriteJSON(w, http.StatusOK, response)
}

// WriteError adalah helper untuk kirim error response
func WriteError(w http.ResponseWriter, status int, message string, err error) error {
	errorMessage := ""
	if err != nil {
		errorMessage = err.Error()
	}
	
	response := models.ErrorResponse{
		Success: false,
		Message: message,
		Error:   errorMessage,
	}
	return WriteJSON(w, status, response)
}