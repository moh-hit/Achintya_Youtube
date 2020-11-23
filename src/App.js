import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import CreatorView from "./Views/CreatorView";
import CreationView from "./Views/CreationView";
import Home from "./Views/Home";

export default function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/:creatorId" component={CreatorView} />
        <Route exact path="/creation/:creationId" component={CreationView} />
      </Switch>
    </Router>
  );
}
