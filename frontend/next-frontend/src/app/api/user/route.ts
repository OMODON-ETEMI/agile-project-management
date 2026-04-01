import { UserData } from "@/src/Authentication/user";
import { User } from "@/src/helpers/type";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(){
    const accessToken = cookies().get("access_token")?.value;

    if(!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user: User = await UserData(accessToken)
    return NextResponse.json(user, { status: 200 });
}