import { Routes, Route } from 'react-router-dom'
import { authClient } from './lib/auth'
import AppNavbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import MyGarden from './pages/MyGarden'
import Calendar from './pages/Calendar'
import PlantProfile from './pages/PlantProfile'

function App() {
  const { data: session } = authClient.useSession()
  const isLoggedIn = !!session

  return (
    <>
      <AppNavbar isLoggedIn={isLoggedIn} session={session} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/garden" element={<MyGarden />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/plants/:id" element={<PlantProfile />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App