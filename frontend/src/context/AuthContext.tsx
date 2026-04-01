import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { app as firebaseApp, auth as firebaseAuth, firebaseInitialized } from "../lib/firebase";
import { supabase } from "../lib/supabase";
import { USE_FIREBASE } from "../lib/config";
import { User } from "../../types";

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => Promise<void>;
    refreshUser: (userData: User) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const saved = localStorage.getItem("user");
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => setLoading(false), 5000);

        if (USE_FIREBASE && firebaseInitialized && firebaseAuth && firebaseApp) {
            try {
                const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
                    clearTimeout(timeout);
                    if (fbUser) {
                        try {
                            const { doc, getDoc, getFirestore } = await import("firebase/firestore");
                            const fs = getFirestore(firebaseApp);
                            const snap = await getDoc(doc(fs, "users", fbUser.uid));
                            const userData = snap.exists()
                                ? (snap.data() as User)
                                : { id: fbUser.uid, email: fbUser.email || "", name: fbUser.displayName || fbUser.email?.split("@")[0] || "User", role: "user", joinedAt: Date.now() } as User;
                            setUser(userData);
                            localStorage.setItem("user", JSON.stringify(userData));
                        } catch {
                            const fallback = { id: fbUser.uid, email: fbUser.email || "", name: fbUser.displayName || fbUser.email?.split("@")[0] || "User", role: "user", joinedAt: Date.now() } as User;
                            setUser(fallback);
                            localStorage.setItem("user", JSON.stringify(fallback));
                        }
                    } else {
                        if (!localStorage.getItem("token")) {
                            setUser(null);
                            localStorage.removeItem("user");
                        }
                    }
                    setLoading(false);
                });
                return () => { unsubscribe(); clearTimeout(timeout); };
            } catch {
                clearTimeout(timeout);
                const t = localStorage.getItem("token");
                const u = localStorage.getItem("user");
                if (t && u) { try { setUser(JSON.parse(u)); setToken(t); } catch {} }
                setLoading(false);
            }
        } else if (!USE_FIREBASE) {
            clearTimeout(timeout);
            const client = supabase;
            if (!client) {
                const t = localStorage.getItem("token");
                const u = localStorage.getItem("user");
                if (t && u) { try { setUser(JSON.parse(u)); setToken(t); } catch {} }
                setLoading(false);
                return;
            }
            const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
                if (session?.user) {
                    const { data: row } = await client.from("users").select("*").eq("id", session.user.id).single();
                    const formatted = row
                        ? (row as User)
                        : { id: session.user.id, email: session.user.email || "", name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User", role: "user", joinedAt: Date.now() } as User;
                    setUser(formatted);
                    localStorage.setItem("user", JSON.stringify(formatted));
                } else {
                    if (!localStorage.getItem("token")) {
                        setUser(null);
                        setToken(null);
                        localStorage.removeItem("user");
                        localStorage.removeItem("token");
                    }
                }
                setLoading(false);
            });
            return () => { subscription.unsubscribe(); clearTimeout(timeout); };
        } else {
            clearTimeout(timeout);
            const t = localStorage.getItem("token");
            const u = localStorage.getItem("user");
            if (t && u) { try { setUser(JSON.parse(u)); setToken(t); } catch {} }
            setLoading(false);
        }

        return () => clearTimeout(timeout);
    }, []);

    const login = useCallback((newToken: string, userData: User) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    }, []);

    const refreshUser = useCallback((userData: User) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
        try {
            if (USE_FIREBASE && firebaseAuth) await firebaseSignOut(firebaseAuth);
            else if (!USE_FIREBASE && supabase) await supabase.auth.signOut();
        } catch (err) {
            console.error("AuthContext: Logout error:", err);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
