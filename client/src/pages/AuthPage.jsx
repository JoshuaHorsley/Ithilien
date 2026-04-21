import { useState, useEffect } from 'react'
import { BsEye, BsEyeSlash } from 'react-icons/bs'
import { Container, Card, Tab, Nav, Form, Button } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authClient } from '../lib/auth'
import authBg from '../assets/AuthBg.jpeg'

export default function AuthPage(){
    const location = useLocation()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState(location.pathname === '/register' ? 'register' : 'login')
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState({})

    useEffect(() => {
        setActiveTab(location.pathname === '/register' ? 'register' : 'login')
        setErrors({})
        setEmail('')
        setPassword('')
        setConfirmPassword('')
    }, [location.pathname])

    const handleLogin = async (e) => {
        e.preventDefault()
        const newErrors = {}

        if (!email) newErrors.email = 'Email is required'
        if (!password) newErrors.password = 'Password is required'

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) return

        try {
            const result = await authClient.signIn.email({
                email,
                password,
            })
            if (result.error) {
                setErrors({ email: result.error.message })
            } else {
                navigate('/garden')
                console.log('Login successful!', result)
            }
        } catch (err) {
            setErrors({ email: 'Something went wrong. Please try again.' })
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        const newErrors = {}

        if (!email) newErrors.email = 'Email is required'
        if (!password) newErrors.password = 'Password is required'
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
        if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
        if (password && confirmPassword && password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) return

        try {
            const result = await authClient.signUp.email({
                email,
                password,
                name: '',
            })
            if (result.error) {
                setErrors({ email: result.error.message })
            } else {
                navigate('/garden')
                console.log('Registration successful!', result)
            }
        } catch (err) {
            setErrors({ email: 'Something went wrong. Please try again.' })
        }
    }
    
    return (
        <div className="auth-page" style={{ backgroundImage: `url(${authBg})` }}>
            <Container className='d-flex justify-content-center py-5'>
                <Card style={{ width: '400px' }} className='p-4 mt-5 auth-card'>
                    <h3 className='text-center mb-4' style={{ fontFamily: "'Cinzel', serif" }}>Ithilien</h3>
                    <Tab.Container activeKey={activeTab} onSelect={(k) => {
                        setActiveTab(k)
                        setErrors({})
                        setEmail('')
                        setPassword('')
                        setConfirmPassword('')
                    }}>
                        <Nav variant='tabs' className='mb-3 justify-content-center'>
                            <Nav.Item>
                                <Nav.Link eventKey='login'>Login</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey='register'>Register</Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <Tab.Content>
                            <Tab.Pane eventKey='login'>
                                <Form onSubmit={handleLogin}>
                                    <Form.Group className='mb-3'>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control 
                                            type='email' 
                                            placeholder='you@example.com'
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            isInvalid={!!errors.email}
                                        />
                                        <Form.Control.Feedback type='invalid'>
                                            {errors.email}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className='mb-3'>
                                        <Form.Label>Password</Form.Label>
                                        <div className='position-relative'>
                                            <Form.Control 
                                                type={showPassword ? 'text': 'password'} 
                                                placeholder={showPassword ? 'password123' : '••••••••'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                isInvalid={!!errors.password}
                                            />
                                            <Form.Control.Feedback type='invalid'>
                                                {errors.password}
                                            </Form.Control.Feedback>
                                            {!errors.password && (
                                                <span
                                                    className='password-toggle'
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <BsEye /> : <BsEyeSlash />}
                                                </span>
                                            )}
                                        </div>
                                    </Form.Group>
                                    <Button variant="success" className='w-100' type='submit'>Sign in</Button>
                                </Form>
                            </Tab.Pane>
                            <Tab.Pane eventKey='register'>
                                <Form onSubmit={handleRegister}>
                                    <Form.Group className='mb-3'>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control 
                                            type='email'
                                            placeholder='you@example.com'
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            isInvalid={!!errors.email}
                                        />
                                        <Form.Control.Feedback type='invalid'>
                                            {errors.email}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className='mb-3'>
                                        <Form.Label>Password</Form.Label>
                                        <div className='position-relative'>
                                            <Form.Control 
                                                type={showPassword ? 'text': 'password'} 
                                                placeholder={showPassword ? 'password123' : '••••••••'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                isInvalid={!!errors.password}
                                            />
                                            <Form.Control.Feedback type='invalid'>
                                                {errors.password}
                                            </Form.Control.Feedback>
                                            {!errors.password && (
                                                <span
                                                    className='password-toggle'
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <BsEye /> : <BsEyeSlash />}
                                                </span>
                                            )}
                                        </div>
                                    </Form.Group>
                                    <Form.Group className='mb-3'>
                                        <Form.Label>Confirm Password</Form.Label>
                                        <div className='position-relative'>
                                            <Form.Control 
                                                type={showPassword ? 'text': 'password'} 
                                                placeholder={showPassword ? 'password123' : '••••••••'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                isInvalid={!!errors.confirmPassword}
                                            />
                                            <Form.Control.Feedback type='invalid'>
                                                {errors.confirmPassword}
                                            </Form.Control.Feedback>
                                            {!errors.confirmPassword && (
                                                <span
                                                    className='password-toggle'
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <BsEye /> : <BsEyeSlash />}
                                                </span>
                                            )}
                                        </div>
                                    </Form.Group>
                                    <Button variant='success' className='w-100' type='submit'>Register</Button>
                                </Form>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                    <div className='text-center mt-3'>
                        <Link to='/' className='auth-link'>
                        Home
                        </Link>
                    </div>
                </Card>
            </Container>
        </div>
    )
}