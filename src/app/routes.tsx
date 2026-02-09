import type { RouteObject } from "react-router-dom";
import App from "@/app/App";
import { labs } from "@/data/labs";
import LabPage from "@/pages/LabPage";
import LabsIndex from "@/pages/LabsIndex";
import NotFound from "@/pages/NotFound";

const labRoutes: RouteObject[] = labs.map((lab) => ({
  path: lab.slug,
  element: <LabPage lab={lab} />,
}));

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LabsIndex /> },
      ...labRoutes,
      { path: "*", element: <NotFound /> },
    ],
  },
];
