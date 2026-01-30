import App from "./App";
import { SettingsProvider } from "./hooks/useSettings";
import About from "./pages/About";
import ActorInfo from "./pages/ActorInfo";
import AdminDashboard from "./pages/Admin";
import Discover from "./pages/Discover";
import InfoPage from "./pages/Info";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import SearchPage from "./pages/Search";
import Settings from "./pages/Settings";
import SignUp from "./pages/SignUp";
import Watch from "./pages/Watch";
import WatchlistPage from "./pages/Watchlist";
// Styles
import "./styles/index.css";
import { HeroUIProvider } from "@heroui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const routes = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/actor/:id",
    element: <ActorInfo />,
  },
  {
    path: "/discover",
    element: <Discover />,
  },
  {
    path: "/info/:type/:id",
    element: <InfoPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/watch/:type/:id/:season?/:episode?",
    element: <Watch />,
  },
  {
    path: "/watchlist",
    element: <WatchlistPage />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
];

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <HeroUIProvider>
      <SettingsProvider>
        <main className="w-full h-full ">
          <RouterProvider router={router} />
        </main>
      </SettingsProvider>
    </HeroUIProvider>
  </React.StrictMode>
);
