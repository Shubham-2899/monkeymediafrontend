import { Box } from "@mui/material";
import "./App.css";
import MonkeyMediaRoutes from "./routes/Routes";
import ResponsiveAppBar from "./components/Header";
import { UserAuthContextProvider } from "./contexts/UserAuthContext";

function App() {
  return (
    <>
      <Box sx={{ margin: "0px 10px 0px 10px" }}>
        <UserAuthContextProvider>
          <ResponsiveAppBar />
          <MonkeyMediaRoutes />
        </UserAuthContextProvider>
      </Box>
    </>
  );
}

export default App;
