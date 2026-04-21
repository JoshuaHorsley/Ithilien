/*
 * FILE: PlantCard.jsx
 * DESCRIPTION: Displays a single plant as a card in the My Garden grid. Shows the
 *              plant photo, nickname, species, a colour-coded care status badge, and
 *              quick action buttons.
 */

import { Card, Dropdown, Badge } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'

const API = 'http://localhost:3003/api'

/*
 * FUNCTION: getCareStatus
 * PARAMETERS: daysUntilWatering - number of days until watering is needed, or null
 * RETURNS: An object with a label string and a Bootstrap variant string for the badge
 * DESCRIPTION: Converts the daysUntilWatering number into a human-readable status
 *              label and a colour. Negative means overdue, 0 means due today,
 *              positive means upcoming. Null means no watering data is available.
 */
function getCareStatus(daysUntilWatering) {

    if (daysUntilWatering === null || daysUntilWatering === undefined) {
        return { label: 'No schedule', variant: 'secondary' }
    }

    if (daysUntilWatering < 0) {
        return { label: 'Overdue', variant: 'danger' }
    }

    if (daysUntilWatering === 0) {
        return { label: 'Water today', variant: 'warning' }
    }

    if (daysUntilWatering === 1) {
        return { label: 'Water tomorrow', variant: 'warning' }
    }

    if (daysUntilWatering <= 7) {
        return { label: `Water in ${daysUntilWatering} days`, variant: 'info' }
    }

    return { label: `Water in ${daysUntilWatering} days`, variant: 'success' }

}



/*
 * FUNCTION: PlantCard
 * PARAMETERS: plant    - an object containing plant data (id, nickname, species, image, daysUntilWatering)
 *             onAction - callback invoked after a quick action so the parent can refresh the list
 * RETURNS: A React component that renders a card with the plant's information and care status
 * DESCRIPTION: Displays the plant's photo, nickname, species, and a badge indicating how soon it needs watering.
 */
export default function PlantCard({ plant, onAction }) {

  const careStatus = getCareStatus(plant.daysUntilWatering)
  const navigate = useNavigate()

  const handleWater = async () => {
    try {
      await fetch(`${API}/plants/${plant.id}/water`, { method: 'POST', credentials: 'include' })
      if (onAction) onAction()
    } catch (err) {
      console.error('Water error:', err)
    }
  }

  const handleEdit = () => {
    navigate(`/plants/${plant.id}`)
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${plant.nickname}"? This cannot be undone.`)) return
    try {
      await fetch(`${API}/plants/${plant.id}`, { method: 'DELETE', credentials: 'include' })
      if (onAction) onAction()
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  return (
      <Card className='h-100 plant-card'>

      <div className='d-flex justify-content-end p-2'>
        <Dropdown>
          <Dropdown.Toggle variant='light' size='sm' id={`dropdown-${plant.id}`}>
            ⋮
          </Dropdown.Toggle>
          <Dropdown.Menu align='end'>
            <Dropdown.Item onClick={handleWater}>Mark as Watered</Dropdown.Item>
            <Dropdown.Item onClick={handleEdit}>Edit Plant</Dropdown.Item>
            <Dropdown.Item className='text-danger' onClick={handleDelete}>Delete Plant</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <Card.Img variant='top' src={plant.image} alt={plant.nickname} />
      <Card.Body className='d-flex flex-column'>
        <Card.Title>{plant.nickname}</Card.Title>
        <Card.Text className='text-muted'>{plant.species}</Card.Text>
              <div className='mb-3'>
                  <Badge bg={careStatus.variant}>
                      {careStatus.label}
                  </Badge>
              </div>
        <Link to={`/plants/${plant.id}`} className='btn btn-outline-success btn-sm mt-auto'>
          Plant Profile
        </Link>
      </Card.Body>
    </Card>
  )
}