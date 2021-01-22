import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import CreatorView from "./Views/CreatorView";
import CreationView from "./Views/CreationView";
import Home from "./Views/Home";
import CreateStatus from "./Views/CreateStatus";
import Profile from './Views/Profile';
import NotFound from "./Views/NotFound";

export default function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/profile/:creatorId" component={Profile} />
        <Route exact path="/:creatorId" component={CreatorView} />
        <Route exact path="/createStatus/:creatorId" component={CreateStatus} />
        <Route exact path="/creation/:creationId" component={CreationView} />
        <Route path="*"><NotFound /></Route>
      </Switch>
    </Router>
  );
}
