/*
 * FILE: user.ts
 * DATE: 04 - 15 - 2026
 * DESCRIPTION: API routes for user profile management and account deletion
 */

import { Router } from 'express'
import type { Request, Response } from 'express'
import { prisma, auth } from '../lib/auth.js'

export const router = Router()



// List of timezones the app supports to validate incoming requests
const ALLOWED_TIMEZONES = [

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
 * FUNCTION: isValidEmail
 * PARAMETERS: email - the string to check
 * RETURNS: true if the string looks like a valid email address, false otherwise
 * DESCRIPTION: Checks that the email has characters, an @ symbol, more characters,
 *              a dot, and a domain extension. This is a basic format check, not a
 *              full RFC validation.
 */
function isValidEmail(email: string): boolean
{

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email.trim())

}


/*
 * FUNCTION: getSessionUser
 * PARAMETERS: req - Express request object containing cookies and headers
 * RETURNS: Promise resolving to the authenticated user's ID and email, or null if not authenticated
 * DESCRIPTION: Uses better-auth's API to retrieve the current session based on the request's
 *              cookies and headers. If a valid session exists, extracts and returns the user's
 *              ID and email. If no session is found or an error occurs, returns null.
 */
async function getSessionUser(req: Request): Promise<{ id: string; email: string } | null>
{

    try
    {
        // Get the current session using better-auth's API, passing along the request headers for authentication
        const session = await auth.api.getSession({ headers: req.headers as any })

        // If there is no session or the session does not contain user information, return null to indicate the user is not authenticated
        if (!session?.user)
        {

            return null

        }

        // Return an object containing the user's ID and email extracted from the session
        return { id: session.user.id, email: session.user.email }

    }
    catch
    {

        return null

    }

}


/*
 * ROUTE: GET /api/user/profile
 * DESCRIPTION: Returns the authenticated user's profile data including email, name,
 *              timezone, and account creation date.
 */
router.get('/profile', async (req: Request, res: Response) =>
{

    // Make sure the user is logged in
    const user = await getSessionUser(req)


    // If there is no authenticated user, return a 401 Unauthorized response
    if (!user)
    {
        // This means the request did not include valid authentication credentials, so we cannot proceed with fetching the profile
        return res.status(401).json({ error: 'Not authenticated' })

    }

    try
    {

        // Look up the user's profile in the database
        const profile = await prisma.user.findUnique({

            where: { id: user.id },

            select: {

                id: true,
                email: true,
                name: true,
                timezone: true,
                createdAt: true,

            },

        })

        // If the user record is not found (which should not happen if the session is valid), return a 404 Not Found response
        if (!profile)
        {
            // This would indicate a mismatch between the session data and the database, which is an error state
            return res.status(404).json({ error: 'User not found' })

        }

        // Return the user's profile data in the response
        res.json({ data: profile })

    }
    catch (err)
    {

        console.error('Get profile error:', err)
        res.status(500).json({ error: 'Failed to fetch profile' })

    }

})


/*
 * ROUTE: PUT /api/user/profile
 * PARAMETERS (body): email?           - new email address
 *                    timezone?        - new timezone string
 *                    currentPassword? - required when changing password
 *                    newPassword?     - the new password to set (min 6 characters)
 * DESCRIPTION: Updates the authenticated user's profile. Handles email and timezone changes
 *              via Prisma, and password changes via better-auth after verifying the current
 *              password. Returns the updated profile on success.
 */
router.put('/profile', async (req: Request, res: Response) =>
{

    // Make sure the user is logged in
    const user = await getSessionUser(req)

    // If there is no authenticated user, return a 401 Unauthorized response
    if (!user)
    {
        return res.status(401).json({ error: 'Not authenticated' })

    }

    // Extract the fields from the request body that may be updated
    const { email, timezone, currentPassword, newPassword } = req.body


    // If an email was provided, make sure it is not blank and looks like a real email
    if (email !== undefined) {

        if (!email || !email.trim())
        {

            return res.status(400).json({ error: 'Email cannot be empty' })

        }

        if (!isValidEmail(email))
        {

            return res.status(400).json({ error: 'Please provide a valid email address' })

        }

    }

    // If a timezone was provided, make sure it is one that can be actually supported by the app 
    if (timezone !== undefined) {

        if (!ALLOWED_TIMEZONES.includes(timezone))
        {

            return res.status(400).json({ error: 'Please provide a valid timezone' })

        }

    }

    // If a new password was provided, make sure it is a non-empty string
    if (newPassword !== undefined)
    {

        if (!newPassword || typeof newPassword !== 'string') {

            return res.status(400).json({ error: 'New password cannot be empty' })

        }

    }

    try
    {

        // Handle password change if a new password was provided
        if (newPassword)
        {

            // Current password is required to set a new one
            if (!currentPassword)
            {

                return res.status(400).json({ error: 'Current password is required to set a new password' })

            }

            // Enforce minimum password length
            if (newPassword.length < 6)
            {

                return res.status(400).json({ error: 'New password must be at least 6 characters' })

            }

            // changePassword verifies currentPassword internally and throws if wrong
            try
            {

                await auth.api.changePassword({

                    body: { currentPassword, newPassword, revokeOtherSessions: false },
                    headers: req.headers as any,

                })

            }
            catch (err)
            {

                console.error('Change password error:', err)
                return res.status(400).json({ error: 'Current password is incorrect' })

            }

        }

        // Build up the fields to update in the database
        const updateData: Record<string, any> = {}

        // Handle email change if a new email was provided and it's different from the current one
        if (email && email !== user.email)
        {

            // Make sure the new email isn't already taken by another account
            const existingUser = await prisma.user.findUnique({ where: { email } })

            // If we found a user with the new email, it means it's already in use, so return a 400 Bad Request response
            if (existingUser)
            {

                return res.status(400).json({ error: 'Email is already in use' })

            }

            // If the new email is valid and not taken, add it to the update data
            updateData.email = email

        }

        // Handle timezone change if a new timezone was provided and it's different from the current one
        if (timezone)
        {

            updateData.timezone = timezone

        }

        // Only run the update query if there is something to change
        if (Object.keys(updateData).length > 0)
        {

            await prisma.user.update({ where: { id: user.id }, data: updateData })

        }

        // Fetch and return the updated profile
        const updatedProfile = await prisma.user.findUnique({

            where: { id: user.id },
            select: { id: true, email: true, name: true, timezone: true, createdAt: true },

        })

        res.json({ data: updatedProfile, message: 'Profile updated successfully' })

    }
    catch (err)
    {

        console.error('Update profile error:', err)
        res.status(500).json({ error: 'Failed to update profile' })

    }

})


/*
 * ROUTE: DELETE /api/user/account
 * PARAMETERS (body): password - the user's current password for confirmation
 * DESCRIPTION: Permanently deletes the authenticated user's account and all associated data
 *              (care logs, plants, sessions, accounts). Requires password confirmation before
 *              deletion. Cascades through related records in dependency order.
 */
router.delete('/account', async (req: Request, res: Response) =>
{

    // Make sure the user is logged in
    const user = await getSessionUser(req)

    // If there is no authenticated user, return a 401 Unauthorized response
    if (!user)
    {

        return res.status(401).json({ error: 'Not authenticated' })

    }

    // Make sure the request body exists and has a password field
    if (!req.body || typeof req.body !== 'object')
    {

        return res.status(400).json({ error: 'Request body is missing' })

    }

    // Extract the password from the request body for confirmation
    const { password } = req.body

    // Validate that the password is a non-empty string
    if (!password || typeof password !== 'string' || !password.trim())
    {

        return res.status(400).json({ error: 'Password is required to delete your account' })

    }

    try {

        // Verify the password via signInEmail. This creates a throwaway session as a side effect,
        // but it's harmless here because prisma.session.deleteMany below wipes all sessions for
        // this user anyway. better-auth exposes no standalone password-verify primitive.
        try
        {

            await auth.api.signInEmail({

                body: { email: user.email, password },
                headers: req.headers as any,

            })

        }
        catch
        {

            return res.status(400).json({ error: 'Incorrect password' })

        }

        // Delete in dependency order so foreign key constraints are not violated:

        // Care logs that reference plants
        await prisma.careLog.deleteMany({ where: { plant: { userId: user.id } },})

        // Plants that reference the user
        await prisma.plant.deleteMany({ where: { userId: user.id } })

        // Sessions that reference the user
        await prisma.session.deleteMany({ where: { userId: user.id } })

        // Accounts that reference the user
        await prisma.account.deleteMany({ where: { userId: user.id } })

        // Delete the user record itself
        await prisma.user.delete({ where: { id: user.id } })

        res.json({ message: 'Account deleted successfully' })

    }
    catch (err)
    {

        console.error('Delete account error:', err)
        res.status(500).json({ error: 'Failed to delete account' })

    }

})