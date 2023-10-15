import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Kontak from './components/Kontak';


class App extends React.Component {

  render() {
    return (
      <div className="container">
        <Router>
          <header className="mt-3">
            <nav className="px-3 navbar navbar-expand-lg navbar-primary bg-primary">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link text-white" href="/">Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/tentang">About Us</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/kontak">Contact</a>
                </li>
              </ul>
            </nav>
          </header>
          <div className="p-3 bg-light">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tentang" element={<About />} />
              <Route path="/kontak" element={<Kontak />} />
            </Routes>
          </div>
        </Router>
        <footer className="bg-primary">
          <p className="p-2 text-center text-white">Tugas 3 Pemrograman Web Lanjut- RB</p>
        </footer>
      </div>
    );
  }
}

export default App;
