import { useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'

export default function AddPlantModal({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontFamily: "'Cinzel', serif" }}>Add New Plant</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
            <Form.Group className='mb-3 text-center'>
                <Form.Label className='fw-bold'>Photo</Form.Label>
                <div className='photo-upload-area'>
                    <Form.Control type='file' accept='image/*' />
                </div>
            </Form.Group>
            <Form.Group className='mb-3'>
                <Form.Label>Nickname</Form.Label>
                <Form.Control type='text' placeholder='Give you plant a name...' />
            </Form.Group>
            <Form.Group className='mb-3'>
                <Form.Label>Species</Form.Label>
                <Form.Control type='text' placeholder='Search for plant species...' />
                <Form.Text className='text-muted'>Powered by Perenual API</Form.Text>
            </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>Cancel</Button>
        <Button variant='success'>Add Plant</Button>
      </Modal.Footer>
    </Modal>
  )
}