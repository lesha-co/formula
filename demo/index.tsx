import React from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  return <span>hello</span>;
};

const _root = document.getElementById("root");
if (_root) createRoot(_root).render(<App />);
