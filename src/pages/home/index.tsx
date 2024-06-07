import { Typography } from "@mui/material";
import { useUserAuth } from "../../contexts/UserAuthContext";
import mmsLandingPage from "../../assets/mmsHomePage.svg";

const Home = () => {
  const { user } = useUserAuth();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {user && (
        <>
          <Typography variant="h5" sx={{ my: 4, display: "inline" }}>
            Welcome
            <Typography variant="h5" color="primary" sx={{ display: "inline" }}>
              {`  ${user.displayName}!`}
            </Typography>
          </Typography>
          <img
            src={mmsLandingPage}
            alt="welcome Page"
            style={{ objectFit: "contain", overflow: "hidden" }}
          />
        </>
      )}
    </div>
  );
};

export default Home;
