import { Routes, Route } from 'react-router-dom'
import { authClient } from './lib/auth'
import AppNavbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import MyGarden from './pages/MyGarden'
import Calendar from './pages/Calendar'
import PlantProfile from './pages/PlantProfile'
import Settings from './pages/Settings'
import { useState, useEffect } from 'react'

function App()
{

    const { data: session } = authClient.useSession()
    const isLoggedIn = !!session

    // Holds the number of plants that need watering today or are overdue
    const [reminderCount, setReminderCount] = useState(0)



    /*
     * EFFECT: fetchRemindersOnLogin
     * DESCRIPTION: Runs fetchReminderCount whenever the user session changes.
     *              Depends on session?.user?.id (a string) to avoid re-running
     *              on every render due to object reference changes.
     */
    useEffect(() => {

        if (!session?.user?.id)
        {

            return

        }

        const fetchReminderCount = async () =>
        {

            try
            {

                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/reminders?userId=${session.user.id}`,
                    { credentials: 'include' }

                )

                const json = await res.json()

                if (res.ok)
                {

                    setReminderCount(json.count || 0)

                }

            } catch (err)
            {

                console.error('Failed to fetch reminder count:', err)

            }
        }

        fetchReminderCount()

    }, [session?.user?.id])




  return (
    <>
      <AppNavbar isLoggedIn={isLoggedIn} session={session} reminderCount={reminderCount} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/garden" element={<MyGarden />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />} />
        <Route path="/plants/:id" element={<PlantProfile />} />
      </Routes>
      <Footer />
      </>

    )

}

export default App