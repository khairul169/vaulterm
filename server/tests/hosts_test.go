package tests

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHostsGetAll(t *testing.T) {
	test := NewTestWithAuth(t)

	res, status, err := test.Fetch("GET", "/hosts", nil)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, status)
	assert.NotNil(t, res["rows"])
}

func TestHostsCreate(t *testing.T) {
	test := NewTestWithAuth(t)

	data := map[string]interface{}{
		"type":  "pve",
		"label": "test ssh",
		"host":  "10.0.0.102",
		"port":  22,
		"keyId": "01jc3wkctzqrcz8qhwynr4p9pe",
	}

	// data := map[string]interface{}{
	// 	"type":  "pve",
	// 	"label": "test pve qemu",
	// 	"host":  "10.0.0.1",
	// 	"port":  8006,
	// 	"keyId": "01jc3wkctzqrcz8qhwynr4p9pe",
	// 	"metadata": map[string]interface{}{
	// 		"node": "pve",
	// 		"type": "qemu",
	// 		"vmid": "105",
	// 	},
	// }

	// data := map[string]interface{}{
	// 	"type":  "pve",
	// 	"label": "test pve lxc",
	// 	"host":  "10.0.0.1",
	// 	"port":  8006,
	// 	"keyId": "01jc3xcn5qgybbpfppy9pe14ae",
	// 	"metadata": map[string]interface{}{
	// 		"node": "pve",
	// 		"type": "lxc",
	// 		"vmid": "102",
	// 	},
	// }

	// data := map[string]interface{}{
	// 	"type":  "incus",
	// 	"label": "test incus",
	// 	"host":  "100.64.0.3",
	// 	"port":  8443,
	// 	"keyId": "01jc3xjcm6ddt4zc0x7g69nv9q",
	// 	"metadata": map[string]interface{}{
	// 		"instance": "test",
	// 		"shell":    "/bin/sh",
	// 	},
	// }

	res, status, err := test.Fetch("POST", "/hosts", &FetchOptions{Body: data})

	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, status)
	assert.NotNil(t, res["id"])
}
