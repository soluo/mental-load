import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { MemberProvider } from "@/contexts/MemberContext";
import "./index.css";
import App from "@/App";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <BrowserRouter>
      <MemberProvider>
        <App />
      </MemberProvider>
    </BrowserRouter>
  </ConvexAuthProvider>,
);
