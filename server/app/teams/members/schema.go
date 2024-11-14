package members

type InviteSchema struct {
	Username string `json:"username"`
	Role     string `json:"role"`
}

type PutRoleSchema struct {
	UserID string `json:"username"`
	Role   string `json:"role"`
}
