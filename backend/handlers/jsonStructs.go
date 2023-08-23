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
}

// login form
type LoginForm struct {
	Login    string `json:"loginID"`
	Password string `json:"password"`
}

type PostForm struct {
	PostID           int
	OriginalPosterID int    `json:"UserID"`
	FirstName        string `json:"FirstName"`
	LastName         string `json:"LastName"`
	Date             string `json:"Date"`
	Content          string `json:"Content"`
	GroupID          int    `json:"GroupID"`
}
