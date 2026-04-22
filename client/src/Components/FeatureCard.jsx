import { Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function FeatureCard({ title, text, image, link, buttonLabel = 'Learn more' }) {
  return (
    <Card className="h-100 text-center p-3">
      {image && <Card.Img variant='top' src={image} alt={title}/>}
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{text}</Card.Text>
        <Button as={Link} to={link} variant='outline-success'>
          {buttonLabel}
        </Button>
      </Card.Body>
    </Card>
  )
}