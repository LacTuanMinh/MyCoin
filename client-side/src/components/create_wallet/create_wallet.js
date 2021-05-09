import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

export default function CreateWallet({ isLoggedIn, setIsLoggedIn }) {
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