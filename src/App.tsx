import { Grid } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import { useAppContext } from "./components/AppContext";
import Body from "./components/Body/Body";
import Header from "./components/Header/Header";
import { DesktopLogo } from "./components/Logo";
import Sidebar from "./components/Sidebar";
import { description, title } from "./consts";
import theme from "./theme";

import "./styles/App.css";

function App() {
  const { desktop } = useAppContext();

  return (
    <ThemeProvider theme={theme}>
      <title>{title}</title>
      <meta name="description" content={description} />
      <CssBaseline />
      <Grid
        container
        columns={10}
        spacing={1}
        sx={{ height: "100vh", p: 2, pb: 0 }}
      >
        {desktop && (
          <Grid
            size={2}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <DesktopLogo />
            <Sidebar />
          </Grid>
        )}
        <Grid
          size="grow"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Header />
          <Body />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default App;
