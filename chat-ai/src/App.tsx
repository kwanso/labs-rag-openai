import { Box, Typography } from "@mui/material";
import "./App.css";
import ChatBox from "./Chat/ChatBox";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Box textAlign="center" color="whiteSmoke" paddingY={4} bgcolor="#7277c7">
          <Typography variant="h4">Chat App</Typography>
        </Box>

        <ChatBox />
      </Box>
    </ThemeProvider>
  );
}

export default App;
