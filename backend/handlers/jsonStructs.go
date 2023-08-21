package handler

// register form
type RegisterForm struct {
	firstName string `json:"firstName"`
	lastName  string `json:"lastName"`
	email     string `json:"email"`
	password  string `json:"password"`
}

// login form
type LoginForm struct {
	Login    string `json:"loginID"`
	Password string `json:"password"`
}
