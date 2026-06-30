import { Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import Home from "./pages/Home";
import BoardList from "./pages/BoardList";
import PostDetail from "./pages/PostDetail";
import Write from "./pages/Write";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import Report from "./pages/Report";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, width: "100%" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<BoardList />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/write" element={<Write />} />
          <Route path="/search" element={<Search />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/report/:id" element={<Report />} />
        </Routes>
      </main>
    </div>
  );
}
