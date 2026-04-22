import { useEffect, useState } from 'react'
import { Container, Button } from 'react-bootstrap'
import './Calendar.css'

export default function Calendar() {
    const today = new Date()

    const [month, setMonth] = useState(today.getMonth() + 1)
    const [year, setYear] = useState(today.getFullYear())
    const [calendarData, setCalendarData] = useState(null)

    useEffect(() => {
        fetch(`http://localhost:3003/api/calendar?year=${year}&month=${month}`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                console.log('Calendar API:', data)
                setCalendarData(data)
            })
    }, [year, month])

    function handlePreviousMonth() {
        if (month === 1) {
            setMonth(12)
            setYear(year - 1)
        } else {
            setMonth(month - 1)
        }
    }

    function handleNextMonth() {
        if (month === 12) {
            setMonth(1)
            setYear(year + 1)
        } else {
            setMonth(month + 1)
        }
    }

    const monthName =
        calendarData &&
        new Date(calendarData.data.year, calendarData.data.month - 1).toLocaleString('en-US', {
            month: 'long'
        })

    const daysInMonth = new Date(year, month, 0).getDate()

    const days = []
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
    }

    const firstDayOfMonth = new Date(year, month - 1, 1).getDay()

    const allCells = []

    for (let i = 0; i < firstDayOfMonth; i++) {
        allCells.push('')
    }

    for (let i = 0; i < days.length; i++) {
        allCells.push(days[i])
    }

    const totalCalendarCells = Math.ceil(allCells.length / 7) * 7

    while (allCells.length < totalCalendarCells) {
        allCells.push('')
    }

    const weeks = []

    for (let i = 0; i < allCells.length; i += 7) {
        weeks.push(allCells.slice(i, i + 7))
    }

    function getEventsForDay(day) {
        if (!calendarData) return []

        return calendarData.data.events.filter(event => event.day === day)
    }

    return (
        <Container fluid className='calendar-page'>
            <div className='calendar-header'>
                <h1 className='calendar-title'>Watering Schedule</h1>

                <div className='calendar-month-nav'>
                    <Button
                        variant='light'
                        className='calendar-nav-btn'
                        onClick={handlePreviousMonth}
                    >
                        {'<'}
                    </Button>

                    <h4 className='calendar-month mb-0'>
                        {calendarData ? `${monthName} ${calendarData.data.year}` : ''}
                    </h4>

                    <Button
                        variant='light'
                        className='calendar-nav-btn'
                        onClick={handleNextMonth}
                    >
                        {'>'}
                    </Button>
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

                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className='calendar-row'>
                            {week.map((day, dayIndex) => (
                                <div key={dayIndex} className='calendar-cell'>
                                    {day}

                                    {day !== '' &&
                                        getEventsForDay(day).map((event, index) => (
                                            <div key={index}>
                                                {event.plantName}
                                            </div>
                                        ))}
                                </div>
                            ))}
                        </div>
                    ))}
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