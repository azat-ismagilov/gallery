import { Grid } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import GalleryBody from "@/components/gallery/GalleryBody";
import Header from "@/components/layout/Header";
import { DesktopLogo } from "@/components/layout/Logo";
import Sidebar from "@/components/layout/Sidebar";
import { description, title } from "@/config/gallery";
import theme from "@/config/theme";
import { useAppContext } from "@/context/AppContext";

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
          <GalleryBody />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default App;
