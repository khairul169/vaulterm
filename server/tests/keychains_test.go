package tests

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestKeychainsGetAll(t *testing.T) {
	test := NewTestWithAuth(t)

	res, status, err := test.Fetch("GET", "/keychains", nil)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, status)
	assert.NotNil(t, res["rows"])
}

func TestKeychainsCreate(t *testing.T) {
	test := NewTestWithAuth(t)

	data := map[string]interface{}{
		"type":  "user",
		"label": "SSH Key",
		"data": map[string]interface{}{
			"username": "",
			"password": "",
		},
	}

	// data := map[string]interface{}{
	// 	"type":  "user",
	// 	"label": "PVE Key",
	// 	"data": map[string]interface{}{
	// 		"username": "root@pam",
	// 		"password": "",
	// 	},
	// }

	// data := map[string]interface{}{
	// 	"type":  "cert",
	// 	"label": "Certificate Key",
	// 	"data": map[string]interface{}{
	// 		"cert": "",
	// 		"key":  "",
	// 	},
	// }

	res, status, err := test.Fetch("POST", "/keychains", &FetchOptions{Body: data})

	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, status)
	assert.NotNil(t, res["id"])
}
