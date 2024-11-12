package auth

import "rul.sh/vaulterm/middleware"

type LoginSchema struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type TeamWithRole struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Icon string `json:"icon"`
	Role string `json:"role"`
}

type GetUserResult struct {
	middleware.AuthUser
	Teams []TeamWithRole `json:"teams"`
}
