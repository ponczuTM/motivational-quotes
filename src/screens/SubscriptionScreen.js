// src/screens/SubscriptionScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function SubscriptionScreen() {
  const { user, updateSubscription, reloadUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const isPremiumActive = user?.subscription?.status === 'active';

  const handlePurchase = async () => {
    if (isPremiumActive) {
      Alert.alert('Informacja', 'Masz już aktywną subskrypcję Premium.');
      return;
    }

    setLoading(true);
    // Symulacja zakupu – zmieniamy status na 'active'
    const result = await updateSubscription('active', 'premium_monthly');
    setLoading(false);

    if (result.success) {
      Alert.alert('🎉 Sukces!', 'Twoja subskrypcja Premium została aktywowana.');
      await reloadUser(); // Odświeżamy dane użytkownika
    } else {
      Alert.alert('Błąd', result.error || 'Nie udało się aktywować subskrypcji.');
    }
  };

  // Funkcja do anulowania (symulacja)
  const handleCancel = async () => {
    if (!isPremiumActive) {
      Alert.alert('Informacja', 'Nie masz aktywnej subskrypcji do anulowania.');
      return;
    }

    Alert.alert(
      'Anuluj subskrypcję',
      'Czy na pewno chcesz anulować subskrypcję Premium?',
      [
        { text: 'Nie', style: 'cancel' },
        {
          text: 'Anuluj',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const result = await updateSubscription('free', 'free');
            setLoading(false);
            if (result.success) {
              Alert.alert('Subskrypcja anulowana', 'Twoje konto zostało zmienione na darmowe.');
              await reloadUser();
            } else {
              Alert.alert('Błąd', 'Nie udało się anulować subskrypcji.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✨ Subskrypcja Premium</Text>
        <Text style={styles.headerSubtitle}>
          {isPremiumActive
            ? 'Masz dostęp do wszystkich treści premium!'
            : 'Odblokuj pełnię inspiracji'}
        </Text>
      </View>

      {/* Aktualny status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Twój obecny plan</Text>
        <Text style={[styles.statusValue, isPremiumActive ? styles.statusActive : styles.statusFree]}>
          {isPremiumActive ? '✅ Premium' : '🆓 Darmowy'}
        </Text>
        {isPremiumActive && user.subscription?.currentPeriodEnd && (
          <Text style={styles.statusDetail}>
            Ważny do: {new Date(user.subscription.currentPeriodEnd).toLocaleDateString('pl-PL')}
          </Text>
        )}
      </View>

      {/* Oferta Premium */}
      <View style={styles.offerCard}>
        <Text style={styles.offerTitle}>🌟 Premium – 29,99 zł / miesiąc</Text>
        <View style={styles.benefitList}>
          <Text style={styles.benefitItem}>✅ Pełny dostęp do treści premium każdego dnia</Text>
          <Text style={styles.benefitItem}>✅ Ekskluzywne cytaty i refleksje</Text>
          <Text style={styles.benefitItem}>✅ Dodatkowe pytania do głębszej pracy</Text>
          <Text style={styles.benefitItem}>✅ Wsparcie autorów</Text>
          <Text style={styles.benefitItem}>✅ Brak reklam</Text>
        </View>

        {!isPremiumActive ? (
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={handlePurchase}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.purchaseButtonText}>Aktywuj Premium</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.cancelButtonText}>Anuluj subskrypcję</Text>
            )}
          </TouchableOpacity>
        )}

        <Text style={styles.note}>
          * Jest to wersja testowa – w rzeczywistej aplikacji płatność odbywałaby się przez Stripe.
        </Text>
      </View>

      {/* Dodatkowe informacje */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ Jak to działa?</Text>
        <Text style={styles.infoText}>
          Subskrypcja Premium odblokowuje dodatkowe treści w sekcji „Strona Główna”.
          W obecnej wersji testowej przycisk „Aktywuj Premium” natychmiast zmienia
          status Twojego konta w bazie danych Firebase.
        </Text>
      </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 14,
    color: '#888',
  },
  statusValue: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 4,
  },
  statusActive: {
    color: '#2e7d32',
  },
  statusFree: {
    color: '#888',
  },
  statusDetail: {
    fontSize: 14,
    color: '#666',
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 12,
  },
  benefitList: {
    marginVertical: 8,
  },
  benefitItem: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  purchaseButton: {
    backgroundColor: '#f5a623',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: '#eef3fb',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
});