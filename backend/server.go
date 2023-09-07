package app

import (
	"log"
	"net/http"
	"strings"

	handler "01.kood.tech/git/kasepuu/social-network/backend/handlers"
	sqlDB "01.kood.tech/git/kasepuu/social-network/database"
)

type CorsHandler struct {
	*http.ServeMux
}

func (c CorsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// The CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:8080") // origin
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")   // methods
	w.Header().Set("Access-Control-Allow-Headers", "*")                    // headers
	w.Header().Set("Access-Control-Allow-Credentials", "true")             // cookies

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	c.ServeMux.ServeHTTP(w, r)
}

func StartServer(port string) {
	sqlDB.SessionCleanup()                                           // sessions table cleanup
	wsManager := NewManager()                                        // websocket manager
	fsViews := noDirListing(http.FileServer(http.Dir("./views/")))   // nodirlisting to avoid guest seeing all files stored in /views/
	fsPublic := noDirListing(http.FileServer(http.Dir("./public/"))) // nodirlisting to avoid guest seeing all files stored in /public/

	log.Printf("Starting server at port " + port + "\n\n")
	log.Printf("backend is running at: http://localhost:" + port + "/\n")

	// mux
	mux := http.NewServeMux()
	corsMux := &CorsHandler{ServeMux: mux}

	// Apply CORS middleware to all handler
	corsMux.Handle("/views/", http.StripPrefix("/views", fsViews))
	corsMux.Handle("/public/", http.StripPrefix("/public", fsPublic))

	// essential stuff
	corsMux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("mux mux mux"))
	})

	// Wrap wsManager.serveWs with corsMiddleware
	corsMux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		http.HandlerFunc(wsManager.serveWs).ServeHTTP(w, r)
	})

	// api stuff
	corsMux.HandleFunc("/login-attempt", handler.Login)
	corsMux.HandleFunc("/register-attempt", handler.Register)
	corsMux.HandleFunc("/jwt", handler.GetJwt)      // for generating jwt token
	corsMux.HandleFunc("/api", handler.ValidateJWT) // for validating jwt token

	// get requests
	corsMux.HandleFunc("/fetch-searchbar-users", handler.FetchSearchBarUsers)
	corsMux.HandleFunc("/fetch-current-profile", handler.FetchCurrentProfile)
	corsMux.HandleFunc("/getPostByUserId", handler.FetchPostsCreatedBy)
	corsMux.HandleFunc("/update-private-status", handler.UpdatePrivateStatusHandler)
	corsMux.HandleFunc("/update-user-description", handler.UpdateUserDescriptionHandler)

	// post requests
	corsMux.Handle("/savepost", http.HandlerFunc(handler.Savepost))
	corsMux.Handle("/savecomment", http.HandlerFunc(handler.SaveComment))
	corsMux.Handle("/getposts", http.HandlerFunc(handler.FetchPosts))
	corsMux.Handle("/getcomments", http.HandlerFunc(handler.FetchComments))
	corsMux.Handle("/users/", http.HandlerFunc(handler.ImageHandler))

	errorHandler(http.ListenAndServe(":"+port, corsMux))
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
