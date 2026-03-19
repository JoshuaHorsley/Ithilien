import { Link } from 'react-router-dom'
import { Container, Button } from 'react-bootstrap'
import heroBg from '../assets/heroSection.jpeg'

function LandingPage() {
    return (
        <div>
        <div className="hero-section text-center py-5"
        style={{ backgroundImage: `url(${heroBg})` }}
        >
            <Container>
            <div className='hero-content'>
                <h1 className="hero-title">All things will grow with joy</h1>
                <p className="hero-subtitle">
                    Your personal plant care companion. Track watering schedules, get reminders
                    and keep your plants thriving.
                </p>
                <Button as={Link} to="/register" variant="success" size="lg" className="mt-3">
                    Get Started
                </Button>
            </div>
            </Container>
        </div>
        </div>
    )
}

export default LandingPage