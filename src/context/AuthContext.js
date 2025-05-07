import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = useCallback(async (firebaseUser) => {
    try {
      const ref = doc(db, 'users', firebaseUser.uid);
      let snap = await getDoc(ref);
  
      if (!snap.exists()) {
        await setDoc(ref, {
          email: firebaseUser.email,
          role: 'unassigned',
          firstName: '',
          lastName: '',
          createdAt: new Date().toISOString()
        });
        snap = await getDoc(ref); // Refetch the doc after setting it
      }
  
      return snap.data()?.role || 'unassigned';
    } catch (error) {
      console.error("Error fetching user role:", error);
      return 'unassigned';
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setRole(firebaseUser ? await fetchUserRole(firebaseUser) : null);
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchUserRole]);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};