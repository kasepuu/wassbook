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

	// mux
	mux := http.NewServeMux()
	corsMux := &CorsHandler{ServeMux: mux}

	corsMux.Handle("/views/", http.StripPrefix("/views", fsViews))
	corsMux.Handle("/public/", http.StripPrefix("/public", fsPublic))

	// essential stuff
	corsMux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("mux mux mux"))
	})

	corsMux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		http.HandlerFunc(wsManager.serveWs).ServeHTTP(w, r)
	})

	// api stuff
	corsMux.HandleFunc("/login-attempt", handler.Login)
	corsMux.HandleFunc("/register-attempt", handler.Register)
	corsMux.HandleFunc("/jwt", handler.GetJwt)                 // for generating jwt token
	corsMux.HandleFunc("/api", handler.ValidateJWT)            // for validating jwt token
	corsMux.HandleFunc("/update-jwt-token", handler.UpdateJwt) // for updating the jwt token

	// get requests
	corsMux.HandleFunc("/fetch-searchbar-users", handler.FetchSearchBarUsers)
	corsMux.HandleFunc("/fetch-current-profile", handler.FetchCurrentProfile)
	corsMux.HandleFunc("/getPostByUserId", handler.FetchPostsCreatedBy)
	corsMux.HandleFunc("/update-private-status", handler.UpdatePrivateStatusHandler)
	corsMux.HandleFunc("/update-user-description", handler.UpdateUserDescriptionHandler)
	corsMux.HandleFunc("/update-user-name", handler.UpdateUserNameHandler)

	// post requests
	corsMux.HandleFunc("/savepost", handler.Savepost)
	corsMux.HandleFunc("/getposts", handler.FetchPosts)
	corsMux.HandleFunc("/users/", handler.ImageHandler)

	log.Printf("backend is running at: http://localhost:" + port + "/\n")
	log.Printf("frontend should be running at: http://localhost:" + "8080" + "/\n")

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
