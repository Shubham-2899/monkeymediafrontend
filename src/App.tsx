import { Box } from "@mui/material";
import "./App.css";
import MonkeyMediaRoutes from "./routes/Routes";
import ResponsiveAppBar from "./components/Header";

function App() {
  return (
    <>
      <Box sx={{ margin: "0px 10px 0px 10px" }}>
        <ResponsiveAppBar />
        <MonkeyMediaRoutes />
      </Box>
    </>
  );
}

export default App;
