import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

export const WithRouter = (Component) => {
  const Wrapper = (props) => {
    const history = useNavigate();
    const location = useLocation();
    return <Component history={history} {...props} location={location} />;
  };
  return Wrapper;
};
