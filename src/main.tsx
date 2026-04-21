import React from "react";
import ReactDOM from "react-dom/client";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <div>BUILD TEST SUCCESS</div>
  </React.StrictMode>
);
