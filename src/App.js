import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Creation from "./Views/CreatorView";
import Home from "./Views/Home";

export default function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/:creatorId" component={Creation} />
      </Switch>
    </Router>
  );
}
