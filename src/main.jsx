import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";
import { SettingsProvider } from "./hooks/useSettings";
import Loading from "./components/Loading";
import Layout from "./components/Layout";
import "./styles/index.css";

// Lazy load pages
const App = lazy(() => import("./App"));
const About = lazy(() => import("./pages/About"));
const ActorInfo = lazy(() => import("./pages/ActorInfo"));
const AdminDashboard = lazy(() => import("./pages/Admin"));
const Discover = lazy(() => import("./pages/Discover"));
const InfoPage = lazy(() => import("./pages/Info"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SearchPage = lazy(() => import("./pages/Search"));
const Settings = lazy(() => import("./pages/Settings"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Watch = lazy(() => import("./pages/Watch"));
const WatchlistPage = lazy(() => import("./pages/Watchlist"));

const withSuspense = (Component) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

const routes = [
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: withSuspense(App),
      },
      {
        path: "/about",
        element: withSuspense(About),
      },
      {
        path: "/actor/:id",
        element: withSuspense(ActorInfo),
      },
      {
        path: "/discover",
        element: withSuspense(Discover),
      },
      {
        path: "/info/:type/:id",
        element: withSuspense(InfoPage),
      },
      {
        path: "/login",
        element: withSuspense(Login),
      },
      {
        path: "/search",
        element: withSuspense(SearchPage),
      },
      {
        path: "/settings",
        element: withSuspense(Settings),
      },
      {
        path: "/signup",
        element: withSuspense(SignUp),
      },
      {
        path: "/watch/:type/:id/:season?/:episode?",
        element: withSuspense(Watch),
      },
      {
        path: "/watchlist",
        element: withSuspense(WatchlistPage),
      },
      {
        path: "/admin",
        element: withSuspense(AdminDashboard),
      },
      {
        path: "*",
        element: withSuspense(NotFound),
      },
    ],
  },
];

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <HeroUIProvider>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </HeroUIProvider>
  </React.StrictMode>
);
