package tests

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path"
	"runtime"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"rul.sh/vaulterm/app"
)

type HTTPTest struct {
	t   *testing.T
	app *fiber.App

	SessionID string
}

var instance *HTTPTest

func NewTest(t *testing.T) *HTTPTest {
	if instance != nil {
		return instance
	}
	instance = &HTTPTest{
		t:   t,
		app: app.NewApp(),
	}
	return instance
}

func NewTestWithAuth(t *testing.T) *HTTPTest {
	test := NewTest(t)
	test.WithAuth()
	return test
}

func init() {
	_, filename, _, _ := runtime.Caller(0)
	dir := path.Join(path.Dir(filename), "..")
	err := os.Chdir(dir)
	if err != nil {
		panic(err)
	}
}

type FetchOptions struct {
	Headers   map[string]string
	Body      interface{}
	SessionID string
}

type AuthOptions struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h *HTTPTest) Login(options *AuthOptions) string {
	body := options
	if options == nil {
		body = &AuthOptions{
			Username: "admin",
			Password: "123456",
		}
	}

	res, status, err := h.Fetch("POST", "/auth/login", &FetchOptions{
		Body: body,
	})

	if h.t != nil {
		assert.NoError(h.t, err)
		assert.Equal(h.t, http.StatusOK, status)
		assert.NotNil(h.t, res["user"])
		assert.NotEmpty(h.t, res["sessionId"])
	}

	return res["sessionId"].(string)
}

func (h *HTTPTest) WithAuth() string {
	if h.SessionID != "" {
		return h.SessionID
	}

	sessionId := h.Login(nil)
	h.SessionID = sessionId

	return sessionId
}

func (h *HTTPTest) Close() {
	if h.SessionID != "" {
		h.Fetch("POST", "/auth/logout?force=true", nil)
	}
	h.app.Shutdown()
}

func (h *HTTPTest) Fetch(method string, path string, options *FetchOptions) (map[string]interface{}, int, error) {
	var payload io.Reader
	headers := map[string]string{}
	if options != nil && options.Headers != nil {
		headers = options.Headers
	}

	if options != nil && options.Body != nil {
		json, _ := json.Marshal(options.Body)
		payload = bytes.NewBuffer(json)
		headers["Content-Type"] = "application/json"
	}

	sessionId := h.SessionID
	if options != nil && options.SessionID != "" {
		sessionId = options.SessionID
	}
	if sessionId != "" {
		headers["Authorization"] = "Bearer " + sessionId
	}

	req := httptest.NewRequest(method, path, payload)
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	resp, err := h.app.Test(req, -1)
	if err != nil {
		return nil, resp.StatusCode, err
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, err
	}

	contentType := resp.Header.Get("Content-Type")

	if contentType == "application/json" {
		var data map[string]interface{}
		if err := json.Unmarshal(body, &data); err != nil {
			return nil, resp.StatusCode, err
		}
		return data, resp.StatusCode, nil
	}

	data := map[string]interface{}{
		"data": string(body),
	}
	return data, resp.StatusCode, err
}
