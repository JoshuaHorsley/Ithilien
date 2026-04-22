/*
 * FILE: Settings.jsx
 * DATE: 04 - 15 - 2026
 * DESCRIPTION: User settings page. Allows the logged-in user to update their email,
 *              timezone, password, notification preferences, and delete their account.
 */

import { useState, useEffect } from 'react'
import { Container, Card, Form, Button, Alert, Modal, Spinner } from 'react-bootstrap'
import { BsEye, BsEyeSlash, BsPersonCircle, BsShieldLock, BsBoxArrowRight, BsTrash } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import { authClient } from '../lib/auth'



const TIMEZONES = [

    'America/Toronto',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Vancouver',
    'America/Halifax',
    'America/St_Johns',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Amsterdam',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Australia/Sydney',
    'Pacific/Auckland',
    'UTC',

]


/*
 * FUNCTION: SettingsSection
 * PARAMETERS: icon     - React icon element shown beside the section title
 *             title    - section heading text
 *             children - form content rendered inside the card
 * RETURNS: JSX element
 * DESCRIPTION: Reusable card wrapper used for each settings section. 
 *              Renders a consistent header with an icon pill and a title, then slots in children.
 */
function SettingsSection({ icon, title, children })
{
   
    return (

        <Card className="mb-4 settings-card">

            <Card.Body className="p-4">

                <div className="d-flex align-items-center gap-2 mb-4">

                    <span className="settings-section-icon">{icon}</span>

                    <h5 className="mb-0" style={{ fontFamily: "'Cinzel', serif", fontSize: '1rem' }}>
                        {title}
                    </h5>

                </div>

                {children}

            </Card.Body>

        </Card>

    )

}


/*
 * FUNCTION: Settings
 * PARAMETERS: none
 * RETURNS: JSX element
 * DESCRIPTION: Main settings page component. Fetches the user's profile on mount and
 *              populates the form fields. Handles four separate update flows: account info
 *              (email + timezone), password change, notification preferences, and account
 *              deletion. Redirects to /login if no session is found.
 */
export default function Settings()
{

    // React Router navigation hook
    const navigate = useNavigate()
    const { data: session } = authClient.useSession()

    // Account section state 
    const [email, setEmail] = useState('')
    const [timezone, setTimezone] = useState('America/Toronto')
    const [profileSuccess, setProfileSuccess] = useState('')
    const [profileError, setProfileError] = useState('')
    const [profileLoading, setProfileLoading] = useState(false)

    // Password section state 
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [showCurrentPw, setShowCurrentPw] = useState(false)
    const [showNewPw, setShowNewPw] = useState(false)
    const [passwordSuccess, setPasswordSuccess] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [passwordLoading, setPasswordLoading] = useState(false)

    // Delete account modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteError, setDeleteError] = useState('')
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [showDeletePw, setShowDeletePw] = useState(false)


    /*
     * EFFECT: fetchProfile
     * DESCRIPTION: Loads the user's current profile from the API when the session becomes
     *              available, and populates the email and timezone fields.
     *              NOTE: Code depends on session?.user?.id (a string) rather than session?.user (an object).
     *              Objects get a new reference on every render, which would cause this effect to run in an infinite loop.           
     */
    useEffect(() =>
    {

        // Don't attempt to fetch if don't have a user ID yet (session is still loading or user is not logged in)
        if (!session?.user?.id)
        {

            return

        }

        // Fetch the user's profile data from the API and populate the form fields
        const fetchProfile = async () =>
        {

            try {

                // We need to include credentials in order for the cookie to be sent and the server to identify the user
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`,
                {

                    credentials: 'include',

                })

                // The API returns a 200 status with an error message in the body if the user is not authenticated = need to check res.ok rather than just relying on catch
                const json = await res.json()

                // If the response is not ok, it means the server rejected the request (e.g. user not authenticated) = log the error and return early without trying to access json.data
                if (json.data)
                {

                    setEmail(json.data.email || '')
                    setTimezone(json.data.timezone || 'America/Toronto')

                }

            }
            catch (err)
            {

                console.error('Failed to load profile:', err)

            }

        }

        fetchProfile()

    }, [session?.user?.id])


    /*
     * EFFECT: authGuard
     * DESCRIPTION: Redirects unauthenticated users to the login page.
     */
    useEffect(() =>
    {

        // If session is null, it means the user is not logged in = redirect to login page.
        if (session === null)
        {

            navigate('/login')

        }

    }, [session])


    /*
     * FUNCTION: handleUpdateAccount
     * PARAMETERS: e - form submit event
     * RETURNS: void
     * DESCRIPTION: Validates the email format and timezone value, then sends a PUT request
     *              to update the user's account info. Shows a success or error alert.
     */
    const handleUpdateAccount = async (e) =>
    {

        // Prevent the default form submission behavior which would cause a page reload
        e.preventDefault()

        // Clear any previous messages
        setProfileError('')
        setProfileSuccess('')

        // Check the email field is not blank
        if (!email.trim())
        {

            setProfileError('Email cannot be empty')
            return

        }

        // Check the email looks like a real email address
        // Pattern: characters @ characters . characters
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        // basic check to prevent sending obviously invalid emails to the server
        if (!emailPattern.test(email.trim()))
        {

            setProfileError('Please enter a valid email address')
            return

        }

        // Check the timezone is one of the values actually supported by the app
        if (!TIMEZONES.includes(timezone))
        {

            setProfileError('Please select a valid timezone')
            return

        }

        // If all validations pass, proceed to send the update request to the server
        setProfileLoading(true)

        try {

            // include credentials in order for the cookie to be sent and the server to identify the user
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`,
            {

                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, timezone }),

            })

            // The API returns a 200 status with an error message in the body if the user is not authenticated = need to check res.ok rather than just relying on catch
            const json = await res.json()

            // If the response is not ok, it means the server rejected the request = log the error and return early without trying to access json.data
            if (!res.ok)
            {

                setProfileError(json.error || 'Update failed')
                return

            }

            setProfileSuccess('Profile updated successfully')
            setTimeout(() => setProfileSuccess(''), 3000)

        }
        catch
        {

            setProfileError('Something went wrong')

        }
        finally
        {

            setProfileLoading(false)

        }

    }


    /*
     * FUNCTION: handleUpdatePassword
     * PARAMETERS: e - form submit event
     * DESCRIPTION: Validates the password fields client-side, then sends a PUT request
     *              to update the password. Clears the form fields on success.
     */
    const handleUpdatePassword = async (e) =>
    {

        e.preventDefault()

        // Clear any previous messages
        setPasswordError('')
        setPasswordSuccess('')

        // Validate each field before sending
        if (!currentPassword)
        {

            setPasswordError('Please enter your current password')
            return

        }

        // New password must be at least 6 characters 
        if (!newPassword)
        {

            setPasswordError('Please enter a new password')
            return

        }

        // Enforce minimum password length 
        if (newPassword.length < 6)
        {

            setPasswordError('New password must be at least 6 characters')
            return

        }

        // New password and confirmation must match
        if (newPassword !== confirmNewPassword)
        {

            setPasswordError('New passwords do not match')
            return

        }

        // If all validations pass, proceed to send the update request to the server
        setPasswordLoading(true)

        try
        {

            // include credentials in order for the cookie to be sent and the server to identify the user, and send the current and new password in the body
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`,
            {

                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),

            })

            //
            const json = await res.json()

            // Check the response status. if the user is not authenticated or if the current password is incorrect = need to check res.ok rather than just relying on catch
            if (!res.ok)
            {

                setPasswordError(json.error || 'Password update failed')
                return

            }

            // Clear the form on success
            setPasswordSuccess('Password changed successfully')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmNewPassword('')
            setTimeout(() => setPasswordSuccess(''), 3000)

        }
        catch
        {

            setPasswordError('Something went wrong')

        }
        finally
        {

            setPasswordLoading(false)

        }

    }


    /*
     * FUNCTION: handleLogout
     * DESCRIPTION: Signs the user out via better-auth and redirects to the landing page.
     */
    const handleLogout = async () =>
    {

        await authClient.signOut()
        navigate('/')

    }


    /*
     * FUNCTION: handleCloseDeleteModal
     * DESCRIPTION: Closes the delete account modal and resets its form state.
     */
    const handleCloseDeleteModal = () =>
    {

        setShowDeleteModal(false)
        setDeletePassword('')
        setDeleteError('')

    }


    /*
     * FUNCTION: handleDeleteAccount
     * DESCRIPTION: Sends a DELETE request to permanently remove the user's account after
     *              confirming their password. Signs out and redirects to home on success.
     */
    const handleDeleteAccount = async () =>
    {

        // Clear any previous error
        setDeleteError('')

        // Require the user to enter their password to confirm deletion
        if (!deletePassword)
        {

            setDeleteError('Password is required')
            return

        }

        // If validation passes, proceed to send the delete request to the server
        setDeleteLoading(true)

        try {

            // include credentials in order for the cookie to be sent and the server to identify the user, and send the password in the body for confirmation
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/account`,
            {

                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: deletePassword }),

            })

            const json = await res.json()

            // if the user is not authenticated or if the password confirmation fails = need to check res.ok rather than just relying on catch
            if (!res.ok)
            {

                setDeleteError(json.error || 'Deletion failed')
                return

            }

            // Sign out and go to the landing page after deletion
            await authClient.signOut()
            navigate('/')

        }
        catch
        {

            setDeleteError('Something went wrong')

        }
        finally
        {

            setDeleteLoading(false)

        }

    }


    return (

        // Main container with some vertical padding and a max width
        <div className="settings-page">

            <Container className="py-5" style={{ maxWidth: '680px' }}>

                <h2 className="mb-1" style={{ fontFamily: "'Cinzel', serif" }}>Settings</h2>

                <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                    Manage your account preferences
                </p>

                {/* Account: email + timezone */}
                <SettingsSection icon={<BsPersonCircle size={18} />} title="Account">

                    {profileSuccess && (<Alert variant="success" className="py-2">{profileSuccess}</Alert>)}
                    {profileError && (<Alert variant="danger" className="py-2">{profileError}</Alert>)}

                    <Form onSubmit={handleUpdateAccount}>

                        <Form.Group className="mb-3">

                            <Form.Label>Email address</Form.Label>

                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"

                            />

                        </Form.Group>


                        <Form.Group className="mb-4">

                            <Form.Label>Timezone</Form.Label>

                            <Form.Select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                            >
                                {TIMEZONES.map((tz) => (
                                    <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                                ))}
                            </Form.Select>

                            <Form.Text className="text-muted">
                                Used for scheduling reminders at the right local time.
                            </Form.Text>

                        </Form.Group>

                        <Button

                            variant="success"
                            type="submit"
                            disabled={profileLoading}
                            className="settings-save-btn"
                        >
                            {profileLoading ? <Spinner size="sm" animation="border" /> : 'Save changes'}

                        </Button>

                    </Form>

                </SettingsSection>

               
                {/* Password change */}
                <SettingsSection icon={<BsShieldLock size={18} />} title="Password">

                    {passwordSuccess && (<Alert variant="success" className="py-2">{passwordSuccess}</Alert>)}
                    {passwordError && (<Alert variant="danger" className="py-2">{passwordError}</Alert>)}

                    <Form onSubmit={handleUpdatePassword}>

                        <Form.Group className="mb-3">

                            <Form.Label>Current password</Form.Label>

                            <div className="position-relative">

                                <Form.Control
                                    type={showCurrentPw ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                />

                                <span
                                    className="password-toggle"
                                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                                >
                                    {showCurrentPw ? <BsEye /> : <BsEyeSlash />}
                                </span>

                            </div>

                        </Form.Group>



                        <Form.Group className="mb-3">

                            <Form.Label>New password</Form.Label>

                            <div className="position-relative">

                                <Form.Control
                                    type={showNewPw ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                />

                                <span
                                    className="password-toggle"
                                    onClick={() => setShowNewPw(!showNewPw)}
                                >
                                    {showNewPw ? <BsEye /> : <BsEyeSlash />}
                                </span>

                            </div>

                        </Form.Group>



                        <Form.Group className="mb-4">

                            <Form.Label>Confirm new password</Form.Label>

                            <div className="position-relative">

                                <Form.Control
                                    type={showNewPw ? 'text' : 'password'}
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                />

                            </div>

                        </Form.Group>

                        <Button

                            variant="success"
                            type="submit"
                            disabled={passwordLoading}
                            className="settings-save-btn"
                        >
                            {passwordLoading ? <Spinner size="sm" animation="border" /> : 'Update password'}

                        </Button>

                    </Form>

                </SettingsSection>



                {/* Session: sign out + delete account */}
                <SettingsSection icon={<BsBoxArrowRight size={18} />} title="Session">

                    <div className="d-flex flex-column gap-3">

                        <div>

                            <div className="fw-medium mb-1" style={{ fontSize: '0.95rem' }}>
                                Sign out
                            </div>

                            <div className="text-muted mb-2" style={{ fontSize: '0.82rem' }}>
                                Sign out of your account on this device.
                            </div>

                            <Button
                                variant="outline-secondary"
                                onClick={handleLogout}
                                className="settings-save-btn"
                            >
                                <BsBoxArrowRight className="me-2" />
                                Sign out
                            </Button>

                        </div>

                        <hr className="my-1" />

                        <div>

                            <div className="fw-medium mb-1" style={{ color: 'var(--color-danger)', fontSize: '0.95rem' }}>
                                Delete account
                            </div>

                            <div className="text-muted mb-2" style={{ fontSize: '0.82rem' }}>
                                Permanently delete your account and all your plant data. This cannot be undone.
                            </div>

                            <Button

                                variant="outline-danger"
                                onClick={() => setShowDeleteModal(true)}
                                className="settings-save-btn"
                            >
                                <BsTrash className="me-2" />
                                Delete account

                            </Button>
                        </div>

                    </div>

                </SettingsSection>

            </Container>


            {/* Delete account confirmation modal */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>

                <Modal.Header closeButton>

                    <Modal.Title style={{ fontFamily: "'Cinzel', serif", fontSize: '1.1rem', color: 'var(--color-danger)' }}>
                        Delete account
                    </Modal.Title>

                </Modal.Header>

                <Modal.Body>

                    <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                        This will permanently delete your account and all plants, care logs, and history
                        associated with it. Enter your password to confirm.
                    </p>

                    {deleteError && (<Alert variant="danger" className="py-2">{deleteError}</Alert>)}

                    <Form.Group>

                        <Form.Label>Password</Form.Label>

                        <div className="position-relative">

                            <Form.Control

                                type={showDeletePw ? 'text' : 'password'}
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="••••••••"
                                onKeyDown={(e) =>
                                {

                                    if (e.key === 'Enter')
                                    {

                                        handleDeleteAccount()

                                    }
                                }}

                            />
                            <span

                                className="password-toggle"
                                onClick={() => setShowDeletePw(!showDeletePw)}
                            >
                                {showDeletePw ? <BsEye /> : <BsEyeSlash />}

                            </span>

                        </div>

                    </Form.Group>

                </Modal.Body>

                <Modal.Footer>

                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        Cancel
                    </Button>

                    <Button variant="danger" onClick={handleDeleteAccount} disabled={deleteLoading}>
                        {deleteLoading ? <Spinner size="sm" animation="border" /> : 'Delete my account'}
                    </Button>

                </Modal.Footer>

            </Modal>

        </div>
    )

}