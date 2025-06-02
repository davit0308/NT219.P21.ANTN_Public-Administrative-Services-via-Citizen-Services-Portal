import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Home from './Components/Home/Home';
import IdentityCard from './Components/IdentityCard/IdentityCard';
import Passport from './Components/Passport/Passport';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/identitycard" element={<IdentityCard />} />
        <Route path="/passport" element={<Passport />} />
      </Routes>
    </Router>
  );
}

export default App;
