package app

import (
	"log"
	"net/http"
	"strings"

	handler "01.kood.tech/git/kasepuu/social-network/backend/handlers"
	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
	"github.com/rs/cors"
)

func StartServer(port string) {
	sqlDB.SessionCleanup()                                           // sessions table cleanup
	wsManager := NewManager()                                        // websocket manager
	fsViews := noDirListing(http.FileServer(http.Dir("./views/")))   // nodirlisting to avoid guest seeing all files stored in /web/images/
	fsPublic := noDirListing(http.FileServer(http.Dir("./public/"))) // nodirlisting to avoid guest seeing all files stored in /web/images/

	// Create a CORS handler
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:8080"},  // Allow requests from this origin
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"}, // Allow these HTTP methods
		AllowedHeaders:   []string{"*"},                      // Allow these headers
		AllowCredentials: true,                               // Allow sending cookies
	})

	log.Printf("Starting server at port " + port + "\n\n")
	log.Printf("backend is running at: http://localhost:" + port + "/\n")

	http.Handle("/views/", http.StripPrefix("/views", fsViews))    // handling views folder
	http.Handle("/public/", http.StripPrefix("/public", fsPublic)) // handling public folder

	http.HandleFunc("/ws", wsManager.serveWs)

	// Wrap your handlers with the corsHandler
	http.Handle("/", corsHandler.Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./views/index.html")
	})))

	http.Handle("/login-attempt", corsHandler.Handler(http.HandlerFunc(handler.Login)))
	http.Handle("/register-attempt", corsHandler.Handler(http.HandlerFunc(handler.Register)))

	http.Handle("/jwt", corsHandler.Handler(http.HandlerFunc(handler.GetJwt)))      // for generating jwt token
	http.Handle("/api", corsHandler.Handler(http.HandlerFunc(handler.ValidateJWT))) // for validating jwt token

	http.Handle("/getSearchedUsers", corsHandler.Handler(http.HandlerFunc(handler.GetSearchedUsers)))

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
