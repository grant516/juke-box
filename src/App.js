import './App.css';
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import Home from './pages/Home';
import Join from './pages/Join';
import Host from './pages/Host';

function App() {
  return (
  <Router>
    
    <nav>
      <Link to="/Join"> Join </Link>
      <Link to="/Host"> Host </Link>

      {/*We don't actually need Home, but we will have it for now.*/}
      <Link to="/"> Home </Link>
    </nav>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Join" element={<Join />} />
      <Route path="/host" element={<Host />} />
    </Routes>
  </Router>
  );
}

export default App;
