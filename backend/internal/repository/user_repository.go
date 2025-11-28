package repository

import (
	"database/sql"
	"fmt"

	"film-dashboard-api/internal/models"
)

// UserRepository adalah struct yang berisi semua function untuk operasi database User
// Struct ini akan punya reference ke database connection
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository adalah constructor untuk bikin instance UserRepository
// Parameter db adalah database connection yang sudah di-setup sebelumnya
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

// CreateUser membuat user baru di database menggunakan stored procedure sp_RegisterUser
// Parameter:
// - username: username user baru
// - email: email user
// - passwordHash: password yang sudah di-hash dengan bcrypt
// - fullName: nama lengkap user
// Return: pointer ke User yang baru dibuat, dan error (kalau ada)
func (r *UserRepository) CreateUser(username, email, passwordHash, fullName string) (*models.User, error) {
	var user models.User

	// Query memanggil stored procedure sp_RegisterUser
	// Stored procedure ini akan:
	// 1. Validate username & email belum ada
	// 2. Insert user baru dengan role default (native_user)
	// 3. Return data user yang baru dibuat
	query := `
		EXEC sp_RegisterUser 
			@username = @p1, 
			@email = @p2, 
			@password_hash = @p3, 
			@full_name = @p4
	`

	// QueryRow digunakan karena kita expect 1 row result
	row := r.db.QueryRow(query, username, email, passwordHash, fullName)

	// Scan hasil query ke struct User
	// Urutan field harus sama dengan urutan SELECT di stored procedure
	err := row.Scan(
		&user.UserID,
		&user.Username,
		&user.Email,
		&user.FullName,
		&user.RoleID,
		&user.RoleName,
		&user.CreatedAt,
	)

	if err != nil {
		// Kalau error, return nil dan error
		// Error bisa karena: username/email duplicate, database error, dll
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Set field tambahan yang tidak di-return oleh stored procedure
	user.PasswordHash = passwordHash
	user.IsActive = true
	user.UpdatedAt = user.CreatedAt
	user.LastLogin = nil // User baru belum pernah login

	return &user, nil
}

// GetUserByUsername mengambil user dari database berdasarkan username
// Digunakan saat login untuk verify credentials
// Return: pointer ke User, dan error (kalau user tidak ditemukan atau error database)
func (r *UserRepository) GetUserByUsername(username string) (*models.User, error) {
	var user models.User

	// Query memanggil stored procedure sp_LoginUser
	// Stored procedure ini akan return semua data user (termasuk password_hash)
	query := `EXEC sp_LoginUser @username = @p1`

	// QueryRow karena kita expect 1 user
	row := r.db.QueryRow(query, username)

	// Scan hasil query ke struct User
	err := row.Scan(
		&user.UserID,
		&user.Username,
		&user.Email,
		&user.PasswordHash, // Penting! Butuh ini untuk verify password
		&user.FullName,
		&user.RoleID,
		&user.RoleName,
		&user.IsActive,
		&user.LastLogin,
	)

	if err != nil {
		// Kalau error sql.ErrNoRows, berarti user tidak ditemukan
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		// Error lain (database error, connection error, dll)
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// GetUserByID mengambil user dari database berdasarkan user_id
// Digunakan untuk get profile user, verify token, dll
func (r *UserRepository) GetUserByID(userID int) (*models.User, error) {
	var user models.User

	// Query langsung ke table Users (tidak pakai stored procedure)
	query := `
		SELECT 
			u.user_id, 
			u.username, 
			u.email, 
			u.full_name, 
			u.role_id, 
			r.role_name,
			u.is_active,
			u.created_at,
			u.updated_at,
			u.last_login
		FROM Users u
		INNER JOIN Roles r ON u.role_id = r.role_id
		WHERE u.user_id = @p1
	`

	row := r.db.QueryRow(query, userID)

	// Scan hasil ke struct User
	err := row.Scan(
		&user.UserID,
		&user.Username,
		&user.Email,
		&user.FullName,
		&user.RoleID,
		&user.RoleName,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.LastLogin,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// UpdateLastLogin update waktu last_login user setelah berhasil login
// Menggunakan stored procedure sp_UpdateLastLogin
func (r *UserRepository) UpdateLastLogin(userID int) error {
	query := `EXEC sp_UpdateLastLogin @user_id = @p1`

	// Exec digunakan untuk query yang tidak return data (INSERT, UPDATE, DELETE)
	_, err := r.db.Exec(query, userID)
	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}

	return nil
}

// UpdateUserRole update role user (hanya admin yang bisa panggil ini)
// Menggunakan stored procedure sp_UpdateUserRole
func (r *UserRepository) UpdateUserRole(userID int, newRoleName string) error {
	query := `EXEC sp_UpdateUserRole @user_id = @p1, @new_role_name = @p2`

	_, err := r.db.Exec(query, userID, newRoleName)
	if err != nil {
		return fmt.Errorf("failed to update user role: %w", err)
	}

	return nil
}