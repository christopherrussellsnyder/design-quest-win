import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { logEnvironmentStatus } from "./utils/validateEnv";

// Validate environment variables on startup (dev only)
if (import.meta.env.DEV) {
  logEnvironmentStatus();
}

createRoot(document.getElementById("root")!).render(<App />);
