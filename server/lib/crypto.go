package lib

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/pem"
	"fmt"
)

func LoadClientCertificate(clientCert string, clientKey string) (*tls.Certificate, error) {
	// Client certificate
	ccb, _ := pem.Decode([]byte(clientCert))
	if ccb == nil {
		return nil, fmt.Errorf("failed to parse client certificate")
	}

	cert, err := x509.ParseCertificate(ccb.Bytes)
	if err != nil {
		return nil, fmt.Errorf("failed to parse client certificate: %v", err)
	}

	// Client key
	ckb, _ := pem.Decode([]byte(clientKey))
	if ckb == nil {
		return nil, fmt.Errorf("failed to parse client key")
	}

	key, err := x509.ParsePKCS8PrivateKey(ckb.Bytes)
	if err != nil {
		return nil, fmt.Errorf("failed to parse client key: %v", err)
	}

	return &tls.Certificate{
		Certificate: [][]byte{cert.Raw},
		PrivateKey:  key,
	}, nil
}
