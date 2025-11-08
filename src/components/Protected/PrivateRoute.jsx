import { Navigate } from "react-router-dom";
import useStore from "../../zustand/store";

function PrivateRoute({ children }) {
  const user = useStore(state => state.user);
  if (!user?.id) return <Navigate to="/login" />;
  return children;
}

export default PrivateRoute;

