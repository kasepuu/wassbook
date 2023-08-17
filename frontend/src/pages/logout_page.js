import { hasSession } from "../helpers.js"
import { sendEvent } from "../websocket.js"
import { navigateTo } from "./router.js"

export default async function () {
    if (hasSession()) {
        let currentUser = JSON.parse(sessionStorage.getItem("CurrentUser"))
        sendEvent("get_online_members", `logout-${currentUser.UserID}`)
        sendEvent("update_users", "other Logout")
        logoutAttempt(currentUser)
    } else {
        navigateTo("/")
    }
}

async function logoutAttempt(currentUser) {
    try {
        let url = `/logout-attempt?UserID=${currentUser.UserID}`
        let response = await fetch(url)
        logoutResponse(response)
    } catch (e) {
        console.error(e)
        return false
    }
}

function logoutResponse(response) {
    if (response.ok) {
        // cleanup on logout
        localStorage.clear()
        sessionStorage.clear()
        clearAllCookies()

        navigateTo("/login")
    } else {
        console.log("logout failed! (????)")
    }
}


export function clearAllCookies() {
    const cookies = document.cookie.split(";")

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
}
