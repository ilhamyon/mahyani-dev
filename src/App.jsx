/* eslint-disable no-unused-vars */
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Register from './pages/Register'
import DataKegiatan from './pages/DataKegiatan'
import GISMap from './pages/GisMap'
import Header from './components/Header'
import ZKup from './pages/ZKup'

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/peta-sebaran" element={<GISMap />} />
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/" element={<Home />} />
        <Route path="/zkup" element={<ZKup />} />
      </Routes>
    </Router>
  )
}

export default App
