import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/db-services";
import { User, COLLECTIONS } from "@/types/index"; // Type-safe imports

const userDb = new DatabaseService<User>(COLLECTIONS.users);

export async function PUT(request: NextRequest) {
    try {
        const userId = request.headers.get("x-User-Id");

        if (!userId) {
            return NextResponse.json({ error: "User unauthorized!" }, { status: 401 });
        }
        const body = await request.json();

        // 2. Perform clean, specific database update
        await userDb.save(userId, body);

        return NextResponse.json({ status: 200, data: body });

    } catch (error) {
        console.error("Onboarding failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}