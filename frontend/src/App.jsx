import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/AppNavbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Artist from './pages/Artist.jsx'

function App() {
  return (
    <>
    <Router>
      <div className="min-h-screen
      bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-[#000000] via-[#150050] to-[#3f0071]">
        <AppNavbar />
        <div className="mx-auto p-4 min-h-[100vh]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artist/:artistID" element={<Artist />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
    </>
  );
}

export default App
