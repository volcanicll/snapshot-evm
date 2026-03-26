import { createHashRouter } from "react-router-dom";
import App from "../App";
import { HomePage } from "../pages/home-page";

export const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
]);
