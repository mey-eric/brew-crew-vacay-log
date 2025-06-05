
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { BeerProvider } from "./contexts/BeerContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AlcoholTracking from "./pages/AlcoholTracking";
import BeerConsumption from "./pages/BeerConsumption";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <BeerProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/alcohol-tracking" element={<AlcoholTracking />} />
              <Route path="/beer-consumption" element={<BeerConsumption />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </BeerProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
