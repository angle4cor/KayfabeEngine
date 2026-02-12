import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let done = false;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (done) return;
      done = true;
      setUser(currentUser);
      setLoading(false);
    });
    const fallback = setTimeout(() => {
      if (done) return;
      done = true;
      setLoading(false);
    }, 3000);
    return () => {
      unsubscribe();
      clearTimeout(fallback);
    };
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout }}>
      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#0a0a0a',
            color: 'var(--color-dim, #888)',
            fontFamily: 'var(--font-body, sans-serif)',
          }}
        >
          Loading…
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
