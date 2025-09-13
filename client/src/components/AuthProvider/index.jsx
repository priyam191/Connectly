"use client";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuthStatus } from '@/config/redux/action/authAction';

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check authentication status when component mounts
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return <>{children}</>;
}
