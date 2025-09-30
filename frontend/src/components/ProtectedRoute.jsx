import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute()
{
    const {token} = useAuth()

    if(token)
    {
        return <Outlet />
    }

    return <Navigate to='/login' />
}

export default ProtectedRoute;