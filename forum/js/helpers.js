import { clearAllCookies } from "./views/logout_page.js"

export async function hasSession() {
    if (sessionStorage.getItem("CurrentUser")) {
        let currentUser = JSON.parse(sessionStorage.getItem("CurrentUser"))
        let sessionExists = await hasCookie(currentUser)
        if (sessionExists) {
            return true
        } else {
            localStorage.clear()
            sessionStorage.clear()
            clearAllCookies()
        }
    }
    return false
}

export async function hasCookie(cookie) {
    // do this in websocket later?
    try {
        const url = `/hasCookie?CookieKey=${cookie.CookieKey}&UserID=${cookie.UserID}`

        const response = await fetch(url)

        if (response.ok) {
            console.log("session found")
            return true
        } else {
            console.log("session failed")
            return false
        }
    } catch (e) {
        console.error(e)
        return false
    }
}

// not used, just saved as an reminder on how polling works
export async function getOnlineUsers() {
    try {
        const url = `/get-active-users`;
        const response = await fetch(url);

        if (response.ok) {
            let data = await response.json();
            document.getElementById("onlineMembers").innerHTML = data.Amount + "👥"
        } else {
            console.log("Failed to fetch comments data.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        // polling
        getOnlineUsers()
    }
}
