import { navigateTo } from "./router.js";
import { clearAllCookies } from "./logout_page.js";
export default function () {
    document.title = "Login"

    document.getElementById("app").innerHTML = `
    <div class="login">

    <form id="loginForm" action="javascript:" method="POST">
    <br>
    <h1>Login page</h1>    
    <br>
        <input type="text" placeholder="Username or email" name="login_id" id="login_id" value=""><br><br>
        <input type="password" placeholder="Password" name="login_pw" id="login_pw" value=""><br>
        <br>
        <a id="ErrorBox"></a>
        <br>
        <br>
        <button type="submit" class="button">Sign in!</button>
        <br>
    <br>


    <a href="/register" class="nav__link" [data-link]="">Create a new account!</a>
  
    </form>
    </div>
    `;

    loginListener()
}

function loginListener() {
    let loginForm = document.getElementById("loginForm")
    let loginData = {}

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        // cleanup on login
        localStorage.clear()
        sessionStorage.clear()
        clearAllCookies()

        var formData = new FormData(loginForm)

        for (var [key, value] of formData.entries()) {
            loginData[key] = value
        }

        const options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        }

        try {
            let response = await fetch("/login-attempt", options)
            loginResponse(response)
        } catch (e) {
            console.error(e)
        }
    })
}

async function loginResponse(response) {
    if (response.ok) {
        let data = await response.json()
        sessionStorage.setItem("CurrentUser", JSON.stringify(data))
        navigateTo("/")
    } else {
        let message = await response.text()
        document.getElementById("ErrorBox").innerHTML = message.replace()
    }
}
