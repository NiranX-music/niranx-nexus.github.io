import { Navigate, useLocation } from "react-router-dom";

/**
 * Redirects any /niranx/* path to the equivalent /* path,
 * ensuring both URL patterns work seamlessly.
 */
export default function NiranxRedirect() {
  const location = useLocation();
  const newPath = location.pathname.replace(/^\/niranx/, '') || '/';
  return <Navigate to={newPath + location.search + location.hash} replace />;
}
