import { useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import PlantCard from '../components/PlantCard'
import AddPlantCard from '../components/AddPlantCard'
import AddPlantModal from '../components/AddPlantModal'


export default function MyGarden() {
    const [showModal, setShowModal] = useState(false)
    // place holder data
    const plants = [
        { id: 1, nickname: 'Snake Plant', species: 'Dracaena trifasciata', image: 'https://placehold.co/400x300/f0f7f0/2e7d32?text=Snake+Plant' },
        { id: 2, nickname: 'Spider Plant', species: 'Chlorophytum comosum', image: 'https://placehold.co/400x300/f0f7f0/2e7d32?text=Spider+Plant' },
        { id: 3, nickname: 'Succulent', species: 'Echeveria elegans', image: 'https://placehold.co/400x300/f0f7f0/2e7d32?text=Succulent' },
    ]
    return (
        <Container className="py-4">
            <h2 className="mb-4" style={{ fontFamily: "'Cinzel', serif" }}>My Garden</h2>
            <Row className="g-4">
            
            {plants.map((plant) => (
                <Col md={4} key={plant.id}>
                <PlantCard plant={plant} />
                </Col>
            ))}
            <Col md={4}>
                <AddPlantCard onClick={() => setShowModal(true)} />
            </Col>
            </Row>
            <AddPlantModal show={showModal} onHide={() => setShowModal(false)} />
        </Container>
    )
}