import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { loadUser, tokenValidation } from "./jwt";

function App() {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuthorization = () => {
      tokenValidation()
        .then((AuthorizedStatus) => {
          setIsAuthorized(AuthorizedStatus);
          if (!AuthorizedStatus) {
            console.log("you are not authorized, no access!");
            return;
          }
          console.log(isAuthorized);

          loadUser();
        })
        .catch((error) => {
          console.error("[Authorization] Error:", error);
        });

      checkAuthorization();
    };
  }, []);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
    </>
  );
}

export default App;
