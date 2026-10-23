import { useLocation, useNavigate, useParams } from "react-router-dom";

function withRouteProps(Component) {
  function ComponentWithRouteProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();
    return <Component {...props} router={{ location, navigate, params }} />;
  }

  return ComponentWithRouteProp;
}

export default withRouteProps;
