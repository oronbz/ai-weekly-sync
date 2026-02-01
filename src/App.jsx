import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import ViewSync from "./pages/ViewSync";
import Editor from "./pages/Editor";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-logo">
          <span className="app-logo-icon">🤖</span>
          <span>AI Weekly Sync</span>
        </Link>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sync/:id" element={<ViewSync />} />
          <Route path="/create" element={<Editor />} />
          <Route path="/edit/:id" element={<Editor />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
