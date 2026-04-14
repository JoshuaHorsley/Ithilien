import { Container, Row, Col, Button } from 'react-bootstrap'
import './Calendar.css'

export default function Calendar() {
    return (
        <Container className='calendar-page py-4'>
            <h1 className='calendar-title'>Watering Schedule</h1>

            <Row className='align-items-center mb-4 calendar-month-row'>
                <Col xs="auto">
                    <Button variant="light">{'<'}</Button>
                </Col>

                <Col className='text-center'>
                    <h4 className='mb-0'>February 2026</h4>
                </Col>

                <Col xs="auto">
                    <Button variant="light">{'>'}</Button>
                </Col>
            </Row>

            <Row className='text-center fw-bold mb-2'>
                <Col>Sun</Col>
                <Col>Mon</Col>
                <Col>Tue</Col>
                <Col>Wed</Col>
                <Col>Thu</Col>
                <Col>Fri</Col>
                <Col>Sat</Col>
            </Row>

            <Row className='text-center mb-2'>
                <Col className='calendar-cell'>1</Col>
                <Col className='calendar-cell'>2</Col>
                <Col className='calendar-cell'>3</Col>
                <Col className='calendar-cell'>4</Col>
                <Col className='calendar-cell'>5</Col>
                <Col className='calendar-cell'>6</Col>
                <Col className='calendar-cell'>7</Col>
            </Row>

            <Row className='text-center mb-2'>
                <Col className='calendar-cell'>8</Col>
                <Col className='calendar-cell'>9</Col>
                <Col className='calendar-cell'>10</Col>
                <Col className='calendar-cell'>11</Col>
                <Col className='calendar-cell'>12</Col>
                <Col className='calendar-cell'>13</Col>
                <Col className='calendar-cell'>14</Col>
            </Row>

            <Row className='text-center mb-2'>
                <Col className='calendar-cell'>15</Col>
                <Col className='calendar-cell'>16</Col>
                <Col className='calendar-cell'>17</Col>
                <Col className='calendar-cell'>18</Col>
                <Col className='calendar-cell'>19</Col>
                <Col className='calendar-cell'>20</Col>
                <Col className='calendar-cell'>21</Col>
            </Row>

            <Row className='text-center mb-2'>
                <Col className='calendar-cell'>22</Col>
                <Col className='calendar-cell'>23</Col>
                <Col className='calendar-cell'>24</Col>
                <Col className='calendar-cell'>25</Col>
                <Col className='calendar-cell'>26</Col>
                <Col className='calendar-cell'>27</Col>
                <Col className='calendar-cell'>28</Col>
            </Row>

            <Row className='text-center mb-2'>
                <Col className='calendar-cell'>29</Col>
                <Col className='calendar-cell'>30</Col>
                <Col className='calendar-cell'>31</Col>
                <Col className='calendar-cell'></Col>
                <Col className='calendar-cell'></Col>
                <Col className='calendar-cell'></Col>
                <Col className='calendar-cell'></Col>
            </Row>
        </Container>
    )
}