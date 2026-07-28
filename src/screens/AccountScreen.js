// src/screens/AccountScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function AccountScreen() {
  const { user, logout, changePassword, reloadUser } = useAuth();

  // Stan dla zmiany hasła
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleChangePassword = async () => {
    // Walidacja
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Błąd', 'Nowe hasło musi mieć co najmniej 6 znaków.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Błąd', 'Nowe hasła nie są identyczne.');
      return;
    }

    setChangingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setChangingPassword(false);

    if (result.success) {
      Alert.alert('Sukces', 'Hasło zostało zmienione.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordForm(false);
      // Odświeżamy dane użytkownika
      await reloadUser();
    } else {
      Alert.alert('Błąd', result.error || 'Nie udało się zmienić hasła.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Wylogowanie',
      'Czy na pewno chcesz się wylogować?',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Wyloguj', style: 'destructive', onPress: logout },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Nie jesteś zalogowany.</Text>
      </View>
    );
  }

  const subscriptionStatus = user.subscription?.status || 'free';
  const statusLabel = subscriptionStatus === 'active' ? '✅ Aktywna' : '🆓 Darmowa';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profil */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Moje konto</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user.email || 'Brak'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nazwa</Text>
          <Text style={styles.infoValue}>{user.displayName || 'Brak'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Subskrypcja</Text>
          <Text style={[styles.infoValue, subscriptionStatus === 'active' && styles.premiumText]}>
            {statusLabel}
          </Text>
        </View>
        {user.subscription?.plan && user.subscription.plan !== 'free' && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plan</Text>
            <Text style={styles.infoValue}>{user.subscription.plan}</Text>
          </View>
        )}
      </View>

      {/* Zmiana hasła */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowPasswordForm(!showPasswordForm)}
        >
          <Text style={styles.cardTitle}>🔑 Zmień hasło</Text>
          <Text style={styles.toggleIcon}>{showPasswordForm ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showPasswordForm && (
          <View style={styles.passwordForm}>
            <Text style={styles.label}>Aktualne hasło</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Wprowadź aktualne hasło"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <Text style={styles.label}>Nowe hasło</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Nowe hasło (min. 6 znaków)"
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.label}>Potwierdź nowe hasło</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Powtórz nowe hasło"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />

            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.changePasswordButtonText}>Zmień hasło</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Wylogowanie */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>🚪 Wyloguj się</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  premiumText: {
    color: '#2e7d32',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 18,
    color: '#4A90D9',
  },
  passwordForm: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  changePasswordButton: {
    backgroundColor: '#4A90D9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  changePasswordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});