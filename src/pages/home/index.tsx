import { Typography, Box } from "@mui/material";
import { useUserAuth } from "../../contexts/UserAuthContext";
import mmsLandingPage from "../../assets/mmsHomePage.svg";

const Home = () => {
  const { user } = useUserAuth();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: { xs: 2, sm: 4, md: 6 },
      }}
    >
      {user && (
        <>
          <Typography
            variant="h5"
            sx={{
              my: 4,
              textAlign: "center",
              fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.75rem" },
            }}
          >
            Welcome
            <Typography
              variant="h5"
              color="primary"
              sx={{
                display: "inline",
                fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.75rem" },
              }}
            >
              {`  ${user.displayName}!`}
            </Typography>
          </Typography>
          <Box
            component="img"
            src={mmsLandingPage}
            alt="Welcome Page"
            sx={{
              width: { xs: "90%", sm: "70%", md: "50%" },
              objectFit: "contain",
              overflow: "hidden",
              mt: 2,
            }}
          />
        </>
      )}
    </Box>
  );
};

export default Home;
