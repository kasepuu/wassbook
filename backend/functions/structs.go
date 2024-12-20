package function

type UserResponse struct {
	UserID        int
	UserName      string
	LastMessageID int
	Status        bool // online/offline status
}

type UserStruct struct {
	UserID   int
	UserName string
}

type UsersOnlineResponse struct {
	Userlist []UserStruct
	Amount   int
}

// information that will be pushed in to the site
type CurrentUser struct {
	UserID     int
	UserName   string
	Reputation int
	Rank       string
}

type CookieResponse struct {
	UserID    int
	CookieKey string
}

// login info that will be fetched from js
type LoginInfo struct {
	Login    string `json:"login_id"`
	Password string `json:"login_pw"`
}

// response that will be sent back to js
type LoginResponse struct {
	LoginName string
	UserID    int
	CookieKey string
}

// register info that will be fetched from js
type RegisterInfo struct {
	Username  string `json:"register_nickname"`
	Age       string `json:"register_age"`
	Gender    string `json:"register_gender"`
	FirstName string `json:"register_fname"`
	LastName  string `json:"register_lname"`
	Email     string `json:"register_email"`
	Password  string `json:"register_passwd"`
}

// post info that will be fetched from js
type PostResponse struct {
	PostID           int
	OriginalPosterID int
	FirstName        string
	LastName         string
	Date             string
	Content          string
	GroupId          int
	Filename         string
}

type CommentResponse struct {
	CommentID        int
	OriginalPoster   string
	OriginalPosterID int
	PostID           int
	Content          string
	Date             string
}

type CommentResponseWPostData struct {
	PostData interface{} `json:"postData"`
	Comments interface{} `json:"comments"`
}

type NewPostInfo struct {
	Title      string `json:"post_title"`
	Content    string `json:"post_content"`
	Categories string `json:"post_categories"`
}

type NewCommentInfo struct {
	PostID  string `json:"hiddenPostID"`
	Content string `json:"comment_content"`
}

type SaveMessage struct {
	Message      string `json:"Message"`
	SenderName   string `json:"SenderName"`
	ReceiverName string `json:"ReceiverName"`
}

type MutualFollower struct {
	UserId   int
	UserName string
}

type JoinedGroup struct {
	UserId       int
	OtherMembers []int
	GroupID      int
	GroupName    string
}

type Notification struct {
	ID          int
	TargetID    int
	SenderID    int
	Description string
}

type GroupRequest struct {
	UserInfo  UserInfo
	IsInvite  bool
	GroupInfo GroupRequestInfo
}
type GroupRequestInfo struct {
	ID   int
	Name string
}
