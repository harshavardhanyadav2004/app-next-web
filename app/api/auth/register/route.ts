import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"
import { generateOTP, sendOTPEmail } from "@/lib/email-service"

export async function POST(req: Request) {
  try {
    const { email, password, ...userData } = await req.json()

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      emailVerified: false,
    })

    // Generate and send OTP
    const otp = await generateOTP()
    await sendOTPEmail(email, otp)
    console.log(otp)
    return NextResponse.json({
      success: true,
      user: userRecord,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "An error occurred" }, { status: 500 })
  }
}

