import { Link, useLocation } from 'react-router-dom'
import { Navbar, Nav, Container } from 'react-bootstrap'
import leafLogo from '../assets/leaf-logo.svg'

export default function AppNavbar() {
    const location = useLocation()

    return (
        <Navbar bg='white' expand='lg' className='border-bottom py-1'>
            <Container fluid className='px-4'>
                <Navbar.Brand as={Link} to='/' style={{ fontSize: '40px', fontFamily: "'Cinzel', serif" }}>
                    <img src={leafLogo} alt="Ithilien logo" width="40" height="40" style={{ position: 'relative', bottom: '4px' }}/>
                    Ithilien
                </Navbar.Brand>
                <Navbar.Toggle aria-controls='main-nav' />
                <Navbar.Collapse id="main-nav">
                    <Nav className='ms-auto'>
                        <Nav.Link as={Link} to='/login' active={location.pathname === '/login'}>
                            Login
                        </Nav.Link>
                        <Nav.Link as={Link} to='/register' active={location.pathname === '/register'}>
                            Register
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}