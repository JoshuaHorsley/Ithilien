import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import AppNavbar from './Components/Navbar'
import Footer from './components/Footer'
import Authpage from './pages/AuthpPage'
import MyGarden from './pages/MyGarden'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  
  return (
    <>
      <AppNavbar isLoggedIn={isLoggedIn}/>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/login" element={<Authpage />} />
        <Route path="/register" element={<Authpage />} />
        <Route path="/garden" element={<MyGarden />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
