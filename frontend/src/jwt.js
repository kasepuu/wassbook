import jwtDecode from "jwt-decode";
import { backendHost } from ".";
function getUserInfoFromToken(tokenStr) {
  // const { decodedToken, isExpired } = useJwt(tokenStr);
  var decoded = jwtDecode(tokenStr);
  return decoded;
}
// const refreshToken = async () => {
//   const userInfo = JSON.parse(sessionStorage.getItem("CurrentUser"));
//   const currentAccessToken = userInfo.accessToken;

//   try {
//     const response = await fetch(`${backendHost}/refresh-token`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${currentAccessToken}`, // Include the refresh token
//       },
//     });

//     if (response.ok) {
//       const newAccessToken = await response.json();
//       // Update the old access token with the new one
//       const userInfo = JSON.parse(sessionStorage.getItem("CurrentUser"));
//       userInfo.accessToken = newAccessToken.accessToken;
//       sessionStorage.setItem("CurrentUser", JSON.stringify(userInfo));
//     } else {
//       console.log("Token refresh failed.");
//     }
//   } catch (error) {
//     console.error("Error refreshing token:", error);
//   }
// };
export function updateToken(usernameChange = false) {
  const userid = JSON.parse(sessionStorage.getItem("CurrentUser")).UserID;
  console.log("UPDATING JWT FOR USER:", userid);
  fetch(`${backendHost}/update-jwt-token?UserID=${userid}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update token");
      }
      return response.text();
    })
    .then((updatedToken) => {
      console.log("new token:", updatedToken);
      // Update the "Bearer" cookie with the updated token
      document.cookie = `Bearer=${updatedToken}; Path=/`;
      loadUser(); // reloading the current user

      if (usernameChange) {
        const changedUsername = JSON.parse(
          sessionStorage.getItem("CurrentUser")
        ).UserName;
        window.location.href = `/profile/${changedUsername}`;
      }
    })
    .catch((error) => {
      console.error("Error updating token:", error);
    });
}

export function loadUser() {
  console.log("loading user");
  const jwtToken = getCookieValue("Bearer");
  if (jwtToken) {
    const userInfo = getUserInfoFromToken(jwtToken);
    if (userInfo) {
      sessionStorage.setItem("CurrentUser", JSON.stringify(userInfo.UserInfo));
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
