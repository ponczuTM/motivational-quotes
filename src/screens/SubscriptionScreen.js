// src/screens/SubscriptionScreen.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
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
  gold: '#F4B740',
  goldSoft: '#FFF3D9',
  white: '#FFFFFF',
  danger: '#D95C4F',
  dangerSoft: '#FDEAE7',
};

const PREMIUM_PRICE = '29,99 zł / miesiąc';

export default function SubscriptionScreen() {
  const { user, updateSubscription, reloadUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const isPremiumActive = user?.subscription?.status === 'active';

  const formattedEndDate = useMemo(() => {
    if (!user?.subscription?.currentPeriodEnd) {
      return null;
    }

    try {
      return new Date(user.subscription.currentPeriodEnd).toLocaleDateString(
        'pl-PL'
      );
    } catch (error) {
      return null;
    }
  }, [user?.subscription?.currentPeriodEnd]);

  const benefits = [
    'Pełny dostęp do treści premium każdego dnia',
    'Ekskluzywne cytaty i refleksje',
    'Dodatkowe pytania do głębszej pracy',
    'Wsparcie autorów',
    'Brak reklam',
  ];

  const handlePurchase = async () => {
    if (isPremiumActive) {
      Alert.alert('Informacja', 'Masz już aktywną subskrypcję Premium.');
      return;
    }

    try {
      setLoading(true);
      const result = await updateSubscription('active', 'premium_monthly');

      if (result.success) {
        Alert.alert(
          '🎉 Sukces!',
          'Twoja subskrypcja Premium została aktywowana.'
        );
        await reloadUser();
      } else {
        Alert.alert(
          'Błąd',
          result.error || 'Nie udało się aktywować subskrypcji.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

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
            try {
              setLoading(true);
              const result = await updateSubscription('free', 'free');

              if (result.success) {
                Alert.alert(
                  'Subskrypcja anulowana',
                  'Twoje konto zostało zmienione na darmowe.'
                );
                await reloadUser();
              } else {
                Alert.alert(
                  'Błąd',
                  result.error || 'Nie udało się anulować subskrypcji.'
                );
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIconWrap}>
            <MaterialCommunityIcons
              name="crown-outline"
              size={34}
              color={COLORS.gold}
            />
          </View>

          <Text style={styles.title}>Subskrypcja Premium</Text>

          <Text style={styles.subtitle}>
            {isPremiumActive
              ? 'Masz dostęp do wszystkich treści premium i dodatkowych materiałów.'
              : 'Odblokuj więcej inspiracji, refleksji i spokojnej przestrzeni tylko dla siebie.'}
          </Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusTopRow}>
            <View>
              <Text style={styles.statusLabel}>TWÓJ OBECNY PLAN</Text>
              <Text style={styles.statusValue}>
                {isPremiumActive ? 'Premium' : 'Darmowy'}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                isPremiumActive ? styles.statusBadgeActive : styles.statusBadgeFree,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isPremiumActive
                    ? styles.statusBadgeTextActive
                    : styles.statusBadgeTextFree,
                ]}
              >
                {isPremiumActive ? 'AKTYWNY' : 'FREE'}
              </Text>
            </View>
          </View>

          {isPremiumActive && formattedEndDate ? (
            <Text style={styles.statusDescription}>
              Twój dostęp premium jest obecnie aktywny. Plan ważny do{' '}
              {formattedEndDate}.
            </Text>
          ) : (
            <Text style={styles.statusDescription}>
              Korzystasz obecnie z darmowej wersji aplikacji.
            </Text>
          )}
        </View>

        <View style={styles.offerCard}>
          <View style={styles.offerHeader}>
            <View style={styles.offerIconWrap}>
              <MaterialCommunityIcons
                name="star-four-points-outline"
                size={24}
                color={COLORS.coral}
              />
            </View>

            <Text style={styles.offerTitle}>Premium</Text>
          </View>

          <Text style={styles.offerPrice}>{PREMIUM_PRICE}</Text>

          <Text style={styles.offerDescription}>
            Wybierz plan, który daje Ci pełny dostęp do dodatkowych treści i
            bardziej rozbudowanych materiałów każdego dnia.
          </Text>

          <View style={styles.benefitList}>
            {benefits.map((benefit) => (
              <View key={benefit} style={styles.benefitRow}>
                <View style={styles.benefitIconWrap}>
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color={COLORS.green}
                  />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {!isPremiumActive ? (
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handlePurchase}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="crown"
                    size={18}
                    color={COLORS.white}
                  />
                  <Text style={styles.primaryButtonText}>Aktywuj Premium</Text>
                </>
              )}
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleCancel}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="close-circle-outline"
                    size={18}
                    color={COLORS.white}
                  />
                  <Text style={styles.secondaryButtonText}>
                    Anuluj subskrypcję
                  </Text>
                </>
              )}
            </Pressable>
          )}

          <Text style={styles.note}>
            To jest wersja testowa. W docelowej aplikacji płatność byłaby
            obsługiwana przez zewnętrzny system, np. Stripe.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoTopRow}>
            <View style={styles.infoIconWrap}>
              <MaterialCommunityIcons
                name="information-outline"
                size={22}
                color={COLORS.coralDark}
              />
            </View>

            <Text style={styles.infoTitle}>Jak to działa?</Text>
          </View>

          <Text style={styles.infoText}>
            Subskrypcja Premium odblokowuje dodatkowe treści w aplikacji i
            rozszerza codzienne materiały o więcej inspiracji, refleksji i pytań
            do pracy własnej.
          </Text>

          <Text style={styles.infoText}>
            W tej wersji testowej przycisk aktywacji zmienia status konta
            bezpośrednio w bazie danych, bez przechodzenia przez prawdziwy proces
            płatności.
          </Text>
        </View>

        <View style={styles.reminderCard}>
          <View style={styles.reminderIconWrap}>
            <MaterialCommunityIcons
              name="heart-pulse"
              size={24}
              color={COLORS.green}
            />
          </View>

          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>Spokojnie i elastycznie</Text>
            <Text style={styles.reminderText}>
              Premium ma wspierać Twoją codzienność, a nie tworzyć presję. Plan
              możesz aktywować lub anulować wtedy, kiedy będzie to dla Ciebie
              dobre.
            </Text>
          </View>
        </View>
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
    backgroundColor: COLORS.goldSoft,
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

  statusCard: {
    marginTop: 26,
    borderWidth: 1,
    borderColor: '#F1DDD2',
    borderRadius: 22,
    backgroundColor: '#FFF9F5',
    padding: 18,
  },

  statusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statusLabel: {
    color: COLORS.coralDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  statusValue: {
    marginTop: 5,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
  },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  statusBadgeActive: {
    backgroundColor: COLORS.greenSoft,
  },

  statusBadgeFree: {
    backgroundColor: '#F3ECE8',
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  statusBadgeTextActive: {
    color: '#377850',
  },

  statusBadgeTextFree: {
    color: '#8C8079',
  },

  statusDescription: {
    marginTop: 14,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  offerCard: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    padding: 20,
  },

  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  offerIconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.coralLight,
    marginRight: 12,
  },

  offerTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
  },

  offerPrice: {
    marginTop: 16,
    color: COLORS.coralDark,
    fontSize: 18,
    fontWeight: '900',
  },

  offerDescription: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  benefitList: {
    marginTop: 18,
    gap: 10,
  },

  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  benefitIconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.greenSoft,
    marginRight: 10,
    marginTop: 1,
  },

  benefitText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },

  primaryButton: {
    marginTop: 22,
    minHeight: 56,
    borderRadius: 17,
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

  primaryButtonText: {
    marginLeft: 8,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },

  secondaryButton: {
    marginTop: 22,
    minHeight: 56,
    borderRadius: 17,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  secondaryButtonText: {
    marginLeft: 8,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },

  note: {
    marginTop: 14,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },

  infoCard: {
    marginTop: 18,
    borderRadius: 20,
    backgroundColor: '#FFF4EC',
    padding: 18,
  },

  infoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: COLORS.white,
    marginRight: 10,
  },

  infoTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '900',
  },

  infoText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  reminderCard: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 18,
    borderRadius: 19,
    backgroundColor: COLORS.greenSoft,
    padding: 16,
  },

  reminderIconWrap: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: COLORS.white,
    marginRight: 12,
  },

  reminderContent: {
    flex: 1,
  },

  reminderTitle: {
    color: '#326747',
    fontSize: 15,
    fontWeight: '900',
  },

  reminderText: {
    marginTop: 4,
    color: '#4D7A5D',
    fontSize: 13,
    lineHeight: 18,
  },
});