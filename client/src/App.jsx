import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import FallbackLoading from "./components/loader/FallbackLoading";
import { publicRoutes, privateRoutes } from "./routes.jsx";

import SignIn from "./pages/SignIn";

const App = () => {
  const userData = useSelector((state) => state.auth?.userData);
  const adminAccessToken = JSON.parse(
    localStorage.getItem("admin")
  )?.accessToken;

  return (
    <Suspense fallback={<FallbackLoading />}>
      <Routes>

        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        <Route
          path="/signin"
          element={userData ? <Navigate to="/" /> : <SignIn />}
        />
      </Routes>
    </Suspense>
  );
};

export default App;