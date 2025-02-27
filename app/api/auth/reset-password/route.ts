import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(req: Request) {
  try {
    const { email, newPassword, otp } = await req.json()

    // Verify OTP
    const resetDoc = await adminDb.collection("passwordResets").doc(email).get()
    if (!resetDoc.exists) {
      return NextResponse.json({ error: "Invalid reset attempt" }, { status: 400 })
    }

    const resetData = resetDoc.data()
    if (resetData?.otp !== otp || resetData?.expires < Date.now()) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Get user by email
    const userRecord = await adminAuth.getUserByEmail(email)

    // Update password
    await adminAuth.updateUser(userRecord.uid, {
      password: newPassword,
    })

    // Delete the reset document
    await adminDb.collection("passwordResets").doc(email).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "An error occurred" }, { status: 500 })
  }
}

