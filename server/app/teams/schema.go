package teams

type CreateTeamSchema struct {
	Name string `json:"name"`
	Icon string `json:"icon"`
}

type GetOptions struct {
	ID          string
	WithMembers bool
}
