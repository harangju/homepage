import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages";
import { Layout } from "./components";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="*"
            element={
              <main>
                <h1 className="text-3xl font-bold mb-6">Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <a href="/" className="link">← Back to Home</a>
              </main>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
