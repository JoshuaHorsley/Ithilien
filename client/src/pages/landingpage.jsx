import { Link } from 'react-router-dom'
import { Container, Button, Row, Col } from 'react-bootstrap'
import FeatureCard from '../components/FeatureCard'
import heroBg from '../assets/heroSection.jpeg'
import trackImg from '../assets/track.jpeg'
import careImg from '../assets/care.jpeg'
import calendarImg from '../assets/calendar.jpeg'

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
            <Container className='py-5'>
                <Row className='g-4 justify-content-center'>
                    <Col md={4}>
                        <FeatureCard
                            title="Track Your Garden"
                            text="Keep all you plants organized in one place with care status and watering history"
                            image={trackImg}
                            link='#'
                        />
                    </Col>
                    <Col md={4}>
                        <FeatureCard
                            title="Get Reminders"
                            text="Never forget to water your plants again with smart, timely reminders"
                            image={careImg}
                            link='#'
                        />
                    </Col>
                    <Col md={4}>
                        <FeatureCard
                            title="Plan ahead"
                            text="View your watering schedule at a glance with a color-coded calendar"
                            image={calendarImg}
                            link='#'
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default LandingPage