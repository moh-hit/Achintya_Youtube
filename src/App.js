import React, { useEffect } from "react";
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import CreatorView from "./Views/CreatorView";
// import CreationView from "./Views/CreationView";
import Home from "./Views/Home";
// import CreateStatus from "./Views/CreateStatus";
// import Profile from './Views/Profile';
// import NotFound from "./Views/NotFound";
import firebaseapp from 'firebase';

export default function App() {
  var loggedInUser = firebaseapp.auth().currentUser;

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          {loggedInUser ? <Redirect to={loggedInUser.uid} /> : <Home />}
        </Route>
        <Route exact path="/:creatorId" component={CreatorView} />
      </Switch>
    </Router>
  );
}
