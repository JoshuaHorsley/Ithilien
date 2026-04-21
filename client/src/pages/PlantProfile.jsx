import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Button, Card, Form, Modal, Spinner } from 'react-bootstrap'
import './PlantProfile.css'

const API = `${import.meta.env.API_URL}/api`

export default function PlantProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plant, setPlant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [editWateringDays, setEditWateringDays] = useState('')
  const [editImageFile, setEditImageFile] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState('')

  const load = async () => {
    try {
      const res = await fetch(`${API}/plants/${id}`, { credentials: 'include' })
      const json = await res.json()
      setPlant(json.data)
    } catch (err) {
      console.error('Failed to load plant:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const waterPlant = async () => {
    try {
      await fetch(`${API}/plants/${id}/water`, { method: 'POST', credentials: 'include' })
      load()
    } catch (err) {
      console.error('Water error:', err)
    }
  }

  const openEdit = () => {
    setEditNickname(plant.nickname || '')
    setEditWateringDays(plant.wateringDays ?? '')
    setEditImageFile(null)
    setEditImagePreview(
      plant.plantImageId
        ? `${API}/images/${plant.plantImageId}`
        : plant.imageUrl || ''
    )
    setShowEdit(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditImageFile(file)
    setEditImagePreview(URL.createObjectURL(file))
  }

  const saveEdit = async () => {
    try {
      let plantImageId = undefined

      if (editImageFile) {
        const formData = new FormData()
        formData.append('image', editImageFile)
        const imgRes = await fetch(`${API}/images`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })
        const imgJson = await imgRes.json()
        if (!imgRes.ok) {
          alert('Failed to upload image. Please try again.')
          return
        }
        plantImageId = imgJson.imageId
      }

      const body = {
        nickname: editNickname,
        wateringDays: editWateringDays === '' ? null : Number(editWateringDays),
        ...(plantImageId !== undefined && { plantImageId }),
      }

      await fetch(`${API}/plants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      setShowEdit(false)
      load()
    } catch (err) {
      console.error('Edit error:', err)
    }
  }

  const deletePlant = async () => {
    if (!confirm('Delete this plant? This cannot be undone.')) return
    try {
      await fetch(`${API}/plants/${id}`, { method: 'DELETE', credentials: 'include' })
      navigate('/garden')
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const careStatus = () => {
    if (!plant?.lastWatered) return { text: 'Never watered — needs water!', overdue: true }
    const last = new Date(plant.lastWatered)
    const days = Math.floor((Date.now() - last.getTime()) / 86400000)
    const freq = plant.wateringDays ?? 7
    if (days >= freq) return { text: `Needs water! Last watered ${days} day${days === 1 ? '' : 's'} ago`, overdue: true }
    return { text: `Healthy — last watered ${days} day${days === 1 ? '' : 's'} ago`, overdue: false }
  }

  if (loading) {
    return <Container className="py-5 text-center"><Spinner animation="border" variant="success" /></Container>
  }

  if (!plant) {
    return <Container className="py-5 text-center"><h3>Plant not found</h3></Container>
  }

  const status = careStatus()

  return (
    <Container className="py-4 plant-profile">
      <Card className="pp-card">
        <div className="pp-image-wrap">
          <img
            src={
              plant.plantImageId
                ? `${API}/images/${plant.plantImageId}`
                : plant.imageUrl || 'https://placehold.co/800x400/f0f7f0/2e7d32?text=No+Photo'
            }
            alt={plant.nickname}
          />
        </div>
        <Card.Body>
          <h2 className="pp-nickname">{plant.nickname}</h2>
          <p className="pp-species">{plant.speciesName || plant.commonName || 'Unknown species'}</p>

          <Button className="pp-water-btn w-100" onClick={waterPlant}>
            Mark as Watered
          </Button>

          <section className="pp-section">
            <h5>Care Requirements</h5>
            <div className="pp-req-row"><span>Watering</span><span>{plant.wateringDays ? `Every ${plant.wateringDays} days` : plant.watering || 'Not available'}</span></div>
            <div className="pp-req-row"><span>Sunlight</span><span>{plant.light || 'Not available'}</span></div>
            <div className="pp-req-row"><span>Humidity</span><span>{plant.humidity || 'Not available'}</span></div>
            <div className="pp-req-row"><span>Growth Rate</span><span>{plant.growthRate || 'Not available'}</span></div>
          </section>

          <section className="pp-section">
            <h5>Care Status</h5>
            <div className={`pp-status ${status.overdue ? 'overdue' : 'ok'}`}>{status.text}</div>
          </section>

          <section className="pp-section">
            <h5>Care History</h5>
            {plant.careLogs?.length ? (
              <ul className="pp-history">
                {plant.careLogs.map((log) => (
                  <li key={log.id}>
                    <span className="pp-history-date">{new Date(log.date).toLocaleDateString()}</span>
                    <span>{log.action}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No care actions logged yet.</p>
            )}
          </section>

          <div className="d-flex justify-content-between mt-4">
            <Button variant="outline-secondary" onClick={openEdit}>Edit Plant</Button>
            <Button variant="outline-danger" onClick={deletePlant}>Delete Plant</Button>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton><Modal.Title>Edit Plant</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3 text-center">
            <Form.Label className="fw-bold d-block">Photo</Form.Label>
            {editImagePreview && (
              <img
                src={editImagePreview}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'cover',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
            )}
            <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nickname</Form.Label>
            <Form.Control
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Watering interval (days)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={editWateringDays}
              onChange={(e) => setEditWateringDays(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
          <Button variant="success" onClick={saveEdit}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
