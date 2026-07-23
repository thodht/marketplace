import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/db-services";
import { AppUser, Listing, COLLECTIONS } from "@/types/index"; // Type-safe imports


export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const [collection] = slug;
    const userId = request.headers.get("x-User-Id");

    if (!userId) {
        return NextResponse.json({ error: "User unauthorized!" }, { status: 401 });
    }

    if (collection === COLLECTIONS.user) {
        try {
            const db = new DatabaseService<AppUser>(COLLECTIONS.user);
            const user = await db.getById(userId);
            return NextResponse.json({ blob: user });
        } catch (err: any) {
            console.error("Failed to retrieve user:", err);
            return NextResponse.json({ error: 'User fetch failed' }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Route not found' }, { status: 404 });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const [collection] = slug;
    const userId = request.headers.get("x-User-Id");

    if (!userId) {
        return NextResponse.json({ error: "User unauthorized!" }, { status: 401 });
    }

    if (collection === COLLECTIONS.user) {
        try {
            const body = await request.json();
            const db = new DatabaseService<AppUser>(COLLECTIONS.user);
            await db.save(userId, body);
            return NextResponse.json({ status: 200, data: body });
        } catch (error) {
            console.error("User update failed:", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
    else if (collection === COLLECTIONS.listing) {
        try {
            const body = await request.json();
            const db = new DatabaseService<Listing>(COLLECTIONS.listing);
            await db.saveDefaultId(body);
            return NextResponse.json({ status: 200, data: body });
        } catch (error) {
            console.error("Listing update failed:", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
}