package tests

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAuthLogin(t *testing.T) {
	test := NewTest(t)

	sessionId := test.WithAuth()
	assert.NotEmpty(t, sessionId)
}

func TestAuthGetUser(t *testing.T) {
	test := NewTestWithAuth(t)

	res, status, err := test.Fetch("GET", "/auth/user", nil)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, status)
	assert.NotNil(t, res["user"])

	user := res["user"].(map[string]interface{})
	assert.NotEmpty(t, user["id"])
}

func TestAuthLogout(t *testing.T) {
	test := NewTestWithAuth(t)
	_, status, err := test.Fetch("POST", "/auth/logout", nil)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, status)
	test.SessionID = ""
}
