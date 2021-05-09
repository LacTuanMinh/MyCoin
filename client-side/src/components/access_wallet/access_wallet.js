import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

export default function AccessWallet({ isLoggedIn, setIsLoggedIn }) {
  const history = useHistory();

  useEffect(() => {
    if (isLoggedIn) {
      history.push('/dashboard');
    }
  }, [isLoggedIn]);

  return (
    <div>

    </div>
  );
}