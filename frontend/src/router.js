import home_page from "./pages/home_page.js"
import error_page from "./pages/error_page.js"
import login_page from "./pages/login_page.js"
import register_page from "./pages/register_page.js"
import logout_page from "./pages/logout_page.js"

export function navigateTo(url) {
    history.pushState(null, null, url)
    router() 
}

export async function router() {
    const routes = [
        {
            path: "/",
            view: home_page
        },
        {
            path: "/login",
            view: login_page
        },
        {
            path: "/logout",
            view: logout_page
        },
        {
            path: "/register",
            view: register_page
        }
    ]

    // test each route for potential match
    const potentialMatches = routes.map(route => {
        const isMatchBoolean = location.pathname === route.path
        return {
            route: route,
            isMatch: isMatchBoolean
        }
    })


    let matchFound = potentialMatches.find(potentialMatches => potentialMatches.isMatch)
    if (matchFound) {
        matchFound.route.view() // <- scenery change
    } else {
        error_page();
    }
}
