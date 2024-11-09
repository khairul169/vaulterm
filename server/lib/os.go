package lib

import "strings"

// Map of OS identifiers and their corresponding names
var osMap = map[string]string{
	"arch":     "arch",
	"ubuntu":   "ubuntu",
	"kali":     "kali",
	"raspbian": "raspbian",
	"pop":      "pop",
	"debian":   "debian",
	"fedora":   "fedora",
	"centos":   "centos",
	"alpine":   "alpine",
	"mint":     "mint",
	"suse":     "suse",
	"darwin":   "macos",
	"windows":  "windows",
	"msys":     "windows",
	"linux":    "linux",
}

func DetectOS(str string) string {
	str = strings.ToLower(str)
	for keyword, osName := range osMap {
		if strings.Contains(str, keyword) {
			return osName
		}
	}
	return ""
}
