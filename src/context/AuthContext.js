// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebaseConfig';
import { ref, get, set, push, query, orderByChild, equalTo, update } from 'firebase/database';
import { hashPassword } from '../utils/hash';

// Tworzymy kontekst
const AuthContext = createContext();

// Hook ułatwiający korzystanie z kontekstu
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // Przechowuje dane zalogowanego użytkownika
  const [loading, setLoading] = useState(true); // Czy aplikacja sprawdza sesję

  // Funkcja ładująca dane użytkownika na podstawie userId z AsyncStorage
  const loadUser = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('@motivational_quotes_userId');
      if (storedUserId) {
        const userRef = ref(database, `users/${storedUserId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUser({ ...userData, uid: storedUserId });
        } else {
          // Jeśli użytkownik nie istnieje w bazie, czyścimy zapisaną sesję
          await AsyncStorage.removeItem('@motivational_quotes_userId');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Błąd ładowania sesji:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Przy pierwszym uruchomieniu ładujemy zapisaną sesję
  useEffect(() => {
    loadUser();
  }, []);

  // ----- REJESTRACJA -----
  const register = async (email, displayName, password) => {
    try {
      // 1. Sprawdzamy, czy użytkownik o takim emailu już istnieje
      const usersRef = ref(database, 'users');
      const emailQuery = query(usersRef, orderByChild('email'), equalTo(email));
      const snapshot = await get(emailQuery);

      if (snapshot.exists()) {
        throw new Error('Użytkownik z tym adresem email już istnieje.');
      }

      // 2. Haszujemy hasło
      const passwordHash = await hashPassword(password);

      // 3. Tworzymy nowy wpis w bazie z unikalnym ID
      const newUserRef = push(usersRef);
      const userId = newUserRef.key;

      const newUser = {
        email: email.trim(),
        displayName: displayName.trim(),
        passwordHash: passwordHash,
        createdAt: new Date().toISOString(),
        subscription: {
          status: 'free',
          plan: 'free',
          stripeCustomerId: '',
          stripeSubscriptionId: '',
          currentPeriodEnd: '',
        },
      };

      await set(newUserRef, newUser);

      // 4. Zapisujemy sesję
      await AsyncStorage.setItem('@motivational_quotes_userId', userId);
      setUser({ ...newUser, uid: userId });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ----- LOGOWANIE -----
  const login = async (email, password) => {
    try {
      // 1. Szukamy użytkownika po emailu
      const usersRef = ref(database, 'users');
      const emailQuery = query(usersRef, orderByChild('email'), equalTo(email.trim()));
      const snapshot = await get(emailQuery);

      if (!snapshot.exists()) {
        throw new Error('Nie znaleziono użytkownika z tym adresem email.');
      }

      // 2. Pobieramy dane użytkownika (zakładamy, że email jest unikalny)
      let userData = null;
      let userId = null;
      snapshot.forEach((childSnapshot) => {
        userData = childSnapshot.val();
        userId = childSnapshot.key;
      });

      // 3. Sprawdzamy hasło
      const hashedInput = await hashPassword(password);
      if (userData.passwordHash !== hashedInput) {
        throw new Error('Nieprawidłowe hasło.');
      }

      // 4. Zapisujemy sesję
      await AsyncStorage.setItem('@motivational_quotes_userId', userId);
      setUser({ ...userData, uid: userId });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ----- WYLOGOWANIE -----
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@motivational_quotes_userId');
      setUser(null);
    } catch (error) {
      console.error('Błąd wylogowania:', error);
    }
  };

  // ----- ZMIANA HASŁA (z reautoryzacją) -----
  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!user) {
        throw new Error('Nie jesteś zalogowany.');
      }

      // 1. Sprawdzamy aktualne hasło
      const hashedCurrent = await hashPassword(currentPassword);
      if (user.passwordHash !== hashedCurrent) {
        throw new Error('Aktualne hasło jest nieprawidłowe.');
      }

      // 2. Haszujemy nowe hasło
      const hashedNew = await hashPassword(newPassword);

      // 3. Aktualizujemy w bazie
      const userRef = ref(database, `users/${user.uid}`);
      await update(userRef, { passwordHash: hashedNew });

      // 4. Aktualizujemy stan
      setUser((prev) => ({ ...prev, passwordHash: hashedNew }));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ----- AKTUALIZACJA SUBSKRYPCJI (dla zakładki Subskrypcja) -----
  const updateSubscription = async (status, plan = 'premium_monthly') => {
    try {
      if (!user) {
        throw new Error('Nie jesteś zalogowany.');
      }

      const userRef = ref(database, `users/${user.uid}/subscription`);
      await update(userRef, {
        status: status,
        plan: plan,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 dni
      });

      // Aktualizujemy stan lokalny
      setUser((prev) => ({
        ...prev,
        subscription: {
          ...prev.subscription,
          status: status,
          plan: plan,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Wartości udostępniane przez kontekst
  const value = {
    user,
    loading,
    register,
    login,
    logout,
    changePassword,
    updateSubscription,
    reloadUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};