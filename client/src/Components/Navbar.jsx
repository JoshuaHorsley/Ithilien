/*
 * FILE: PlantCard.jsx
 * DESCRIPTION: Displays a single plant as a card in the My Garden grid. Shows the
 *              plant photo, nickname, species, a colour-coded care status badge, and
 *              quick action buttons.
 */

import { Link, useLocation } from 'react-router-dom'
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { authClient } from '../lib/auth'
import { BsPersonCircle } from 'react-icons/bs'
import leafLogo from '../assets/leaf-logo.svg'

export default function AppNavbar({ isLoggedIn, session, reminderCount }) {
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await authClient.signOut()
        navigate('/')
    }

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
                        {isLoggedIn ? (
                            <>
                                <Nav.Link as={Link} to='/garden' active={location.pathname === '/garden'}>
                                    My Garden
                                </Nav.Link>
                                <Nav.Link as={Link} to='/calendar' active={location.pathname === '/calendar'}>
                                    Calendar
                                </Nav.Link>
                                <Dropdown align='end'>
                                    <Dropdown.Toggle variant='link' className='nav-avatar-toggle'>
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <BsPersonCircle size={24} />
                                            {reminderCount > 0 && (
                                                <span className='reminder-badge'>
                                                    {reminderCount > 99 ? '99+' : reminderCount}
                                                </span>
                                            )}
                                        </div>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Header>{session?.user?.email}</Dropdown.Header>
                                        <Dropdown.Divider />
                                        <Dropdown.Item as={Link} to='/settings'>Settings</Dropdown.Item>
                                        <Dropdown.Item className='text-danger' onClick={handleLogout}>Logout</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to='/login' active={location.pathname === '/login'}>
                                    Login
                                </Nav.Link>
                                <Nav.Link as={Link} to='/register' active={location.pathname === '/register'}>
                                    Register
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}