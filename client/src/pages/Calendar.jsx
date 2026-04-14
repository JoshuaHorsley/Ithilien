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
            <Row className='text-center mb-2'>
                <Col className='border p-3'>1</Col>
                <Col className='border p-3'>2</Col>
                <Col className='border p-3'>3</Col>
                <Col className='border p-3'>4</Col>
                <Col className='border p-3'>5</Col>
                <Col className='border p-3'>6</Col>
                <Col className='border p-3'>7</Col>
            </Row>
            <Row className='text-center mb-2'>
                <Col className='border p-3'>8</Col>
                <Col className='border p-3'>9</Col>
                <Col className='border p-3'>10</Col>
                <Col className='border p-3'>11</Col>
                <Col className='border p-3'>12</Col>
                <Col className='border p-3'>13</Col>
                <Col className='border p-3'>14</Col>
            </Row>
            <Row className='text-center mb-2'>
                <Col className='border p-3'>15</Col>
                <Col className='border p-3'>16</Col>
                <Col className='border p-3'>17</Col>
                <Col className='border p-3'>18</Col>
                <Col className='border p-3'>19</Col>
                <Col className='border p-3'>20</Col>
                <Col className='border p-3'>21</Col>
            </Row>
            <Row className='text-center mb-2'>
                <Col className='border p-3'>22</Col>
                <Col className='border p-3'>23</Col>
                <Col className='border p-3'>24</Col>
                <Col className='border p-3'>25</Col>
                <Col className='border p-3'>26</Col>
                <Col className='border p-3'>27</Col>
                <Col className='border p-3'>28</Col>
            </Row>
        </Container>
    )
}