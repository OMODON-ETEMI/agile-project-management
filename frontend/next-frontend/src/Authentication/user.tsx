import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";


export async function UserData(token: string) {
    if (token && process.env.JWT_SECRET_KEY) {
        try {
            const {payload} = await jwtVerify(token, new Uint8Array(Buffer.from(process.env.JWT_SECRET_KEY)))
            return payload as any
        } catch (error) {
            error instanceof jwt.TokenExpiredError ? console.error("Token Expired") : 
            console.error("JWT ERROR : ", error)
        }
    } else {
        console.error("Token or secret key missing.");
    }
}