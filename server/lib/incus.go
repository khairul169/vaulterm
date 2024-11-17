package lib

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"rul.sh/vaulterm/server/utils"
)

type IncusServer struct {
	HostName   string
	Port       int
	ClientCert string
	ClientKey  string
}

type IncusFetchConfig struct {
	Body map[string]interface{}
}

func (i *IncusServer) GetCertificate() (*tls.Certificate, error) {
	return utils.LoadClientCertificate(i.ClientCert, i.ClientKey)
}

func (i *IncusServer) Fetch(method string, url string, cfg *IncusFetchConfig) ([]byte, error) {
	var body io.Reader
	if cfg != nil && cfg.Body != nil {
		json, _ := json.Marshal(cfg.Body)
		body = bytes.NewBuffer(json)
	}

	reqUrl := fmt.Sprintf("https://%s:%d%s", i.HostName, i.Port, url)
	req, _ := http.NewRequest(method, reqUrl, body)

	if body != nil {
		req.Header.Add("Content-Type", "application/json")
	}

	clientCert, err := i.GetCertificate()
	if err != nil {
		return nil, err
	}

	tr := &http.Transport{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true,
			Certificates:       []tls.Certificate{*clientCert},
		},
	}
	client := &http.Client{
		Transport: tr,
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		return nil, fmt.Errorf("request failed with status code %d", resp.StatusCode)
	}

	return io.ReadAll(resp.Body)
}

type IncusInstanceExecOptions struct {
	Interactive bool
	User        *int
}

type IncusInstanceExecRes struct {
	ID        string
	Operation string
	Control   string
	Secret    string
}

func (i *IncusServer) InstanceExec(instance string, command []string, options *IncusInstanceExecOptions) (*IncusInstanceExecRes, error) {
	url := fmt.Sprintf("/1.0/instances/%s/exec?project=default", instance)

	var user *int
	if options != nil && options.User != nil {
		user = options.User
	}

	body, err := i.Fetch("POST", url, &IncusFetchConfig{
		Body: map[string]interface{}{
			"command":            command,
			"interactive":        options != nil && options.Interactive,
			"wait-for-websocket": true,
			"environment": map[string]string{
				"TERM": "xterm-256color",
			},
			"user": user,
		},
	})
	if err != nil {
		log.Println(err)
		return nil, err
	}

	var res struct {
		Operation string `json:"operation"`
		Metadata  struct {
			ID       string `json:"id"`
			Metadata struct {
				Fds map[string]string `json:"fds"`
			} `json:"metadata"`
		} `json:"metadata"`
	}
	if err := json.Unmarshal(body, &res); err != nil {
		return nil, err
	}

	control := res.Metadata.Metadata.Fds["control"]
	secret := res.Metadata.Metadata.Fds["0"]

	return &IncusInstanceExecRes{
		ID:        res.Metadata.ID,
		Operation: res.Operation,
		Control:   control,
		Secret:    secret,
	}, nil
}
