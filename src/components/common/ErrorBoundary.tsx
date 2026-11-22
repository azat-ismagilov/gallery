import { Box, Button, Stack, Typography } from "@mui/material";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled gallery error:", error, info.componentStack);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#1A1A1A",
            color: "common.white",
            p: 3,
          }}
        >
          <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
            <Typography variant="h5">Something went wrong</Typography>
            <Typography variant="body2" sx={{ color: "grey.400" }}>
              An unexpected error occurred while rendering the gallery.
            </Typography>
            <Button variant="contained" onClick={this.handleReload}>
              Reload gallery
            </Button>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
