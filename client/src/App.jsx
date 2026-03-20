import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AppNavbar from './Components/Navbar'
import Footer from './components/Footer'
import Authpage from './pages/AuthpPage'

function App() {
  return (
    <>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/login" element={<Authpage />} />
        <Route path="/register" element={<Authpage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
