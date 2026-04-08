import { createContext, useContext, useEffect, useState } from "react";
import { getSession, onAuthChange, signOut } from "./supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    getSession().then(setSession);
    const {
      data: { subscription },
    } = onAuthChange(setSession);
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, signOut, loading: session === undefined }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
