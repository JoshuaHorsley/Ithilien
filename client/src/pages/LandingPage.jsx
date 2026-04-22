import { Link } from 'react-router-dom'
import { Container, Button, Row, Col } from 'react-bootstrap'
import FeatureCard from '../Components/FeatureCard'
import { authClient } from '../lib/auth'
import heroBg from '../assets/heroSection.jpeg'
import trackImg from '../assets/track.jpeg'
import careImg from '../assets/care.jpeg'
import calendarImg from '../assets/calendar.jpeg'

function LandingPage() {
    const { data: session } = authClient.useSession()
    const ctaTarget = session ? '/garden' : '/register'

    return (
        <div>
            <div className="hero-section text-center py-5"
            style={{ backgroundImage: `url(${heroBg})` }}
            >
                <Container>
                <div className='hero-content'>
                    <h1 className="hero-title">All Things Will Grow With Joy</h1>
                    <p className="hero-subtitle">
                        Ithilien is your personal plant care companion. Track watering schedules, get reminders
                        and keep your plants thriving.
                    </p>
                    <Button as={Link} to={ctaTarget} variant="success" size="lg" className="mt-3">
                        {session ? 'Go to My Garden' : 'Get Started'}
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
                            link={ctaTarget}
                            buttonLabel='Start Tracking'
                        />
                    </Col>
                    <Col md={4}>
                        <FeatureCard
                            title="Get Reminders"
                            text="Never forget to water your plants again with smart, timely reminders"
                            image={careImg}
                            link={ctaTarget}
                            buttonLabel='Enable Reminders'
                        />
                    </Col>
                    <Col md={4}>
                        <FeatureCard
                            title="Plan ahead"
                            text="View your watering schedule at a glance with a color-coded calendar"
                            image={calendarImg}
                            link={ctaTarget}
                            buttonLabel='Plan Your Care'
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default LandingPage