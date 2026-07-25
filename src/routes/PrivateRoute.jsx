import React from 'react';
import { Navigate } from 'react-router-dom';
import { StorageService } from '../services/storage';

export default function PrivateRoute({ children }) {
  return StorageService.getAdminAuth() ? children : <Navigate to="/admin" />;
}