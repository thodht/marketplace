import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { DatabaseService } from "@/lib/db-services";
import { UserPreferences, COLLECTIONS } from "@/types/index"; // Type-safe imports

// Safely access variables from process.env, with fallbacks or strict errors
const PI_API_URL = process.env.PI_API_URL;
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    if (!JWT_SECRET) {
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const { slug } = await params;
    const [pluginName, apiVersion, key] = slug; // key will be 'user_prefs'

    if (pluginName === 'user-state') {
        try {
            // 1. Authenticate the user calling sdk.userState.get()
            const userId = request.headers.get("x-User-Id");
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const userPrefsDb = new DatabaseService<UserPreferences>(COLLECTIONS.userPrefs);
            const userPrefsData = await userPrefsDb.getById(key);

            return NextResponse.json(userPrefsData);
        } catch (err: any) {
            console.error("Failed to retrieve user state:", err);
            return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    if (!JWT_SECRET) {
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const { slug } = await params;
    const [pluginName, apiVersion, key] = slug; // key will be 'user_prefs'

    if (pluginName === 'user-state') {
        try {
            const body = await request.json();

            // 2. Perform clean, specific database update
            const userPrefsDb = new DatabaseService<UserPreferences>(COLLECTIONS.userPrefs);
            await userPrefsDb.save(key, body);

            return NextResponse.json({ status: 200, data: body });

        } catch (err: any) {
            console.error("Failed to update user state:", err);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
    }

    // Default fallback for unmatched routes
    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
}


export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    // Defensive check: Crash early if you forgot to set the secret in your env
    if (!JWT_SECRET) {
        console.error("CRITICAL ERROR: JWT_SECRET is not configured in environment variables.");
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const { slug } = await params;
    const [pluginName, apiVersion, endpoint] = slug;

    if (pluginName === 'auth' && endpoint === 'login') {
        try {
            const { accessToken } = await request.json();

            if (!accessToken) {
                return NextResponse.json({ error: 'Missing token' }, { status: 400 });
            }

            // Verify token with Pi Network Platform using the env URL
            const platformResponse = await axios.get(`${PI_API_URL}/me`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const piUser = platformResponse.data;

            // Create a session token using the secure env secret
            const sessionToken = jwt.sign(
                { uid: piUser.uid, username: piUser.username, versionUsed: apiVersion },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return NextResponse.json({
                sessionToken,
                user: { uid: piUser.uid, username: piUser.username }
            });

        } catch (err: any) {
            return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
}