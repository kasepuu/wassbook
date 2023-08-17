package app

import (
	"log"
	"net/http"
	"strings"

	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

func StartServer(port string) {

	sqlDB.SessionCleanup()                                           // sessions table cleanup
	wsManager := NewManager()                                        // websocket manager
	fsViews := noDirListing(http.FileServer(http.Dir("./views/")))   // nodirlisting to avoid guest seeing all files stored in /web/images/
	fsPublic := noDirListing(http.FileServer(http.Dir("./public/"))) // nodirlisting to avoid guest seeing all files stored in /web/images/

	log.Printf("Starting server at port " + port + "\n\n")
	log.Printf("http://localhost:" + port + "/\n")

	http.Handle("/views/", http.StripPrefix("/views", fsViews))    // handling views folder
	http.Handle("/public/", http.StripPrefix("/public", fsPublic)) // handling public folder

	http.HandleFunc("/ws", wsManager.serveWs)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./views/index.html")
	})

	// session related
	// http.HandleFunc("/login-attempt", LoginHandler)
	// http.HandleFunc("/logout-attempt", LogoutHandler)
	// http.HandleFunc("/register-attempt", RegisterHandler)
	// http.HandleFunc("/hasCookie", HasCookieHandler)

	// miscellaneous
	// http.HandleFunc("/get-comments", SendCommentList)
	// http.HandleFunc("/new-post", AddPostHandler)
	// http.HandleFunc("/new-comment", AddCommentHandler)

	errorHandler(http.ListenAndServe(":"+port, nil))
}

func errorHandler(err error) {
	if err != nil {
		log.Println(err)
		return
	}
}

func noDirListing(h http.Handler) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/") {
			w.WriteHeader(http.StatusForbidden)
			return
		}
		h.ServeHTTP(w, r)
	})
}
