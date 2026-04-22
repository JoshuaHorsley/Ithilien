import { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { authClient } from '../lib/auth'
import PlantCard from '../components/PlantCard'
import AddPlantCard from '../components/AddPlantCard'
import AddPlantModal from '../components/AddPlantModal' 

export default function MyGarden() {
  const [showModal, setShowModal] = useState(false)
  const [plants, setPlants] = useState([])
  const { data: session } = authClient.useSession()

  // Fetch the user's plants from the database
  const fetchPlants = async () => {
    if (!session?.user?.id) return
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/plants`, {
        credentials: 'include',
      })
      const json = await res.json()
      setPlants(json.data || [])
    } catch (err) {
      console.error('Failed to fetch plants:', err)
    }
  }

  // Load plants when the user session is ready
  useEffect(() => {
    fetchPlants()
  }, [session?.user?.id])

  // When a new plant is added, refresh the list
  const handlePlantAdded = () => {
    fetchPlants()
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4" style={{ fontFamily: "'Cinzel', serif" }}>My Garden</h2>
      <Row className="g-4">
        {plants.map((plant) => (
          <Col md={4} key={plant.id}>
            <PlantCard plant={{
              id: plant.id,
              nickname: plant.nickname,
              species: plant.speciesName,
              //If the plant has an image, use the image API to get the image.
              //Otherwise, use the imageUrl from the Trefle API.
              image: plant.plantImageId
                ? `${import.meta.env.VITE_API_URL}/api/images/${plant.plantImageId}`
                : plant.imageUrl || 'https://placehold.co/400x300/f0f7f0/2e7d32?text=No+Photo',
              daysUntilWatering: plant.daysUntilWatering,
              
            }}
            onAction={fetchPlants}
            />
          </Col>
        ))}
        <Col md={4}>
          <AddPlantCard onClick={() => setShowModal(true)} />
        </Col>
      </Row>
      <AddPlantModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onPlantAdded={handlePlantAdded}
      />
    </Container>
  )
}