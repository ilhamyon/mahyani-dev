/* eslint-disable no-unused-vars */
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import GISMap from './pages/GisMap'
import Header from './components/Header'
import ZKup from './pages/ZKup'
import Dashboard from './pages/Dashboard'
import Verifikasi from './pages/Verifikasi'
import ManajemenUser from './pages/ManajemenUser'

function AppContent() {
  const location = useLocation();
  const hideHeader = location.pathname === '/login'; // sembunyikan header di /login

  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/peta-sebaran" element={<GISMap />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/mahyani" element={<Home />} />
        <Route path="/zkup" element={<ZKup />} />
        <Route path="/verifikasi" element={<Verifikasi />} />
        <Route path="/manajemen-user" element={<ManajemenUser />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App;
