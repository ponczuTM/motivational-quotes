// src/screens/AccountScreen.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  background: '#FCF4EC',
  surface: '#FFFDFB',
  coral: '#FF7A45',
  coralDark: '#E96332',
  coralLight: '#FFE5D8',
  text: '#20252D',
  textSecondary: '#676B72',
  muted: '#A8A0A0',
  border: '#F1E5DD',
  green: '#4EA66E',
  greenSoft: '#E7F4EA',
  blue: '#4A9BD4',
  blueSoft: '#E9F4FC',
  white: '#FFFFFF',
  danger: '#D95C4F',
  dangerSoft: '#FDEAE7',
};

export default function AccountScreen() {
  const { user, logout, changePassword, reloadUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const subscriptionStatus = user?.subscription?.status || 'free';
  const isPremiumActive = subscriptionStatus === 'active';

  const subscriptionLabel = useMemo(() => {
    return isPremiumActive ? 'Premium aktywne' : 'Plan darmowy';
  }, [isPremiumActive]);

  const planLabel = useMemo(() => {
    if (!user?.subscription?.plan || user.subscription.plan === 'free') {
      return 'Darmowy';
    }

    return user.subscription.plan;
  }, [user?.subscription?.plan]);

  const handleChangePassword = async () => {
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

    try {
      setChangingPassword(true);

      const result = await changePassword(currentPassword, newPassword);

      if (result.success) {
        Alert.alert('Sukces', 'Hasło zostało zmienione.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowPasswordForm(false);
        await reloadUser();
      } else {
        Alert.alert('Błąd', result.error || 'Nie udało się zmienić hasła.');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Wylogowanie', 'Czy na pewno chcesz się wylogować?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Wyloguj', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) {
    return (
      <ScreenContainer>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.centered}>
          <View style={styles.emptyIconWrap}>
            <MaterialCommunityIcons
              name="account-off-outline"
              size={30}
              color={COLORS.coral}
            />
          </View>
          <Text style={styles.emptyTitle}>Nie jesteś zalogowany</Text>
          <Text style={styles.emptyText}>
            Zaloguj się, aby zobaczyć dane konta i ustawienia profilu.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerIconWrap}>
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={36}
              color={COLORS.coral}
            />
          </View>

          <Text style={styles.title}>Moje konto</Text>

          <Text style={styles.subtitle}>
            Tutaj sprawdzisz dane profilu, status subskrypcji i ustawienia
            bezpieczeństwa.
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View>
              <Text style={styles.profileLabel}>TWOJE KONTO</Text>
              <Text style={styles.profileName}>
                {user.displayName || 'Użytkownik'}
              </Text>
            </View>

            <View
              style={[
                styles.planBadge,
                isPremiumActive ? styles.planBadgeActive : styles.planBadgeFree,
              ]}
            >
              <Text
                style={[
                  styles.planBadgeText,
                  isPremiumActive
                    ? styles.planBadgeTextActive
                    : styles.planBadgeTextFree,
                ]}
              >
                {isPremiumActive ? 'PREMIUM' : 'FREE'}
              </Text>
            </View>
          </View>

          <View style={styles.infoList}>
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
              <Text
                style={[
                  styles.infoValue,
                  isPremiumActive && styles.infoValuePremium,
                ]}
              >
                {subscriptionLabel}
              </Text>
            </View>

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>Plan</Text>
              <Text style={styles.infoValue}>{planLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.securityCard}>
          <Pressable
            onPress={() => setShowPasswordForm((prev) => !prev)}
            style={({ pressed }) => [
              styles.securityHeader,
              pressed && styles.smallButtonPressed,
            ]}
          >
            <View style={styles.securityHeaderLeft}>
              <View style={styles.securityIconWrap}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={22}
                  color={COLORS.coral}
                />
              </View>

              <View>
                <Text style={styles.securityTitle}>Zmiana hasła</Text>
                <Text style={styles.securitySubtitle}>
                  Zadbaj o bezpieczeństwo swojego konta.
                </Text>
              </View>
            </View>

            <MaterialCommunityIcons
              name={showPasswordForm ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={COLORS.textSecondary}
            />
          </Pressable>

          {showPasswordForm && (
            <View style={styles.passwordForm}>
              <Text style={styles.label}>Aktualne hasło</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="Wprowadź aktualne hasło"
                placeholderTextColor="#A69D98"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
              />

              <Text style={styles.label}>Nowe hasło</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="Nowe hasło (min. 6 znaków)"
                placeholderTextColor="#A69D98"
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />

              <Text style={styles.label}>Potwierdź nowe hasło</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="Powtórz nowe hasło"
                placeholderTextColor="#A69D98"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                autoCapitalize="none"
                onSubmitEditing={handleChangePassword}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.changePasswordButton,
                  pressed && !changingPassword && styles.buttonPressed,
                  changingPassword && styles.buttonDisabled,
                ]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="shield-check-outline"
                      size={18}
                      color={COLORS.white}
                    />
                    <Text style={styles.changePasswordButtonText}>
                      Zmień hasło
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoCardTopRow}>
            <View style={styles.infoCardIconWrap}>
              <MaterialCommunityIcons
                name="information-outline"
                size={22}
                color={COLORS.coralDark}
              />
            </View>

            <Text style={styles.infoCardTitle}>Bezpieczeństwo konta</Text>
          </View>

          <Text style={styles.infoCardText}>
            Silne hasło pomaga lepiej chronić Twoje konto i zapisane dane.
            Dobrze, aby miało co najmniej 6 znaków i nie było używane w innych
            miejscach.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons
            name="logout"
            size={19}
            color={COLORS.white}
          />
          <Text style={styles.logoutButtonText}>Wyloguj się</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  contentContainer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 42,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },

  emptyIconWrap: {
    width: 66,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.coralLight,
  },

  emptyTitle: {
    marginTop: 16,
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  header: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 6,
  },

  headerIconWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: COLORS.coralLight,
  },

  title: {
    marginTop: 16,
    color: COLORS.text,
    fontSize: 27,
    fontWeight: '900',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  profileCard: {
    marginTop: 26,
    borderWidth: 1,
    borderColor: '#F1DDD2',
    borderRadius: 22,
    backgroundColor: '#FFF9F5',
    padding: 18,
  },

  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  profileLabel: {
    color: COLORS.coralDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  profileName: {
    marginTop: 5,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
  },

  planBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  planBadgeActive: {
    backgroundColor: COLORS.greenSoft,
  },

  planBadgeFree: {
    backgroundColor: '#F3ECE8',
  },

  planBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  planBadgeTextActive: {
    color: '#377850',
  },

  planBadgeTextFree: {
    color: '#8C8079',
  },

  infoList: {
    marginTop: 16,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E7E0',
    gap: 16,
  },

  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },

  infoLabel: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },

  infoValue: {
    flex: 1.2,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },

  infoValuePremium: {
    color: COLORS.green,
  },

  securityCard: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    padding: 18,
  },

  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  securityHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },

  securityIconWrap: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: COLORS.coralLight,
    marginRight: 12,
  },

  securityTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },

  securitySubtitle: {
    marginTop: 3,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },

  passwordForm: {
    marginTop: 18,
  },

  label: {
    marginTop: 10,
    marginBottom: 7,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  input: {
    borderWidth: 1,
    borderColor: '#E7DCD5',
    borderRadius: 15,
    backgroundColor: '#FFFEFD',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 15,
  },

  changePasswordButton: {
    marginTop: 18,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.coralDark,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.18,
    shadowRadius: 11,
    elevation: 5,
  },

  changePasswordButtonText: {
    marginLeft: 8,
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
  },

  infoCard: {
    marginTop: 18,
    borderRadius: 20,
    backgroundColor: '#FFF4EC',
    padding: 18,
  },

  infoCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoCardIconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: COLORS.white,
    marginRight: 10,
  },

  infoCardTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '900',
  },

  infoCardText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  logoutButton: {
    marginTop: 20,
    minHeight: 56,
    borderRadius: 17,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  logoutButtonText: {
    marginLeft: 8,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  smallButtonPressed: {
    opacity: 0.75,
  },

  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});