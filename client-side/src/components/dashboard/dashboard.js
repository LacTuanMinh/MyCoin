import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

export default function DashBoard({ isLoggedIn, setIsLoggedIn }) {

  const history = useHistory();

  useEffect(() => {
    if (!isLoggedIn) {
      history.push('/accessWallet');
    }
  }, [isLoggedIn]);

  return (
    <div>

    </div>
  );
}