import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = () => {
    const currentUser = useSelector((state) => state.auth.login.currentUser); 

    return currentUser !== null ? <Outlet/>:<Navigate to="/" replace/>;
};

export default ProtectedRoute;