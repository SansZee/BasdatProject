package models

import "time"

// User - Full model (internal use)
type User struct {
    UserID       int
    Username     string
    Email        string
    PasswordHash string
    FullName     string
    RoleID       int
    RoleName     string
    IsActive     bool
    CreatedAt    time.Time
    UpdatedAt    time.Time
    LastLogin    *time.Time
}

// UserResponse - Safe model untuk frontend (no password)
type UserResponse struct {
    UserID    int       `json:"user_id"`
    Username  string    `json:"username"`
    Email     string    `json:"email"`
    FullName  string    `json:"full_name"`
    RoleName  string    `json:"role_name"`
    IsActive  bool      `json:"is_active"`
    CreatedAt time.Time `json:"created_at"`
}

// ToResponse - Convert User ke UserResponse
func (u *User) ToResponse() UserResponse {
    return UserResponse{
        UserID:    u.UserID,
        Username:  u.Username,
        Email:     u.Email,
        FullName:  u.FullName,
        RoleName:  u.RoleName,
        IsActive:  u.IsActive,
        CreatedAt: u.CreatedAt,
    }
}