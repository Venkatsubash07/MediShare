import { seedFirestore } from "@/lib/seedFirestore";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/index.css"; // adjust if your css file name is different

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
