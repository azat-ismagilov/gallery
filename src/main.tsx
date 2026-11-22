import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "@/App";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { AppContextProvider } from "@/context/AppContext";
import { PhotoInfoProvider } from "@/context/PhotoInfoContext";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element '#root' not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppContextProvider>
          <PhotoInfoProvider>
            <App />
          </PhotoInfoProvider>
        </AppContextProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
