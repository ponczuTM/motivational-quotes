// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, login } = useAuth();

  // Walidacja adresu email
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Obsługa przycisku "Zaloguj / Zarejestruj"
  const handleSubmit = async () => {
    // Walidacja podstawowa
    if (!email || !password) {
      Alert.alert('Błąd', 'Wypełnij wszystkie wymagane pola.');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Błąd', 'Podaj poprawny adres email.');
      return;
    }

    if (isRegister) {
      // Rejestracja
      if (!displayName) {
        Alert.alert('Błąd', 'Podaj nazwę użytkownika.');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Błąd', 'Hasło musi mieć co najmniej 6 znaków.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Błąd', 'Hasła nie są identyczne.');
        return;
      }

      setLoading(true);
      const result = await register(email, displayName, password);
      setLoading(false);

      if (!result.success) {
        Alert.alert('Błąd rejestracji', result.error);
      }
    } else {
      // Logowanie
      setLoading(true);
      const result = await login(email, password);
      setLoading(false);

      if (!result.success) {
        Alert.alert('Błąd logowania', result.error);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>motivational-quotes</Text>
          <Text style={styles.subtitle}>
            {isRegister ? 'Załóż nowe konto' : 'Zaloguj się'}
          </Text>

          {/* Pole email */}
          <Text style={styles.label}>Adres email</Text>
          <TextInput
            style={styles.input}
            placeholder="twoj@email.pl"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Pole nazwy użytkownika (tylko przy rejestracji) */}
          {isRegister && (
            <>
              <Text style={styles.label}>Nazwa użytkownika</Text>
              <TextInput
                style={styles.input}
                placeholder="Jan Kowalski"
                value={displayName}
                onChangeText={setDisplayName}
              />
            </>
          )}

          {/* Pole hasła */}
          <Text style={styles.label}>Hasło</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Pole potwierdzenia hasła (tylko przy rejestracji) */}
          {isRegister && (
            <>
              <Text style={styles.label}>Potwierdź hasło</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </>
          )}

          {/* Przycisk główny */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isRegister ? 'Zarejestruj się' : 'Zaloguj się'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Przełącznik trybu */}
          <TouchableOpacity
            onPress={() => {
              setIsRegister(!isRegister);
              // Czyścimy pola przy przełączaniu
              setPassword('');
              setConfirmPassword('');
            }}
          >
            <Text style={styles.switchText}>
              {isRegister
                ? 'Masz już konto? Zaloguj się'
                : 'Nie masz konta? Zarejestruj się'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4A90D9',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#4A90D9',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  switchText: {
    color: '#4A90D9',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
  },
});