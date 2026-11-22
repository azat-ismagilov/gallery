import { Grid } from "@mui/material";
import { lazy, Suspense } from "react";

import { description, title } from "@/config/gallery";
import GalleryBody from "@/features/gallery/components/GalleryBody";
import { useAppContext } from "@/features/gallery/state/AppContext";
import Header from "@/features/navigation/components/Header";
import { DesktopLogo } from "@/features/navigation/components/Logo";
import YearNav from "@/features/navigation/components/YearNav";

const FlickrSettingsDialog = lazy(
  () => import("@/features/settings/components/FlickrSettingsDialog"),
);

function App() {
  const { desktop, isSettingsOpen, closeSettings } = useAppContext();

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
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
            <YearNav />
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
      {isSettingsOpen && (
        <Suspense fallback={null}>
          <FlickrSettingsDialog open={isSettingsOpen} onClose={closeSettings} />
        </Suspense>
      )}
    </>
  );
}

export default App;
