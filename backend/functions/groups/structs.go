package groups

type Group struct {
	Id          int     `json:"Id"`
	Tag         string  `json:"Tag"`
	Name        string  `json:"Name"`
	Owner       string  `json:"Owner"`
	OwnerId     int     `json:"OwnerId"`
	Members     []User  `json:"Members"`
	Description string  `json:"Description"`
	Events      []Event `json:"Events"`
	Membercount int     `json:"Membercount"`
	Posts       []Post  `json:"Posts"`
	AllUsers    []User  `json:"AllUsers"`
	// TODO mõelda kuidas päringus saada arvu
}

type Event struct {
	Id          string `json:"Id"`
	Description string `json:"Description"`
	Date        string `json:"Date"`
	Name        string `json:"Name"`
	Owner       string `json:"Owner"`
	OwnerId     string `json:"OwnerId"`
	GroupId     string `json:"GroupId"`
	Members     []User `json:"Members"`
}

type Post struct {
	Id        int
	UserId    int
	FirstName string
	LastName  string
	Date      string
	Content   string
	GroupId   int
	Filename  string
	Username  string
	GroupName string
	Comments  []Comment
}

type Comment struct {
	Id        int
	UserId    int
	GroupId   int
	PostId    int
	Date      string
	Content   string
	Username  string
	Avatar    string
	Filename  string
	FirstName string
	LastName  string
}

type User struct {
	Id        int
	Username  string
	Firstname string
	Lastname  string
	Status    string
	Date      string
	Email     string
}

type GroupInvite struct {
	GroupId    int
	SenderId   int
	ReceiverId int
	Status     string
}

type Notification struct {
	Id            int
	SenderId      int
	ReceiverId    int
	Description   string
	GroupMemberId int
	Status        string
}
