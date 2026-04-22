import { Container, Button } from 'react-bootstrap'
import { authClient } from '../lib/auth'
import { useState, useEffect } from 'react'
import './Calendar.css'


const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]



/*
 * FUNCTION: getDaysInMonth
 * PARAMETERS: month - the month number (1-12)
 *             year  - the four-digit year
 * RETURNS: The number of days in that month
 * DESCRIPTION: Passing day 0 of the next month returns the last day of the
 *              current month, giving us the total day count.
 */
function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate()
}


/*
 * FUNCTION: getFirstDayOfMonth
 * PARAMETERS: month - the month number (1-12)
 *             year  - the four-digit year
 * RETURNS: The day of week (0=Sun, 6=Sat) the first of the month falls on
 * DESCRIPTION: Used to calculate how many empty cells to render before day 1.
 */
function getFirstDayOfMonth(month, year) {
    return new Date(year, month - 1, 1).getDay()
}




/*
* FUNCTION: Calendar
* PARAMETERS: None
* RETURNS: JSX element representing the calendar page
* DESCRIPTION: Displays a monthly calendar view of the user's watering schedule. Fetches events from the API and allows navigation between months. 
*               Each day cell shows the date and any watering events as coloured pills, with a legend explaining the status colours. 
*/
export default function Calendar() {

    const { data: session } = authClient.useSession()

    // Start on the current month and year
    const today = new Date()
    const [month, setMonth] = useState(today.getMonth() + 1)
    const [year, setYear] = useState(today.getFullYear())

    // Watering events returned from the API for the displayed month
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')


    /*
     * EFFECT: fetchCalendarEvents
     * DESCRIPTION: Calls GET /api/calendar whenever the month, year, or user session
     *              changes. Depends on primitive values to avoid re-running on every render.
     */
    useEffect(() => {

        if (!session?.user?.id) {
            return
        }

        const fetchEvents = async () => {

            setLoading(true)
            setError('')

            try {

                const res = await fetch(
                    `http://localhost:3003/api/calendar?userId=${session.user.id}&month=${month}&year=${year}`,
                    { credentials: 'include' }
                )

                const json = await res.json()

                if (res.ok) {
                    setEvents(json.data || [])
                } else {
                    setError(json.error || 'Failed to load calendar')
                }

            } catch (err) {
                console.error('Calendar fetch error:', err)
                setError('Something went wrong loading the calendar')
            } finally {
                setLoading(false)
            }

        }

        fetchEvents()

    }, [month, year, session?.user?.id])


    /*
     * FUNCTION: handlePrevMonth
     * DESCRIPTION: Moves the calendar back one month, wrapping Dec -> Jan of previous year.
     */
    const handlePrevMonth = () => {
        if (month === 1) {
            setMonth(12)
            setYear(year - 1)
        } else {
            setMonth(month - 1)
        }
    }


    /*
     * FUNCTION: handleNextMonth
     * DESCRIPTION: Moves the calendar forward one month, wrapping Dec -> Jan of next year.
     */
    const handleNextMonth = () => {
        if (month === 12) {
            setMonth(1)
            setYear(year + 1)
        } else {
            setMonth(month + 1)
        }
    }


    /*
     * FUNCTION: getEventsForDay
     * PARAMETERS: day - the day number (1-31)
     * RETURNS: Array of event objects that fall on that day
     * DESCRIPTION: Builds a YYYY-MM-DD date string for the given day and filters
     *              the events array to find all matching entries.
     */
    const getEventsForDay = (day) => {
        const monthStr = String(month).padStart(2, '0')
        const dayStr = String(day).padStart(2, '0')
        const dateString = `${year}-${monthStr}-${dayStr}`
        return events.filter((event) => event.date === dateString)
    }


    // Build the flat array of cells: null for empty leading/trailing cells, number for days
    const daysInMonth = getDaysInMonth(month, year)
    const firstDay = getFirstDayOfMonth(month, year)

    const cells = []

    for (let i = 0; i < firstDay; i++) {
        cells.push(null)
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(d)
    }
    while (cells.length % 7 !== 0) {
        cells.push(null)
    }

    // Split into rows of 7 to match the grid structure
    const rows = []
    for (let i = 0; i < cells.length; i += 7) {
        rows.push(cells.slice(i, i + 7))
    }


    return (
        <Container fluid className='calendar-page'>
            <div className='calendar-header'>
                <h1 className='calendar-title'>Watering Schedule</h1>

                <div className='calendar-month-nav'>
                    <Button variant='light' className='calendar-nav-btn' onClick={handlePrevMonth}>
                        {'<'}
                    </Button>
                    <h4 className='calendar-month mb-0'>
                        {MONTH_NAMES[month - 1]} {year}
                    </h4>
                    <Button variant='light' className='calendar-nav-btn' onClick={handleNextMonth}>
                        {'>'}
                    </Button>
                </div>
            </div>

            {loading && (
                <p className='text-center text-muted mt-3'>Loading schedule...</p>
            )}

            {error && (
                <p className='text-center text-danger mt-3'>{error}</p>
            )}

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

                    {/* Dynamic rows for the calendar grid */}
                    {rows.map((row, rowIndex) => (
                        <div className='calendar-row' key={rowIndex}>
                            {row.map((day, colIndex) => {

                                const dayEvents = day ? getEventsForDay(day) : []

                                return (
                                    <div className='calendar-cell' key={colIndex}>

                                        {/* Day number */}
                                        {day && (
                                            <span className='calendar-day-number'>{day}</span>
                                        )}

                                        {/* Coloured pill for each watering event on this day */}
                                        {dayEvents.map((event, eventIndex) => (
                                            <div
                                                key={eventIndex}
                                                className={`calendar-event calendar-event-${event.status}`}
                                                title={`${event.nickname} — ${event.status}`}
                                            >
                                                {event.nickname}
                                            </div>
                                        ))}

                                    </div>
                                )

                            })}
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