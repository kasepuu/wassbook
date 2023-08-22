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
      console.log("UserID:", userInfo.UID);
      console.log("Username:", userInfo.UserName);
    } else {
      console.log("Token is not valid or is expired.");
    }
  } else {
    console.log("Session token is missing!");
  }
}
