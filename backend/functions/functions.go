package function

import (
	"sort"
	"strings"
)

func Title(input string) (str string) {
	// strings.Title is depreciated
	return strings.ToUpper(string(input[0])) + input[1:]
}

func SortUsers(users []UserInfo) []UserInfo {

	sort.Slice(users, func(i, j int) bool {
		return strings.ToLower(users[i].FirstName) < strings.ToLower(users[j].FirstName)
	})

	return users
}

// helper function to check if a value is present in a slice
func Contains(slice []int, value int) bool {
	for _, item := range slice {
		if item == value {
			return true
		}
	}
	return false
}
