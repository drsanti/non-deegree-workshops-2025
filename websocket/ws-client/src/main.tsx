import React from "react";
import ReactDOM from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./App.css";
//==============================================
// import App from "./App.tsx";
import Example from "./Example.tsx";
//==============================================

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme
      accentColor="violet"
      radius="medium"
      scaling="100%"
      appearance="dark"
    >
      <Example />
    </Theme>
  </React.StrictMode>
);
