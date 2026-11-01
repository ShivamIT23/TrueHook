package types

// SignupRequest defines the expected payload for user registration.
type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// SigninRequest defines the expected payload for user authentication.
type SigninRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
