"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SiteHeader } from "../components/site-header"
import { Footer } from "../components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Mail, Key, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { resetPassword, verifyResetPasswordOTP } from "@/lib/auth-service"
import { collection, doc,getDocs,query,updateDoc, where } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { updatePassword } from "firebase/auth"

type PasswordStrength = {
  score: number
  feedback: string
}

export default function ForgotPassword() {
  const { toast } = useToast()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: "",
  })

  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    let feedback = ""

    if (password.length >= 8) score += 1
    if (password.match(/[A-Z]/)) score += 1
    if (password.match(/[0-9]/)) score += 1
    if (password.match(/[^A-Za-z0-9]/)) score += 1

    switch (score) {
      case 0:
        feedback = "Very weak"
        break
      case 1:
        feedback = "Weak"
        break
      case 2:
        feedback = "Fair"
        break
      case 3:
        feedback = "Good"
        break
      case 4:
        feedback = "Strong"
        break
    }

    return { score, feedback }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value
    setNewPassword(password)
    setPasswordStrength(checkPasswordStrength(password))
  }

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
        return "bg-destructive"
      case 1:
        return "bg-orange-500"
      case 2:
        return "bg-yellow-500"
      case 3:
        return "bg-green-500"
      case 4:
        return "bg-green-600"
      default:
        return "bg-gray-200"
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({ title: "Error", description: "Please enter your email address.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      await resetPassword(email)
      setStep(2)
      toast({ title: "OTP Sent!", description: "Check your email for the verification code." })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsLoading(true)
    try {
      await resetPassword(email)
      toast({
        title: "OTP Resent!",
        description: "A new verification code has been sent to your email.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast({ title: "Error", description: "Please enter the OTP.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const verified = await verifyResetPasswordOTP(email, otp)
      if (verified) {
        setStep(3)
        toast({ title: "Success!", description: "OTP verified successfully." })
      } else {
        toast({ title: "Error", description: "Invalid OTP. Please try again.", variant: "destructive" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" })
      return
    }
  
    if (passwordStrength.score < 3) {
      toast({ title: "Error", description: "Please choose a stronger password.", variant: "destructive" })
      return
    }
  
    setIsLoading(true)
    try {
      // Verify OTP from Firestore
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("email", "==", email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      throw new Error("User not found")
    }

    // Get the first matching user document
    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()
    const user = auth.currentUser
    if (!user) {
      throw new Error("User is not authenticated.")
    }

    // Update password in Firebase Authentication
    await updatePassword(user, newPassword)

    await updateDoc(doc(db, "users", userData.uid), {// Hash before storing
        otpForVerification: null,
        otpExpires: null,
      })
      
      toast({ title: "Success!", description: "Password has been reset successfully." })
      setTimeout(() => {
        router.push("/signin")
      }, 1500)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="container max-w-md py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 bg-background/80 backdrop-blur-md p-8 rounded-xl border"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold">Reset Password</h2>
              <p className="text-sm text-muted-foreground">
                {step === 1
                  ? "Enter your email to reset your password"
                  : step === 2
                    ? "Enter the verification code sent to your email"
                    : "Create a new password"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                  onSubmit={handleSendOtp}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        placeholder="Enter your email"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Code"}
                  </Button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.div
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="pl-9"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <Button onClick={handleVerifyOtp} className="w-full" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify Code"}
                  </Button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="w-full text-sm text-primary hover:underline"
                    disabled={isLoading}
                  >
                    Resend code
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.form
                  key="password-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                  onSubmit={handleResetPassword}
                >
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={handlePasswordChange}
                        className="pl-9"
                        placeholder="Enter new password"
                        disabled={isLoading}
                      />
                    </div>
                    {newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Password strength:</span>
                          <span className={passwordStrength.score >= 3 ? "text-green-500" : "text-orange-500"}>
                            {passwordStrength.feedback}
                          </span>
                        </div>
                        <Progress
                          value={(passwordStrength.score / 4) * 100}
                          className={getStrengthColor(passwordStrength.score)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-9"
                        placeholder="Confirm new password"
                        disabled={isLoading}
                      />
                    </div>
                    {confirmPassword && (
                      <div className="flex items-center gap-2 text-sm">
                        {newPassword === confirmPassword ? (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-destructive" />
                            <span className="text-destructive">Passwords do not match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}

