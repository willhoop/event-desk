import { useEffect } from "react";
import { createHashRouter, Outlet, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import PresidencyDesk from "./pages/PresidencyDesk";
import PollingDesk from "./pages/PollingDesk";
import ElectoralDesk from "./pages/ElectoralDesk";
import StyleGuide from "./pages/StyleGuide";
import MidtermsDesk from "./pages/MidtermsDesk";
import PortfolioDesk from "./pages/PortfolioDesk";
import PollDataDesk from "./pages/PollDataDesk";
import SportsDesk from "./pages/SportsDesk";
import AdminDesk from "./pages/AdminDesk";

// Every desk opens at the masthead. Without this, hash routing keeps the
// previous scroll position and you land halfway down the article.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function Root() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

export const router = createHashRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "presidency", element: <PresidencyDesk /> },
      // The desk used to be one candidate. Keep the old link alive.
      { path: "ossoff", element: <Navigate to="/presidency" replace /> },
      { path: "polling", element: <PollingDesk /> },
      { path: "polls-data", element: <PollDataDesk /> },
      { path: "electoral", element: <ElectoralDesk /> },
      { path: "midterms", element: <MidtermsDesk /> },
      { path: "sports", element: <SportsDesk /> },
      { path: "sizing", element: <PortfolioDesk /> },
      { path: "style", element: <StyleGuide /> },
      { path: "admin", element: <AdminDesk /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
