package app

import (
	"fmt"
	"os"
	"sort"
	"time"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

func getUserId(loginInput string) (userId int) {
	sqlDB.DataBase.QueryRow("SELECT id FROM users WHERE username = ? OR email = ?", loginInput, loginInput).Scan(&userId)
	return userId
}

func getUserName(userId int) (UserName string) {
	sqlDB.DataBase.QueryRow("SELECT username FROM users WHERE id = ?", userId).Scan(&UserName)
	return UserName
}

func getCategoryFromID(id int) (category string) {
	sqlDB.DataBase.QueryRow("SELECT name FROM category WHERE id = ?", id).Scan(&category)
	return category
}

func getCategoryFromName(id string) (category int) {
	sqlDB.DataBase.QueryRow("SELECT id FROM category WHERE name = ?", id).Scan(&category)
	return category
}

func getUserIdFomMessage(User string) (userID int) {
	sqlDB.DataBase.QueryRow("SELECT id FROM users WHERE username = ?", User).Scan(&userID)
	return
}

func getUserNameByID(UserID int) (UserName string) {
	sqlDB.DataBase.QueryRow("SELECT username FROM users WHERE id = ?", UserID).Scan(&UserName)
	return
}

func getAllUsers(uid int) (users []UserResponse) {
	rows, _ := sqlDB.DataBase.Query("SELECT id, username FROM users WHERE id != ? ORDER BY username", uid)
	defer rows.Close()
	for rows.Next() {
		var user UserResponse
		rows.Scan(&user.UserID, &user.UserName)
		user.Status = getOnlineStatus(user.UserID)
		users = append(users, user)
	}
	users = sortByLastMessage(users, uid)
	return
}

func getOnlineStatus(userId int) (isOnline bool) {
	isOnline = false
	for o := 0; o < len(onlineUsersArray); o++ {
		if onlineUsersArray[o] == userId {
			isOnline = true
			return isOnline
		}
	}
	return isOnline
}

func sortByLastMessage(users []UserResponse, uid int) (sortedUsers []UserResponse) {
	sql := `SELECT messageid FROM chat WHERE (userid = ? AND receiverid = ?) OR
	(receiverid = ? AND userid = ?) ORDER BY messageid DESC LIMIT 1`

	for i := 0; i < len(users); i++ {
		rows, err := sqlDB.DataBase.Query(sql, uid, users[i].UserID, uid, users[i].UserID)
		if err != nil {
			fmt.Println(err)
		}
		defer rows.Close()

		if rows.Next() {
			var user UserResponse

			user.UserID = users[i].UserID
			user.UserName = users[i].UserName
			user.Status = users[i].Status

			rows.Scan(&user.LastMessageID)

			sortedUsers = append(sortedUsers, user)
		} else {
			sortedUsers = append(sortedUsers, users[i])
		}
	}
	sort.Slice(sortedUsers, func(i, j int) bool {
		return sortedUsers[i].LastMessageID > sortedUsers[j].LastMessageID
	})

	return
}

func getOnlineUsers() (onlineUsers []int) {
	rows, _ := sqlDB.DataBase.Query("SELECT userId FROM session")

	defer rows.Close()

	for rows.Next() {

		var id int
		rows.Scan(&id)
		onlineUsers = append(onlineUsers, id)
	}

	return onlineUsers
}

func getAllPosts() (posts []PostResponse) {
	rows, err := sqlDB.DataBase.Query("SELECT id, userId, title, content, categoryId, date FROM posts ORDER BY id DESC")
	if err != nil {
		fmt.Println(err)
		os.Exit(0)
	}
	defer rows.Close()
	for rows.Next() {
		var post PostResponse
		var categoryId int
		rows.Scan(&post.PostID, &post.OriginalPosterID, &post.Title, &post.Content, &categoryId, &post.Date)
		messageDateTime, err := time.Parse(time.RFC3339Nano, post.Date)
		if err == nil {
			post.Date = messageDateTime.Format("02.01.2006 15:04")
		}
		post.OriginalPoster = getUserName(post.OriginalPosterID)
		post.Category = getCategoryFromID(categoryId)
		posts = append(posts, post)
	}
	return posts
}

func getAllComments(postId int) (postData PostResponse, comments []CommentResponse) {
	rows, err := sqlDB.DataBase.Query("SELECT id, userId, content, datecommented FROM comments WHERE postId = ? ORDER BY id DESC", postId)
	if err != nil {
		fmt.Println(err)
		os.Exit(0)
	}
	defer rows.Close()

	for rows.Next() {
		var comment CommentResponse

		rows.Scan(&comment.CommentID, &comment.OriginalPosterID, &comment.Content, &comment.Date)
		messageDateTime, err := time.Parse(time.RFC3339Nano, comment.Date)
		if err == nil {
			comment.Date = messageDateTime.Format("02.01.2006 15:04")
		}
		comment.PostID = postId
		comment.OriginalPoster = getUserName(comment.OriginalPosterID)
		comments = append(comments, comment)
	}

	row, erro := sqlDB.DataBase.Query("SELECT userId, title, content, categoryId, date FROM posts WHERE id = ?", postId)
	if erro != nil {
		fmt.Println(erro)
		os.Exit(0)
	}

	for row.Next() {
		row.Scan(&postData.OriginalPosterID, &postData.Title, &postData.Content, &postData.Category, &postData.Date)

		messageDateTime, err := time.Parse(time.RFC3339Nano, postData.Date)
		if err == nil {
			postData.Date = messageDateTime.Format("02.01.2006 15:04")
		}
		postData.OriginalPoster = getUserName(postData.OriginalPosterID)
	}

	return postData, comments
}

func removeSessionById(id int) {
	_, err := sqlDB.DataBase.Exec("DELETE FROM session WHERE userId = ?", id)
	errorHandler(err)
}

/*non-sql (o.o)*/
func removeFromSlice(slice []int, element int) []int {
	var result []int
	for _, item := range slice {
		if item != element {
			result = append(result, item)
		}
	}
	return result
}
