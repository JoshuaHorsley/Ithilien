import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer mt-auto py-4 border-top">
      <Container className="text-center">
        <p className="mb-2">
          <Link to="/" className="footer-link me-3">Home</Link>
          <Link to="/login" className="footer-link me-3">Login</Link>
          <Link to="/register" className="footer-link">Register</Link>
        </p>
        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} Ithilien. All rights reserved.
        </p>
      </Container>
    </footer>
  )
}