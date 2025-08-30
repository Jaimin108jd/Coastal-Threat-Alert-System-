import { NextRequest, NextResponse } from 'next/server'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { fetchKindeUser, validateKindeConfig } from '@/lib/kinde-api'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { getUser, isAuthenticated } = getKindeServerSession()
        const user = await getUser()
        const isLoggedIn = await isAuthenticated()

        if (!isLoggedIn || !user) {
            return NextResponse.json({ user: null, isAuthenticated: false }, { status: 401 })
        }

        // Validate configuration
        const configValidation = validateKindeConfig()
        if (!configValidation.isValid) {
            console.error('Kinde configuration errors:', configValidation.errors)
            // Fallback to basic user data from Kinde session
            return NextResponse.json({
                user: {
                    id: user.id,
                    email: user.email,
                    given_name: user.given_name,
                    family_name: user.family_name,
                    picture: user.picture,
                },
                isAuthenticated: true
            })
        }

        // Fetch enhanced user data from Kinde API
        const kindeUserResult = await fetchKindeUser(user.id)


        if (kindeUserResult.success && kindeUserResult.data) {
            const data = kindeUserResult.data;
            // get data from prisma
            const prismaUser = await prisma.user.findUnique({
                where: { kindeId: user.id ?? "" }
            });

            return NextResponse.json({
                user: {
                    id: data.id,
                    email: data.email,
                    given_name: data.first_name || prismaUser?.firstName,
                    family_name: data.last_name || prismaUser?.lastName,
                    picture: data.picture || prismaUser?.picture,
                },
                isAuthenticated: true
            })
        } else {
            console.warn('Failed to fetch enhanced user data:', kindeUserResult.error)
            // Fallback to basic user data from Kinde session
            return NextResponse.json({
                user: {
                    id: user.id,
                    email: user.email,
                    given_name: user.given_name,
                    family_name: user.family_name,
                    picture: user.picture,
                },
                isAuthenticated: true
            })
        }
    } catch (error) {
        console.error('Error fetching user:', error)

        // If there's an error, try to return basic user info from Kinde session
        try {
            const { getUser, isAuthenticated } = getKindeServerSession()
            const user = await getUser()
            const isLoggedIn = await isAuthenticated()

            if (isLoggedIn && user) {
                return NextResponse.json({
                    user: {
                        id: user.id,
                        email: user.email,
                        given_name: user.given_name,
                        family_name: user.family_name,
                        picture: user.picture,
                    },
                    isAuthenticated: true
                })
            }
        } catch (fallbackError) {
            console.error('Fallback error:', fallbackError)
        }

        return NextResponse.json({ user: null, isAuthenticated: false }, { status: 500 })
    }
}
