import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "./App";
import { AppContextProvider } from "./components/AppContext";
import { PhotoInfoProvider } from "./components/Body/PhotoInfo/PhotoInfoContext";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element '#root' not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <PhotoInfoProvider>
          <App />
        </PhotoInfoProvider>
      </AppContextProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
