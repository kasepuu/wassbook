package handler

// register form
type RegisterForm struct {
	UserName          string `json:"userName"`
	FirstName         string `json:"firstName"`
	LastName          string `json:"lastName"`
	Email             string `json:"email"`
	Password          string `json:"password"`
	DateOfBirth_day   string `json:"dobDay"`
	DateOfBirth_month string `json:"dobMonth"`
	DateOfBirth_year  string `json:"dobYear"`
	DateOfBirth       string `json:dateofbirth`
}

// login form
type LoginForm struct {
	Login    string `json:"loginID"`
	Password string `json:"password"`
}

// filtered user info, the info that is visible to the public, in case "private" we use UserInfo struct
type PublicUserInfo struct {
	UserID     int    `json:"UserID"`
	FirstName  string `json:"FirstName"`
	LastName   string `json:"LastName"`
	UserName   string `json:"UserName"`
	Avatar     string `json:"Avatar"`
	DateJoined string `json:"DateJoined"`
}

type PostForm struct {
	PostID           int
	OriginalPosterID int    `json:"UserID"`
	FirstName        string `json:"FirstName"`
	LastName         string `json:"LastName"`
	Date             string
	Content          string `json:"Content"`
	GroupID          int    `json:"GroupID"`
	Filename         string
}
