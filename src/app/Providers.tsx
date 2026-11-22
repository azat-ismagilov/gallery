import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { BrowserRouter } from "react-router";

import theme from "@/app/theme";
import { AppContextProvider } from "@/features/gallery/state/AppContext";
import { PhotoInfoProvider } from "@/features/viewer/state/PhotoInfoContext";
import ErrorBoundary from "@/shared/components/ErrorBoundary";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppContextProvider>
            <PhotoInfoProvider>{children}</PhotoInfoProvider>
          </AppContextProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
