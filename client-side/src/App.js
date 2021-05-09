import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CreateWallet from './components/create_wallet/create_wallet';
import AccessWallet from './components/access_wallet/access_wallet';
import DashBoard from './components/dashboard/dashboard';
import Navbar from './components/navbar/navbar';
import { useState } from 'react';
import Home from './components/home/Home';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <Router>
      <div className="App">
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <Switch>
          <Route path='/' exact>
            <Home isLoggedIn={isLoggedIn} />
          </Route>
          <Route path='/createWallet'>
            <CreateWallet isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          </Route>
          <Route path='/accessWallet'>
            <AccessWallet isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          </Route>
          <Route path='/dashboard'>
            <DashBoard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
