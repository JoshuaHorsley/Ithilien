import { useState, useEffect } from 'react'
import { Modal, Form, Button, ListGroup, Image, Spinner } from 'react-bootstrap'
import { authClient } from '../lib/auth'

export default function AddPlantModal({ show, onHide, onPlantAdded }) {
  const [nickname, setNickname] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [searching, setSearching] = useState(false)

  const { data: session } = authClient.useSession()

  // Search Trefle via our backend whenever the user types
  // Uses a 300ms debounce so we don't fire a request on every keystroke
  useEffect(() => {
    if (query.length < 2 || selectedPlant) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`http://localhost:3003/api/species/search?q=${encodeURIComponent(query)}`)
        const json = await res.json()
        setResults(json.data || [])
      } catch (err) {
        console.error('Search failed:', err)
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, selectedPlant])

  // When a user picks a plant from the dropdown
  const handleSelect = (plant) => {
    setSelectedPlant(plant)
    setQuery(plant.commonName !== 'Unknown' ? plant.commonName : plant.scientificName)
    setResults([])
  }

  // Let the user clear their selection and search again
  const handleClearSelection = () => {
    setSelectedPlant(null)
    setQuery('')
  }

  // Reset everything when the modal closes
  const handleClose = () => {
    setNickname('')
    setQuery('')
    setResults([])
    setSelectedPlant(null)
    onHide()
  }

  // Save the plant to the database
  const handleSubmit = async () => {
    if (!selectedPlant || !nickname.trim() || !session?.user?.id) return

    try {
      const res = await fetch('http://localhost:3003/api/species/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nickname: nickname.trim(),
          slug: selectedPlant.slug,
          userId: session.user.id,
        }),
      })

      const json = await res.json()

      if (res.ok) {
        if (onPlantAdded) onPlantAdded(json.data)
        handleClose()
      } else {
        console.error('Failed to add plant:', json.error)
        alert('Failed to add plant. Please try again.')
      }
    } catch (err) {
      console.error('Add plant error:', err)
      alert('Something went wrong. Please try again.')
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontFamily: "'Cinzel', serif" }}>Add New Plant</Modal.Title>
      </Modal.Header>
      <Modal.Body>

        {/* Photo upload */}
        <Form.Group className='mb-3 text-center'>
          <Form.Label className='fw-bold'>Photo</Form.Label>
          <div className='photo-upload-area'>
            <Form.Control type='file' accept='image/*' />
          </div>
        </Form.Group>

        {/* Nickname */}
        <Form.Group className='mb-3'>
          <Form.Label>Nickname</Form.Label>
          <Form.Control
            type='text'
            placeholder='Give your plant a name...'
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </Form.Group>

        {/* Species search */}
        <Form.Group className='mb-3' style={{ position: 'relative' }}>
          <Form.Label>Species</Form.Label>
          <div className='d-flex align-items-center gap-2'>
            <Form.Control
              type='text'
              placeholder='Search for plant species...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={!!selectedPlant}
            />
            {selectedPlant && (
              <Button variant='outline-secondary' size='sm' onClick={handleClearSelection}>
                ✕
              </Button>
            )}
          </div>

          {/* Loading spinner */}
          {searching && (
            <div className='text-center mt-2'>
              <Spinner animation='border' size='sm' /> Searching...
            </div>
          )}

          {/* Search results dropdown */}
          {results.length > 0 && (
            <ListGroup
              style={{
                position: 'absolute',
                zIndex: 1000,
                width: '100%',
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {results.map((plant) => (
                <ListGroup.Item
                  key={plant.id}
                  action
                  onClick={() => handleSelect(plant)}
                  className='d-flex align-items-center gap-2'
                >
                  {plant.imageUrl && (
                    <Image
                      src={plant.imageUrl}
                      rounded
                      style={{ width: 40, height: 40, objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <strong>{plant.commonName !== 'Unknown' ? plant.commonName : plant.scientificName}</strong>
                    {plant.commonName !== 'Unknown' && (
                      <div className='text-muted' style={{ fontSize: '0.85em' }}>
                        {plant.scientificName}
                      </div>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          <Form.Text className='text-muted'>Powered by Trefle.io</Form.Text>
        </Form.Group>

        {/* Show selected plant info */}
        {selectedPlant && (
          <div className='p-2 border rounded bg-light d-flex align-items-center gap-2'>
            {selectedPlant.imageUrl && (
              <Image
                src={selectedPlant.imageUrl}
                rounded
                style={{ width: 50, height: 50, objectFit: 'cover' }}
              />
            )}
            <div>
              <strong>{selectedPlant.scientificName}</strong>
              <div className='text-muted' style={{ fontSize: '0.85em' }}>
                {selectedPlant.family}
              </div>
            </div>
          </div>
        )}

      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>Cancel</Button>
        <Button variant='success' disabled={!selectedPlant || !nickname.trim()} onClick={handleSubmit}>
          Add Plant
        </Button>
      </Modal.Footer>
    </Modal>
  )
}