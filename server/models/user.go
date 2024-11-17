package models

import "slices"

const (
	UserRoleUser  = "user"
	UserRoleAdmin = "admin"

	UserAccountTypeGithub = "github"
)

type User struct {
	Model

	Name     string  `json:"name"`
	Username *string `json:"username" gorm:"unique"`
	Password string  `json:"-"`
	Email    *string `json:"email" gorm:"unique"`
	Role     string  `json:"role" gorm:"default:user;not null;index:users_role_idx;type:varchar(8)"`
	Image    string  `json:"image" gorm:"type:varchar(255)"`

	Teams    []*TeamMembers `json:"teams" gorm:"foreignKey:UserID"`
	Accounts []*UserAccount `json:"accounts" gorm:"foreignKey:UserID"`

	Timestamps
	SoftDeletes
}

type UserSession struct {
	ID     string `json:"id" gorm:"primarykey;type:varchar(40)"`
	UserID string `json:"userId" gorm:"type:varchar(26)"`
	User   User   `json:"user"`

	Timestamps
	SoftDeletes
}

type UserAccount struct {
	Model

	UserID string `json:"userId" gorm:"type:varchar(26)"`
	User   User   `json:"user" gorm:"foreignKey:UserID"`

	Type      string `json:"type" gorm:"type:varchar(16);index:user_accounts_type_idx"`
	AccountID string `json:"accountId" gorm:"type:varchar(64);index:user_accounts_accountid_idx"`
	Username  string `json:"username" gorm:"type:varchar(64);index:user_accounts_username_idx"`
	Email     string `json:"email" gorm:"type:varchar(64);index:user_accounts_email_idx"`

	Timestamps
}

func (u *User) IsAdmin() bool {
	return u.Role == UserRoleAdmin
}

func (u *User) GetTeamRole(teamId *string) string {
	if u.IsAdmin() {
		return TeamRoleAdmin
	}
	if teamId == nil {
		return ""
	}
	idx := slices.IndexFunc(u.Teams, func(tm *TeamMembers) bool {
		return tm.TeamID == *teamId
	})
	if idx == -1 {
		return ""
	}
	return u.Teams[idx].Role
}

func (u *User) IsInTeam(teamId *string) bool {
	role := u.GetTeamRole(teamId)
	return role != ""
}

func (u *User) TeamCanWrite(teamId *string) bool {
	role := u.GetTeamRole(teamId)
	return role == TeamRoleAdmin || role == TeamRoleOwner
}
