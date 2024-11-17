package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/tls"
	"crypto/x509"
	"encoding/base64"
	"encoding/hex"
	"encoding/pem"
	"fmt"
	"io"
	"os"

	"golang.org/x/crypto/bcrypt"
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

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	return string(bytes), err
}

func VerifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GenerateSessionID(size int) (string, error) {
	sessionID := make([]byte, size)

	// Read random bytes into sessionID
	_, err := rand.Read(sessionID)
	if err != nil {
		return "", err
	}

	// Encode as hex string
	return hex.EncodeToString(sessionID), nil
}

func Encrypt(data string) (string, error) {
	key := os.Getenv("ENCRYPTION_KEY")
	if key == "" {
		return "", fmt.Errorf("ENCRYPTION_KEY is not set")
	}

	keyDec, err := hex.DecodeString(key)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(keyDec)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := aesGCM.Seal(nonce, nonce, []byte(data), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func Decrypt(encrypted string) (string, error) {
	key := os.Getenv("ENCRYPTION_KEY")
	if key == "" {
		return "", fmt.Errorf("ENCRYPTION_KEY is not set")
	}

	keyDec, err := hex.DecodeString(key)
	if err != nil {
		return "", err
	}

	data, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		return "", err
	}

	if len(data) < 16 {
		return "", fmt.Errorf("invalid encrypted data")
	}

	block, err := aes.NewCipher(keyDec)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := aesGCM.NonceSize()
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]

	res, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(res), nil
}

// Function to generate a 32-byte random key for AES-256
func GenerateRandomKey() (string, error) {
	key := make([]byte, 32) // 32 bytes = 256 bits
	_, err := rand.Read(key)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(key), nil
}
