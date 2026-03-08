import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import Room from "@/pages/Room";
import { saasmaker } from "@/lib/saasmaker";
import "./index.css";

function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    saasmaker.analytics.track({ name: 'page_view', url: location.pathname }).catch(() => {});
  }, [location.pathname]);
  return null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PageViewTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/r/:slug" element={<Room />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </React.StrictMode>
);
