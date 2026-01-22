import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { ensureCanvasRoundRectPolyfill } from "@/utils/canvasRoundRectPolyfill";

// Must run before any canvas rendering to avoid crashes on older iOS/WebViews.
ensureCanvasRoundRectPolyfill();

createRoot(document.getElementById("root")!).render(<App />);
