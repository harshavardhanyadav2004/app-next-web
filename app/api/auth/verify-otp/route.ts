import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(req: Request) {
  try {
    const { uid, otp } = await req.json()

    const userDoc = await adminDb.collection("users").doc(uid).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userDoc.data()
    if (userData?.otpForVerification === otp && userData?.otpExpires > Date.now() && !userData?.emailVerified) {
      // Update user document
     adminDb.collection("users").doc(uid).update({
        emailVerified: true,
        otpForVerification: null,
        otpExpires: null,
      })

      // Update Firebase Auth user
     adminAuth.updateUser(uid, {
        emailVerified: true,
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "An error occurred" }, { status: 500 })
  }
}

