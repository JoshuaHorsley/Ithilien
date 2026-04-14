import { Container, Row, Col } from 'react-bootstrap'

export default function Calendar() {
    return (
        <Container className='py-4'>
            <h1 className='mb-4'>Watering Schedule</h1>

            <Row className='text-center fw-bold mb-2'>
                <Col>Sun</Col>
                <Col>Mon</Col>
                <Col>Tue</Col>
                <Col>Wed</Col>
                <Col>Thu</Col>
                <Col>Fri</Col>
                <Col>Sat</Col>
            </Row>
        </Container>
    )
}