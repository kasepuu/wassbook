import jwtDecode from "jwt-decode";
import { backendHost } from ".";
function getUserInfoFromToken(tokenStr) {
  // const { decodedToken, isExpired } = useJwt(tokenStr);
  var decoded = jwtDecode(tokenStr);
  return decoded;
}

export function loadUser() {
  console.log("loading user");
  const jwtToken = getCookieValue("Bearer");
  if (jwtToken) {
    const userInfo = getUserInfoFromToken(jwtToken);
    if (userInfo) {
      localStorage.setItem("CurrentUser", JSON.stringify(userInfo.UserInfo));
    } else {
      console.log("Token is not valid or is expired.");
    }
  } else {
    console.log("Session token is missing!");
  }
}

export async function tokenValidation() {
  let jwtToken = getCookieValue("Bearer");

  if (!jwtToken) {
    console.log("Token not found");
    return false;
  }

  try {
    const response = await fetch(`${backendHost}/api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: jwtToken,
      },
    });

    if (response.ok) {
      const message = await response.text();
      console.log("Everything is working fine:", message);
      return true;
    } else {
      console.log(
        "You are not authorized, something went wrong while validating!"
      );
      return false;
    }
  } catch (error) {
    console.error("Something went wrong when trying to authorize:", error);
    return false;
  }
}

export function getCookieValue(cookieName) {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }
  return null;
}
