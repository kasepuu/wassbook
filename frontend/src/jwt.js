import jwtDecode from "jwt-decode";

function getUserInfoFromToken(tokenStr) {
  // const { decodedToken, isExpired } = useJwt(tokenStr);
  var decoded = jwtDecode(tokenStr);
  return decoded;
}

export function loadUser() {
  const jwtToken = sessionStorage.getItem("Bearer");

  if (jwtToken) {
    const userInfo = getUserInfoFromToken(jwtToken);
    if (userInfo) {
      console.log("decoded data:", userInfo);
      console.log("UserInfo:", userInfo.UserInfo);
      localStorage.setItem("CurrentUser", JSON.stringify(userInfo.UserInfo));
    } else {
      console.log("Token is not valid or is expired.");
    }
  } else {
    console.log("Session token is missing!");
  }
}
