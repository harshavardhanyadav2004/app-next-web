"use client"

import React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { SiteHeader } from "../components/site-header"
import { Footer } from "../components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Phone, Mail, User, Lock, UserCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { signUp, verifyOTP, resendOTP } from "@/lib/auth-service"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

type FormErrors = {
  userName?: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNo?: string
  password?: string
  confirmPassword?: string
}

export default function Register() {
  const { toast } = useToast()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    password: "",
    confirmPassword: "",
  })
  const [otp, setOtp] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Listen for auth state changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)
      }
    })

    return () => unsubscribe()
  }, [])

  const validateForm = () => {
    const newErrors: FormErrors = {}
    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required"
    } else if (formData.userName.length < 3) {
      newErrors.userName = "Username must be at least 3 characters"
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.phoneNo.trim()) {
      newErrors.phoneNo = "Phone number is required"
    } else if (!/^\d{10}$/.test(formData.phoneNo)) {
      newErrors.phoneNo = "Phone number must be 10 digits"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    console.log(Object.keys(newErrors).length)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)
      try {
        // Create user with Firebase
        const userData = {
          username: formData.userName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNo: formData.phoneNo,
          emailVerified: false,
        }
        console.log(userData)
        const user = await signUp(formData.email, formData.password, userData)
        console.log(user)
        setUserId(user.uid)

        const maskedEmail = formData.email.replace(/(\w{3})[\w.-]+@([\w.]+)/, "$1***@$2")
        toast({
          title: "OTP Sent!",
          description: `A verification code has been sent to ${maskedEmail}`,
        })
        setStep(2)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred during registration.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleOtpChange = (value: string) => {
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setOtp(value)
    }
  }

  const handleVerifyOtp = async () => {
    if (!userId) {
      toast({ title: "Error", description: "User ID not found.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const verified = await verifyOTP(userId, otp)
      if (verified) {
        toast({
          title: "Success!",
          description: "Your email has been verified successfully.",
        })

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        toast({
          title: "Error",
          description: "Invalid OTP. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during verification.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!userId) {
      toast({ title: "Error", description: "User ID not found.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      resendOTP(userId, formData.email)
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

  // Rest of your component JSX remains the same, just update the OTP input to use single input
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-8 bg-background/80 backdrop-blur-md p-8 rounded-xl border"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Or{" "}
                <Link href="/signin" className="font-medium text-primary hover:underline">
                  sign in to your existing account
                </Link>
              </p>
            </div>

            {step === 1 ? (
              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userName">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="userName"
                        className="pl-9"
                        value={formData.userName}
                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.userName && <p className="text-sm text-destructive mt-1">{errors.userName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          className="pl-9"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="lastName"
                          className="pl-9"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-9"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phoneNo">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNo"
                        className="pl-9"
                        value={formData.phoneNo}
                        onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.phoneNo && <p className="text-sm text-destructive mt-1">{errors.phoneNo}</p>}
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        className="pl-9"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="pl-9"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending OTP..." : "Sign Up"}
                </Button>
              </form>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Enter Verification Code</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a code to {formData.email.replace(/(\w{3})[\w.-]+@([\w.]+)/, "$1***@$2")}
                  </p>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    className="text-center text-lg"
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    placeholder="Enter 6-digit code"
                    disabled={isLoading}
                  />
                </div>

                <Button onClick={handleVerifyOtp} className="w-full" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                  >
                    Resend
                  </button>
                </p>
              </motion.div>
            )}
          </motion.div>
        </section>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}

