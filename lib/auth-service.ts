import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, runTransaction } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { auth, db, storage } from "./firebase"
import { generateOTP, sendOTPEmail } from "./email-service"

export type UserData = {
  uid: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  phoneNo?: string
  photoURL?: string
  emailVerified: boolean
}
interface UserProfile {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
}

export const signUp = async (email: string, password: string, userData: Partial<UserData>) => {
  try {
    if (!auth || !db) throw new Error("Firebase not initialized properly.")
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    const otp = await generateOTP()
    sendOTPEmail(email, otp)
    setDoc(doc(db, "users", user.uid), {
      ...userData,
      email,
      uid: user.uid,
      emailVerified: false,
      otpForVerification: otp,
      otpExpires: Date.now() + 10 * 60 * 1000, 
    })
    return user
  } catch (error) {
    console.error("Error signing up:", error)
    throw error
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    await userCredential.user.reload() 
    return auth.currentUser
  } catch (error) {
    throw error
  }
}

export const signOutUser = async () => {
  try {
  signOut(auth)
  } catch (error) {
    throw error
  }
}

export const verifyOTP = (uid: string, otp: string) => {
  return runTransaction(db, async (transaction) => {
    const userDocRef = doc(db, "users", uid)
    const userDoc = await transaction.get(userDocRef)

    if (!userDoc.exists()) return false // Return early if user doesn't exist

    const { otpForVerification, otpExpires, emailVerified } = userDoc.data() || {}

    if (otpForVerification !== otp || otpExpires <= Date.now() || emailVerified) return false

    transaction.update(userDocRef, {
      emailVerified: true,
      otpForVerification: null,
      otpExpires: null,
    })

    return true
  })
}


export const resendOTP = async (uid: string, email: string) => {
  try {
    const otp = await generateOTP()
    await sendOTPEmail(email,otp)

    updateDoc(doc(db, "users", uid), {
      otpForVerification: otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
    })
  } catch (error) {
    throw error
  }
}

export const updateUserProfile = async (user: User, data: Partial<UserData>, imageFile?: File) => {
  try {
    let photoURL = data.photoURL

    if (imageFile) {
      const storageRef = ref(storage, `profile-images/${user.uid}`)
      const snapshot = await uploadBytes(storageRef, imageFile)
      photoURL = await getDownloadURL(snapshot.ref)
    }

    // Update auth profile
   updateProfile(user, {
      displayName: data.username,
      photoURL,
    })

    // Update Firestore document
     updateDoc(doc(db, "users", user.uid), {
      ...data,
      photoURL,
      updatedAt: new Date().toISOString(),
    })

    return { ...data, photoURL }
  } catch (error) {
    throw error
  }
}

export const resetPassword = async (email: string) => {
  try {
    const otp = await generateOTP()
    sendOTPEmail(email, otp)
    setDoc(doc(db, "passwordResets", email), {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    throw error
  }
}

export const verifyResetPasswordOTP = async (email: string, otp: string) => {
  try {
    const resetDocRef = doc(db, "passwordResets", email) // Direct reference
    const resetDoc = await getDoc(resetDocRef)

    if (!resetDoc.exists()) return false // Return early if the document doesn't exist

    const { otp: storedOTP, expires } = resetDoc.data() || {}

    return storedOTP === otp && expires > Date.now()
  } catch (error) {
    console.error("Error verifying OTP:", error)
    throw error
  }
}

export const sendResetPasswordEmail = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    throw error
  }
}

export const updateUserdata = async (userId: string, profile: UserProfile) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      username: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNo: profile.phoneNo,
      email: profile.email, 
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "An error occurred" };
  }
};


