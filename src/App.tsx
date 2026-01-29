import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ShopScreen } from "./components/ShopScreen";
import { InfoScreen } from "./components/InfoScreen";
import { EquipmentPanel } from "./components/EquipmentPanel";
import { ShipSelector } from "./components/ShipSelector";
import { BestiaryScreen } from "./components/BestiaryScreen";
import { ArenaScreen } from "./components/ArenaScreen";
import { MusicProvider } from "./contexts/MusicContext";
import { initializeNativeServices } from "./services/nativeServices";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initializeNativeServices().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MusicProvider>
          <Toaster />
          <Sonner />
          {/* HashRouter is the safest choice for native (file://) environments */}
          <HashRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<ShopScreen />} />
              <Route path="/info" element={<InfoScreen />} />
              <Route path="/equipment" element={<EquipmentPanel />} />
              <Route path="/ships" element={<ShipSelector />} />
              <Route path="/bestiary" element={<BestiaryScreen />} />
              <Route path="/arena" element={<ArenaScreen onBack={() => window.history.back()} />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </MusicProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
