package groups

type UserStruct struct {
	Id       int
	Username string
}

type Group struct {
	Id          int          `json:"Id"`
	Name        string       `json:"Name"`
	Owner       string       `json:"Owner"`
	OwnerId     int          `json:"OwnerId"`
	Members     []UserStruct `json:"Members"`
	Description string       `json:"Description"`
	Events      []Event      `json:"Events"`
	Membercount int          `json:"Membercount"`
	// TODO mõelda kuidas päringus saada arvu
}

type Event struct {
	Id          string       `json:"Id"`
	Description string       `json:"Description"`
	Date        string       `json:"Date"`
	Name        string       `json:"Name"`
	Owner       string       `json:"Owner"`
	OwnerId     string       `json:"OwnerId"`
	GroupId     string       `json:"GroupId"`
	Members     []UserStruct `json:"Members"`
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
}

type Comment struct {
	Id       int
	UserId   int
	GroupId  int
	PostId   int
	Date     string
	Content  string
	Username string
	Avatar   string
	Filename string
}
