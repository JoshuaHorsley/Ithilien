import { Card, Dropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function PlantCard({ plant }) {
  return (
    <Card className='h-100 plant-card'>
      <div className='d-flex justify-content-end p-2'>
        <Dropdown>
          <Dropdown.Toggle variant='light' size='sm' id={`dropdown-${plant.id}`}>
            ⋮
          </Dropdown.Toggle>
          <Dropdown.Menu align='end'>
            <Dropdown.Item>Mark as Watered</Dropdown.Item>
            <Dropdown.Item>Edit Plant</Dropdown.Item>
            <Dropdown.Item className='text-danger'>Delete Plant</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <Card.Img variant='top' src={plant.image} alt={plant.nickname} />
      <Card.Body className='d-flex flex-column'>
        <Card.Title>{plant.nickname}</Card.Title>
        <Card.Text className='text-muted'>{plant.species}</Card.Text>
        <Link to={`/plants/${plant.id}`} className='btn btn-outline-success btn-sm mt-auto'>
          Plant Profile
        </Link>
      </Card.Body>
    </Card>
  )
}