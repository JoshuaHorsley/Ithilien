import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/landingpage'
import AppNavbar from './Components/Navbar'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<LandingPage/>} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
