import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Env validation disabled to prevent potential SSR/build issues
// import { logEnvironmentStatus } from "./utils/validateEnv";
// if (import.meta.env.DEV) {
//   logEnvironmentStatus();
// }

createRoot(document.getElementById("root")!).render(<App />);
