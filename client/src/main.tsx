import { createRoot } from "react-dom/client";
import "@fontsource-variable/karla";
import "@fontsource-variable/karla/wght-italic.css";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/playfair-display/wght-italic.css";
import App from "./App.tsx";
import "./index.css";
import { loadIconFont } from "./utils/icons.ts";

createRoot(document.getElementById("root")!).render(<App />);

// Non-blocking: icons appear when the tiny icon subset has loaded.
loadIconFont();
