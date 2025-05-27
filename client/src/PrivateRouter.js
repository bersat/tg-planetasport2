// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Component, ...rest }) => {
    const token = localStorage.getItem('auth_token');
    const userRole = token ? JSON.parse(atob(token.split('.')[1])).role : null;

    // Если пользователь не авторизован или не администратор, перенаправляем на страницу входа
    return token && userRole === 'admin' ? Component : <Navigate to="/login" />;
};

export default PrivateRoute;
