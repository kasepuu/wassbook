import { wsAddConnection } from "./websocket.js"
import { hasSession } from "./helpers.js"
import { router, navigateTo } from "./views/router.js"

window.addEventListener("popstate", router)
window.addEventListener("load", router)
window.addEventListener("beforeunload", router)

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e) => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault()
            navigateTo(e.target.href)
        }
    })
    router()
})