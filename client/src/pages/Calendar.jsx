import { useEffect, useState } from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import './Calendar.css'

export default function Calendar() {
    const [calendarData, setCalendarData] = useState(null)

    useEffect(() => {
        fetch('http://localhost:3003/api/calendar', {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                console.log('Calendar API:', data)
                setCalendarData(data)
            })
            .catch(err => {
                console.error('Calendar fetch error:', err)
            })
    }, [])

    return (
        <Container fluid className='calendar-page'>
            <div className='calendar-header'>
                <h1 className='calendar-title'>Watering Schedule</h1>

                <div className='calendar-month-nav'>
                    <Button variant='light' className='calendar-nav-btn'>{'<'}</Button>
                    <h4 className='calendar-month mb-0'>
                        {calendarData
                            ? `${new Date(calendarData.data.year, calendarData.data.month - 1).toLocaleString('en-US', { month: 'long' })} ${calendarData.data.year}`
                            : 'Loading...'}
                    </h4>
                    <Button variant='light' className='calendar-nav-btn'>{'>'}</Button>
                </div>
            </div>

            <div className='calendar-grid-wrapper'>
                <div className='calendar-table'>
                    <div className='calendar-weekdays'>
                        <div>Sun</div>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                    </div>

                    <div className='calendar-row'>
                        <div className='calendar-cell'>1</div>
                        <div className='calendar-cell'>2</div>
                        <div className='calendar-cell'>3</div>
                        <div className='calendar-cell'>4</div>
                        <div className='calendar-cell'>5</div>
                        <div className='calendar-cell'>6</div>
                        <div className='calendar-cell'>7</div>
                    </div>

                    <div className='calendar-row'>
                        <div className='calendar-cell'>8</div>
                        <div className='calendar-cell'>9</div>
                        <div className='calendar-cell'>10</div>
                        <div className='calendar-cell'>11</div>
                        <div className='calendar-cell'>12</div>
                        <div className='calendar-cell'>13</div>
                        <div className='calendar-cell'>14</div>
                    </div>

                    <div className='calendar-row'>
                        <div className='calendar-cell'>15</div>
                        <div className='calendar-cell'>16</div>
                        <div className='calendar-cell'>17</div>
                        <div className='calendar-cell'>18</div>
                        <div className='calendar-cell'>19</div>
                        <div className='calendar-cell'>20</div>
                        <div className='calendar-cell'>21</div>
                    </div>

                    <div className='calendar-row'>
                        <div className='calendar-cell'>22</div>
                        <div className='calendar-cell'>23</div>
                        <div className='calendar-cell'>24</div>
                        <div className='calendar-cell'>25</div>
                        <div className='calendar-cell'>26</div>
                        <div className='calendar-cell'>27</div>
                        <div className='calendar-cell'>28</div>
                    </div>

                    <div className='calendar-row'>
                        <div className='calendar-cell'>29</div>
                        <div className='calendar-cell'>30</div>
                        <div className='calendar-cell'>31</div>
                        <div className='calendar-cell'></div>
                        <div className='calendar-cell'></div>
                        <div className='calendar-cell'></div>
                        <div className='calendar-cell'></div>
                    </div>
                </div>

                <div className='calendar-legend'>
                    <div className='calendar-legend-item'>
                        <span className='calendar-legend-color scheduled'></span>
                        <span>Scheduled watering</span>
                    </div>

                    <div className='calendar-legend-item'>
                        <span className='calendar-legend-color completed'></span>
                        <span>Completed</span>
                    </div>

                    <div className='calendar-legend-item'>
                        <span className='calendar-legend-color overdue'></span>
                        <span>Overdue</span>
                    </div>
                </div>
            </div>
        </Container>
    )
}