import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setAuthTokenGetter } from './apiClient';

export const Auth0TokenBridge = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      setAuthTokenGetter(async () => {
        try {
          return await getAccessTokenSilently();
        } catch (error) {
          return undefined;
        }
      });
    } else {
      setAuthTokenGetter(async () => undefined);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return <>{children}</>;
};

export default Auth0TokenBridge;
