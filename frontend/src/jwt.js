const jwt = require("jsonwebtoken");

function getUserInfoFromToken(tokenStr) {
  try {
    const decodedToken = jwt.verify(tokenStr, "supermees");
    const userID = decodedToken.UID;
    const userName = decodedToken.UserName;
    console.log(userID, userName);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}
