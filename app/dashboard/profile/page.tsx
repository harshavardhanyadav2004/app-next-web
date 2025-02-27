"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Camera, Mail, Key, Phone, Check,  Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase"
import {  updateUserdata, updateUserProfile } from "@/lib/auth-service"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { generateOTP, sendOTPEmail } from "@/lib/email-service"
import { Dialog,  DialogContent, DialogHeader,DialogTitle,DialogDescription,DialogFooter,} from "@/components/ui/dialog"
import { EmailAuthProvider,  reauthenticateWithCredential,  verifyBeforeUpdateEmail } from "firebase/auth"
export default function ProfilePage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [otp, setOtp] = useState("")
  const [profileImage, setProfileImage] = useState<string>("/placeholder.svg")
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false)
  const [profile, setProfile] = useState({
   username: "",firstName: "", lastName: "",email: "", phoneNo: "",})
  const router = useRouter() 
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [password, setPassword] = useState("")
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser
      if (!user) return
      try {const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setProfile({
            username: userData.username || "",
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: user.email || "",
            phoneNo: userData.phoneNo || "",
          })
          setProfileImage(userData.photoURL || "/placeholder.svg")
          setIsEmailVerified(user.emailVerified)
        }
      } catch (error) {console.error("Error fetching user data:", error)}}
    fetchUserData()
  }, [])
  const handleNavigate = () => {
    router.push("/dashboard") 
  }
  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/ 
    return phoneRegex.test(phone)
  }
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const user = auth.currentUser
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile picture.",
        variant: "destructive",
      })
      return}
    setIsLoading(true)
    try {
      const result = await updateUserProfile(user, {}, file)
      setProfileImage(result.photoURL || "/placeholder.svg")
      toast({
        title: "Success!",
        description: "Profile picture updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile picture.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }
  const handleSendOtp = async () => {
    if (!profile.email) {
      toast({ title: "Error", description: "Please enter an email first.", variant: "destructive" })
      return
    }
    if(profile.email == auth.currentUser?.email) {
      setIsEmailVerified(true)
      toast({ title: "Error", description: "You cannot update your email.", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      const otp = await generateOTP()
      if(!isOtpSent){
      sendOTPEmail(profile.email, otp)
      setPendingEmail(null)
      setDoc(doc(db,"updateProfile",profile.email),{
        otp,
        expires: Date.now() + 10 * 60 * 1000,
        createdAt: new Date().toISOString(),
      }) 
      setIsOtpSent(true)
      toast({ title: "OTP Sent!", description: "Check your email for the verification code." })  
      return
    }
    handleResendOtp()  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleResendOtp = async () => {
    setIsLoading(true)
    try {
      const otp = await generateOTP()
      sendOTPEmail(profile.email, otp)
      setPendingEmail(null)
      updateDoc(doc(db,"updateProfile",profile.email),{
        otp,
        expires: Date.now() + 10 * 60 * 1000,
        createdAt: new Date().toISOString(),
      })
      setIsOtpSent(true)
      toast({
        title: "OTP Resent!",
        description: "A new verification code has been sent to your email.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      toast({
        title: "Error",
        description: errorMessage,
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
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const docRef = doc(db,"updateProfile",profile.email)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        throw new Error("User not found")
      }
      const { otp: Constotp, expires } = docSnap.data()
      if (otp === Constotp && expires > Date.now()) {
        setIsEmailVerified(true)
        setIsOtpSent(false)
        setPendingEmail(null)
        setOtp("")
        toast({ title: "Success!", description: "Email verified successfully." })
      } else {
        toast({ title: "Error", description: "Invalid OTP. Please try again.", variant: "destructive" })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEmailVerified) {
      toast({
        title: "Error",
        description: "Please verify your email first.",
        variant: "destructive",
      })
      return
    }
    if (!validatePhoneNumber(profile.phoneNo)) {
      toast({
        title: "Invalid Phone Number",
        description: "Enter a valid 10-digit mobile number.",
        variant: "destructive",
      })
      return
    }
    const user = auth.currentUser
    if(user && (user.email!==profile.email)){
        setShowPasswordDialog(true) 
        return
    }
   if (user)updateUserdata(user.uid, profile)
    handleNavigate()
  }

  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter your password.",
        variant: "destructive",
      })
      return
    }
    setIsVerifyingPassword(true)
    try {
      const user = auth.currentUser
      if (!user || !user.email) {
        throw new Error("No authenticated user found")
      }
      const credential = EmailAuthProvider.credential(user.email, password)
      reauthenticateWithCredential(user, credential)
      setPendingEmail(profile.email);
      await handleProfileUpdate()
      setShowPasswordDialog(false)
      setPassword("")
    } catch (error) {
      console.error("Password verification error:", error)
      toast({
        title: "Authentication Error",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingPassword(false)
    }
  }
  const handleProfileUpdate = async () => {
    setIsLoading(true)
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("User is not authenticated.")
      }
      await updateDoc(doc(db, "users", user.uid), {
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNo: profile.phoneNo,
      })
      if (user.email !== profile.email) {
        await updateDoc(doc(db, "users", user.uid), {
          pendingEmail: profile.email,
        });
        await verifyBeforeUpdateEmail(user, profile.email);
        setTimeout(() => {
          toast({
            title: "Verify your new email",
            description: `A verification link has been sent to ${profile.email}. Please verify before proceeding.`,
          });
        }, 1000);
        await updateDoc(doc(db, "users", user.uid), {
          pendingEmail: null,
          email: profile.email   }); 
           return;  }
      toast({
        title: "Success!",
        description: "Profile updated successfully.",})
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error 
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="container max-w-2xl py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 bg-background/80 backdrop-blur-md p-8 rounded-xl border"
      >
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold">Update Profile</h2>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="flex justify-center">
            <div
              className="relative"
              onMouseEnter={() => setIsHoveringAvatar(true)}
              onMouseLeave={() => setIsHoveringAvatar(false)}
            >
              <Avatar className="h-32 w-32 cursor-pointer" onClick={triggerFileInput}>
                <AvatarImage src={profileImage} alt="Profile" />
                <AvatarFallback>
                  {profile.firstName && profile.lastName ? `${profile.firstName[0]}${profile.lastName[0]}` : "U"}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {isHoveringAvatar && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full"
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  value={profile.email}
                  onChange={(e) => {
                    setProfile({ ...profile, email: e.target.value })
                    setIsEmailVerified(false)
                  }}
                  disabled={isEmailVerified} />
              </div>
              {!isEmailVerified && (
                <Button
                  type="button"
                  variant={isOtpSent ? "outline" : "default"}
                  onClick={handleSendOtp}
                  disabled={!profile.email  || pendingEmail!==null|| isLoading}
                >
                  {isOtpSent ? "Resend" : "Verify"}
                </Button>
              )}
            </div>
            {isEmailVerified && (
              <div className="flex items-center gap-2 text-sm text-green-500">
                <Check className="h-4 w-4" />
                <span>Email verified</span>
              </div>
            )}
          </div>

          <AnimatePresence>
            {isOtpSent && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <Label htmlFor="otp">Verification Code</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-9"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                  </div>
                  <Button type="button" onClick={handleVerifyOtp} disabled={!otp || isLoading}>
                    Submit
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-2">
            <Label htmlFor="phoneNo">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phoneNo"
                value={profile.phoneNo}
                onChange={(e) => setProfile({ ...profile, phoneNo: e.target.value })}
                className="pl-9"
                placeholder="Enter 10-digit number"
              /></div></div>
          <Button type="submit" className="w-full" disabled={isLoading || !isEmailVerified} >
            {isLoading ? "Updating..." : "Save Changes"}
          </Button></form>
      </motion.div>
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Password</DialogTitle>
            <DialogDescription>Please enter your password to confirm these changes.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  placeholder="Enter your password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {  e.preventDefault()
                       handleVerifyPassword() }
                  }}
                />  </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false)
                setPassword("")
              }}
              disabled={isVerifyingPassword}
            > Cancel</Button>
            <Button onClick={handleVerifyPassword} disabled={!password || isVerifyingPassword}>
              {isVerifyingPassword ? (
                <> <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying... </>
              ) : (
                "Confirm Changes"
              )} </Button></DialogFooter> </DialogContent></Dialog> </div>)}
