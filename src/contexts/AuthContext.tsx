"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithRedirect } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { seedMovements, seedTemplates } from "@/lib/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentLocalUser) => {
      if (currentLocalUser) {
        setUser(currentLocalUser);
        
        // Check if user is newly created or needs seeding
        const userDocRef = doc(db, "users", currentLocalUser.uid, "_metadata", "seeded");
        const docSnap = await getDoc(userDocRef);
        
        if (!docSnap.exists()) {
          try {
            await seedMovements(currentLocalUser.uid);
            await seedTemplates(currentLocalUser.uid);
            await setDoc(userDocRef, { seededAt: Date.now() });
          } catch (e) {
            console.error("Error seeding initial data:", e);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider);
      } else {
        console.error("Login error", error);
        throw error;
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
