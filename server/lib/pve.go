package lib

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type PVEServer struct {
	HostName string
	Port     int
	Username string
	Password string
}

type PVERequestInit struct {
	Body   map[string]string
	Ticket string
	CSRF   string
}

func fetch(method string, url string, cfg *PVERequestInit) ([]byte, error) {
	var body io.Reader
	if cfg.Body != nil {
		json, _ := json.Marshal(cfg.Body)
		body = bytes.NewBuffer(json)
	}

	req, _ := http.NewRequest(method, url, body)

	if cfg.Ticket != "" {
		req.Header.Add("Cookie", "PVEAuthCookie="+cfg.Ticket)
	}
	if cfg.CSRF != "" {
		req.Header.Add("CSRFPreventionToken", cfg.CSRF)
	}
	if body != nil {
		req.Header.Add("Content-Type", "application/json")
	}

	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{
		Transport: tr,
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("request failed with status code %d", resp.StatusCode)
	}

	return io.ReadAll(resp.Body)
}

type PVEAccessTicket struct {
	CSRFPreventionToken string `json:"CSRFPreventionToken"`
	Ticket              string `json:"ticket"`
	Username            string `json:"username"`
}

func (pve *PVEServer) GetAccessTicket() (*PVEAccessTicket, error) {
	url := fmt.Sprintf("https://%s:%d/api2/json/access/ticket", pve.HostName, pve.Port)

	body, err := fetch("POST", url, &PVERequestInit{Body: map[string]string{
		"username": pve.Username,
		"password": pve.Password,
	}})
	if err != nil {
		return nil, err
	}

	var res struct {
		Data PVEAccessTicket `json:"data"`
	}
	if err := json.Unmarshal(body, &res); err != nil {
		return nil, err
	}

	return &res.Data, nil
}

type PVEInstance struct {
	Type string // "qemu" | "lxc"
	Node string
	VMID string
}

type PVEVNCTicketData struct {
	Port   string `json:"port"`
	User   string `json:"user"`
	Ticket string `json:"ticket"`
	CERT   string `json:"cert"`
	Upid   string `json:"upid"`
}

func (pve *PVEServer) GetVNCTicket(access *PVEAccessTicket, instance *PVEInstance, isVNC bool) (*PVEVNCTicketData, error) {
	proxyType := "termproxy"
	if isVNC {
		proxyType = "vncproxy"
	}

	url := fmt.Sprintf("https://%s:%d/api2/json/nodes/%s/%s/%s/%s",
		pve.HostName, pve.Port, instance.Node, instance.Type, instance.VMID, proxyType)

	body, err := fetch("POST", url, &PVERequestInit{Ticket: access.Ticket, CSRF: access.CSRFPreventionToken})
	if err != nil {
		return nil, err
	}

	var res struct {
		Data PVEVNCTicketData `json:"data"`
	}
	if err := json.Unmarshal(body, &res); err != nil {
		return nil, err
	}

	return &res.Data, nil
}
