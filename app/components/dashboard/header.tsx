"use client";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { removeAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { LogOut,User } from "lucide-react";
import { signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
const DashboardHeader = () => {
const [userData, setUserData] = useState<{ firstName: string; lastName: string; photoURL?: string } | null>(null);

useEffect(() => {
  const getUserData = async () => {
    const data = await fetchUser();
    if (data) setUserData(data);
  };

  getUserData();
}, []);

  const router = useRouter();

  const handleLogout = async() => {
    await signOut(auth);
    removeAuthToken();
    router.push("/signin");
  };
  const fetchUser = async () => {
    const user = auth.currentUser;
    if (!user) return null;
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const userData = docSnap.data();
    if (userData && typeof userData.firstName === 'string' && typeof userData.lastName === 'string') {
        return {
            firstName: userData.firstName,
            lastName: userData.lastName,
            photoURL: userData.photoURL,
        };
    }
    return null; 
};
const getInitials = (firstName?: string, lastName?: string) => {
  const firstInitial = firstName?.charAt(0)?.toUpperCase() || "";
  const lastInitial = lastName?.charAt(0)?.toUpperCase() || "";
  return `${firstInitial}${lastInitial}` || ""; 
};
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h1 className="text-xl font-bold">CodeLoomer</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <Avatar className="h-10 w-10">
              <AvatarImage src=""/>
              <AvatarFallback>{getInitials(userData?.firstName, userData?.lastName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export { DashboardHeader };

