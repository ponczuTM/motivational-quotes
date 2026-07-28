// src/screens/HomeScreen.js

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Dimensions,
  RefreshControl,
  StatusBar,
  Platform,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ref, get } from 'firebase/database';

import { useAuth } from '../context/AuthContext';
import { database } from '../../firebaseConfig';
import ScreenContainer from '../components/ScreenContainer';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#FCF4EC',
  surface: '#FFFDFB',
  coral: '#FF7A45',
  coralDark: '#E96332',
  coralLight: '#FFE5D8',
  coralPale: '#FFF1E9',
  text: '#20252D',
  textSecondary: '#676B72',
  muted: '#A8A0A0',
  border: '#F2E6DD',
  green: '#4EA66E',
  greenSoft: '#E7F4EA',
  blue: '#4A9BD4',
  blueSoft: '#E9F4FC',
  purple: '#8A63C8',
  purpleSoft: '#F2EAFE',
  white: '#FFFFFF',
  quote: '#F58552',
  selectedBorder: '#F56E3A',
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=85';

export default function HomeScreen() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);

  const [isQuoteModalVisible, setIsQuoteModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);

  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const fetchTodaysQuote = useCallback(async ({ isRefresh = false } = {}) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const today = getTodayDate();
      const quoteRef = ref(database, `motivational_texts/${today}`);
      const snapshot = await get(quoteRef);

      if (snapshot.exists()) {
        setQuote({
          id: today,
          ...snapshot.val(),
        });
      } else {
        setQuote(null);
        setError('Brak treści na dzisiejszy dzień. Wróć później.');
      }
    } catch (err) {
      console.error('Błąd pobierania cytatu:', err);

      setQuote(null);

      if (err?.code === 'PERMISSION_DENIED') {
        setError('Brak dostępu do treści. Sprawdź reguły Firebase.');
      } else {
        setError(
          'Nie udało się pobrać dzisiejszej treści. Sprawdź połączenie i spróbuj ponownie.'
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTodaysQuote();
  }, [fetchTodaysQuote]);

  const isPremiumActive =
    user?.subscription?.status === 'active' ||
    user?.subscription?.plan === 'premium';

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId);
    setIsFeedbackVisible(true);
  };

  const renderCategory = ({
    id,
    icon,
    label,
    iconColor,
    iconBackground,
  }) => {
    const isSelected = selectedCategory === id;

    return (
      <Pressable
        key={id}
        onPress={() => handleCategoryPress(id)}
        style={({ pressed }) => [
          styles.categoryCard,
          isSelected && styles.categoryCardSelected,
          pressed && styles.categoryCardPressed,
        ]}
      >
        <View
          style={[
            styles.categoryIconWrap,
            { backgroundColor: iconBackground },
            isSelected && styles.categoryIconWrapSelected,
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={33}
            color={iconColor}
          />
        </View>

        <Text
          style={[
            styles.categoryLabel,
            isSelected && styles.categoryLabelSelected,
          ]}
        >
          {label}
        </Text>

        {isSelected && (
          <View style={styles.selectedCheck}>
            <MaterialCommunityIcons
              name="check"
              size={13}
              color={COLORS.white}
            />
          </View>
        )}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        <View style={styles.loadingIconWrap}>
          <MaterialCommunityIcons
            name="heart-outline"
            size={34}
            color={COLORS.coral}
          />
        </View>

        <ActivityIndicator
          size="large"
          color={COLORS.coral}
          style={styles.loader}
        />

        <Text style={styles.loadingText}>
          Przygotowujemy chwilę wsparcia...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        <View style={styles.loadingIconWrap}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={34}
            color={COLORS.coral}
          />
        </View>

        <Text style={styles.errorTitle}>Coś poszło nie tak</Text>

        <Text style={styles.errorText}>{error}</Text>

        <Pressable
          onPress={() => fetchTodaysQuote()}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </Pressable>
      </View>
    );
  }

  if (!quote) {
    return (
      <View style={styles.centered}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        <Text style={styles.errorTitle}>Brak treści na dziś</Text>

        <Text style={styles.errorText}>
          Wróć później po nową porcję wsparcia.
        </Text>
      </View>
    );
  }

  return (
    <ScreenContainer>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTodaysQuote({ isRefresh: true })}
            colors={[COLORS.coral]}
            tintColor={COLORS.coral}
            progressBackgroundColor={COLORS.white}
          />
        }
      >
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.brandIconWrap}>
              <MaterialCommunityIcons
                name="hands-pray"
                size={31}
                color={COLORS.coral}
              />
            </View>

            <View>
              <Text style={styles.brandName}>POMAGAM</Text>
              <Text style={styles.brandTagline}>JESTEŚ WAŻNY</Text>
            </View>
          </View>

          <View style={styles.notificationButton}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={27}
              color={COLORS.text}
            />

            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>1</Text>
            </View>
          </View>
        </View>

        <View style={styles.greetingSection}>
          <View style={styles.greetingTextWrap}>
            <Text style={styles.greeting}>
              Dzień dobry{user?.displayName ? `, ${user.displayName}` : ''}!
            </Text>

            <Text style={styles.greetingSubtitle}>
              Każdego dnia jesteśmy tu, aby Cię wspierać.
            </Text>
          </View>

          <View style={styles.greetingIconWrap}>
            <MaterialCommunityIcons
              name="weather-sunny"
              size={27}
              color="#F6B640"
            />
          </View>
        </View>

        <View style={styles.heroCard}>
          <ImageBackground
            source={{ uri: quote.imageUrl || FALLBACK_IMAGE }}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay} />

            <View style={styles.heroContent}>
              <View style={styles.timeBadge}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={18}
                  color={COLORS.white}
                />

                <Text style={styles.timeBadgeText}>11:11</Text>
              </View>

              <Text style={styles.heroTitle}>
                {quote.title || 'Cytat dnia'}
              </Text>

              <Text style={styles.heroDescription} numberOfLines={3}>
                {quote.summarize ||
                  'Każdego dnia otrzymasz inspirującą treść, która pomoże Ci odnaleźć siłę i spokój.'}
              </Text>

              <Pressable
                onPress={() => setIsQuoteModalVisible(true)}
                style={({ pressed }) => [
                  styles.heroAction,
                  pressed && styles.heroActionPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name="book-open-page-variant-outline"
                  size={19}
                  color={COLORS.coral}
                />

                <Text style={styles.heroActionText}>
                  Przeczytaj dzisiejszy cytat
                </Text>
              </Pressable>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.quoteCard}>
          <MaterialCommunityIcons
            name="format-quote-open"
            size={42}
            color={COLORS.coral}
            style={styles.quoteIcon}
          />

          <Text style={styles.quoteText}>
            {quote.content ||
              'Każdy dzień jest nową szansą, aby zrobić mały krok w stronę życia, którego potrzebujesz.'}
          </Text>

          <View style={styles.quoteFooter}>
            <View style={styles.quoteLine} />

            <Text style={styles.quoteAuthor}>
              {quote.author || 'Cytat dnia'}
            </Text>
          </View>

          <MaterialCommunityIcons
            name="heart-outline"
            size={31}
            color="#D9D0C9"
            style={styles.quoteHeart}
          />
        </View>

        <View style={styles.helpHeader}>
          <Text style={styles.helpTitle}>W czym możemy Ci pomóc?</Text>

          <Text style={styles.helpSubtitle}>
            Wybierz obszar, który jest dziś dla Ciebie ważny.
          </Text>
        </View>

        <View style={styles.categoriesGrid}>
          {renderCategory({
            id: 'direction',
            icon: 'compass-outline',
            label: 'Nie wiem,\nco dalej',
            iconColor: COLORS.coral,
            iconBackground: COLORS.coralLight,
          })}

          {renderCategory({
            id: 'work',
            icon: 'briefcase',
            label: 'Praca i\npieniądze',
            iconColor: COLORS.green,
            iconBackground: COLORS.greenSoft,
          })}

          {renderCategory({
            id: 'daily',
            icon: 'home',
            label: 'Sprawy\ncodzienne',
            iconColor: COLORS.blue,
            iconBackground: COLORS.blueSoft,
          })}

          {renderCategory({
            id: 'change',
            icon: 'target',
            label: 'Chcę coś\nzmienić',
            iconColor: COLORS.purple,
            iconBackground: COLORS.purpleSoft,
          })}
        </View>

        <View style={styles.premiumCard}>
          <View style={styles.premiumHeader}>
            <View style={styles.premiumIconWrap}>
              <MaterialCommunityIcons
                name="diamond-stone"
                size={23}
                color={COLORS.coral}
              />
            </View>

            <View style={styles.premiumHeaderContent}>
              <Text style={styles.premiumTitle}>Przestrzeń Premium</Text>

              <Text style={styles.premiumSubtitle}>
                Dodatkowe wsparcie na każdy dzień.
              </Text>
            </View>
          </View>

          {isPremiumActive ? (
            <View style={styles.premiumUnlocked}>
              <View style={styles.premiumDivider} />

              <Text style={styles.premiumContent}>
                {quote.content_premium ||
                  'Brak dodatkowej treści premium dla dzisiejszego cytatu.'}
              </Text>

              {quote.question ? (
                <View style={styles.reflectionBox}>
                  <MaterialCommunityIcons
                    name="lightbulb-on-outline"
                    size={22}
                    color={COLORS.coralDark}
                    style={styles.reflectionIcon}
                  />

                  <View style={styles.reflectionTextWrap}>
                    <Text style={styles.reflectionLabel}>
                      PYTANIE DO REFLEKSJI
                    </Text>

                    <Text style={styles.reflectionQuestion}>
                      {quote.question}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <Pressable
              onPress={() => {}}
              style={({ pressed }) => [
                styles.premiumButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <View style={styles.premiumButtonLeft}>
                <View style={styles.premiumButtonIconWrap}>
                  <MaterialCommunityIcons
                    name="diamond-stone"
                    size={19}
                    color={COLORS.white}
                  />
                </View>

                <Text style={styles.premiumButtonText}>Kup dostęp Premium</Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={26}
                color={COLORS.white}
              />
            </Pressable>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.chatCard,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => {}}
        >
          <View style={styles.chatContent}>
            <Text style={styles.chatTitle}>Porozmawiaj ze mną</Text>

            <Text style={styles.chatDescription}>
              Opowiedz, co się dzieje.{'\n'}Znajdziemy rozwiązanie razem.
            </Text>
          </View>

          <View style={styles.chatIconCircle}>
            <MaterialCommunityIcons
              name="message-processing"
              size={32}
              color={COLORS.coral}
            />
          </View>
        </Pressable>

        <Text style={styles.dateInfo}>
          Dzisiaj, {quote.publishDate || getTodayDate()}
        </Text>
      </ScrollView>

      <Modal
        visible={isQuoteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsQuoteModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsQuoteModalVisible(false)}
          />

          <View style={styles.quoteModal}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <MaterialCommunityIcons
                  name="book-open-page-variant-outline"
                  size={25}
                  color={COLORS.coral}
                />
              </View>

              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setIsQuoteModalVisible(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.textSecondary}
                />
              </Pressable>
            </View>

            <Text style={styles.modalEyebrow}>CYTAT DNIA</Text>

            <Text style={styles.modalTitle}>
              {quote.title || 'Cytat dnia'}
            </Text>

            <View style={styles.modalQuoteBox}>
              <MaterialCommunityIcons
                name="format-quote-open"
                size={40}
                color={COLORS.coral}
              />

              <Text style={styles.modalQuoteText}>
                {quote.content ||
                  'Każdy dzień jest nową szansą, aby zrobić mały krok w stronę życia, którego potrzebujesz.'}
              </Text>

              <Text style={styles.modalAuthor}>
                {quote.author || 'Cytat dnia'}
              </Text>
            </View>

            {quote.summarize ? (
              <View style={styles.modalSummaryBox}>
                <MaterialCommunityIcons
                  name="leaf-circle-outline"
                  size={23}
                  color={COLORS.green}
                />

                <Text style={styles.modalSummaryText}>{quote.summarize}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={() => setIsQuoteModalVisible(false)}
              style={({ pressed }) => [
                styles.modalCloseMainButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.modalCloseMainButtonText}>Zamknij</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isFeedbackVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFeedbackVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsFeedbackVisible(false)}
          />

          <View style={styles.feedbackModal}>
            <View style={styles.feedbackIconWrap}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={34}
                color={COLORS.coral}
              />
            </View>

            <Text style={styles.feedbackTitle}>Dziękujemy za opinię</Text>

            <Text style={styles.feedbackText}>
              Dobrze wiedzieć, że chcesz być z nami.
            </Text>

            <Pressable
              onPress={() => setIsFeedbackVisible(false)}
              style={({ pressed }) => [
                styles.feedbackButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.feedbackButtonText}>Rozumiem</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 18 : 12,
    paddingBottom: 42,
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: COLORS.background,
  },

  loadingIconWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: COLORS.coralLight,
  },

  loader: {
    marginTop: 22,
  },

  loadingText: {
    marginTop: 16,
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },

  errorTitle: {
    marginTop: 18,
    marginBottom: 8,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },

  errorText: {
    marginBottom: 22,
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  retryButton: {
    borderRadius: 15,
    backgroundColor: COLORS.coral,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },

  retryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 9,
  },

  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  brandIconWrap: {
    width: 47,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  brandName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  brandTagline: {
    marginTop: 1,
    color: COLORS.coralDark,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.15,
  },

  notificationButton: {
    position: 'relative',
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationBadge: {
    position: 'absolute',
    top: 3,
    right: 2,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.coral,
  },

  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },

  greetingSection: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    marginTop: 30,
    marginBottom: 18,
  },

  greetingTextWrap: {
    flex: 1,
    paddingRight: 12,
  },

  greeting: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },

  greetingSubtitle: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 21,
  },

  greetingIconWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroCard: {
    height: 338,
    marginHorizontal: 28,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: COLORS.coral,
    shadowColor: '#796054',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.17,
    shadowRadius: 15,
    elevation: 6,
  },

  heroImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  heroImageStyle: {
    borderRadius: 24,
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 24, 22, 0.31)',
  },

  heroContent: {
    padding: 28,
  },

  timeBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: COLORS.coral,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginBottom: 19,
  },

  timeBadgeText: {
    marginLeft: 7,
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '900',
  },

  heroDescription: {
    marginTop: 7,
    color: COLORS.white,
    fontSize: 16,
    lineHeight: 25,
    maxWidth: '78%',
  },

  heroAction: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    marginTop: 22,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  heroActionPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  heroActionText: {
    marginLeft: 10,
    color: COLORS.coralDark,
    fontSize: 14,
    fontWeight: '800',
  },

  quoteCard: {
    position: 'relative',
    marginHorizontal: 28,
    marginTop: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 21,
    backgroundColor: '#FFF8F3',
    paddingTop: 23,
    paddingRight: 36,
    paddingBottom: 21,
    paddingLeft: 90,
    shadowColor: '#947567',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  quoteIcon: {
    position: 'absolute',
    top: 20,
    left: 25,
  },

  quoteHeart: {
    position: 'absolute',
    top: 18,
    right: 18,
  },

  quoteText: {
    color: COLORS.text,
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'center',
  },

  quoteFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 16,
  },

  quoteLine: {
    width: 22,
    height: 2,
    marginRight: 8,
    borderRadius: 2,
    backgroundColor: COLORS.quote,
  },

  quoteAuthor: {
    color: COLORS.quote,
    fontSize: 13,
    fontWeight: '700',
  },

  helpHeader: {
    paddingHorizontal: 28,
    marginTop: 28,
    marginBottom: 17,
  },

  helpTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '900',
  },

  helpSubtitle: {
    marginTop: 5,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },

  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },

  categoryCard: {
    position: 'relative',
    width: (width - 78) / 4,
    minHeight: 145,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 6,
    paddingTop: 13,
    paddingBottom: 15,
  },

  categoryCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.selectedBorder,
    backgroundColor: '#FFF3EC',
  },

  categoryCardPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },

  categoryIconWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },

  categoryIconWrapSelected: {
    borderWidth: 1,
    borderColor: 'rgba(245, 110, 58, 0.25)',
  },

  categoryLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },

  categoryLabelSelected: {
    color: COLORS.coralDark,
  },

  selectedCheck: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
    borderRadius: 13,
    backgroundColor: COLORS.coral,
  },

  premiumCard: {
    marginHorizontal: 28,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#F2DCCF',
    borderRadius: 21,
    backgroundColor: '#FFF8F3',
    padding: 18,
  },

  premiumHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  premiumIconWrap: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: COLORS.coralLight,
    marginRight: 12,
  },

  premiumHeaderContent: {
    flex: 1,
  },

  premiumTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '900',
  },

  premiumSubtitle: {
    marginTop: 3,
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  premiumButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 17,
    borderRadius: 15,
    backgroundColor: COLORS.coral,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },

  premiumButtonLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  premiumButtonIconWrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginRight: 10,
  },

  premiumButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  premiumUnlocked: {
    marginTop: 15,
  },

  premiumDivider: {
    height: 1,
    backgroundColor: '#F2DCCF',
  },

  premiumContent: {
    marginTop: 15,
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },

  reflectionBox: {
    flexDirection: 'row',
    marginTop: 15,
    borderRadius: 14,
    backgroundColor: '#FFF0E8',
    padding: 13,
  },

  reflectionIcon: {
    marginTop: 1,
    marginRight: 10,
  },

  reflectionTextWrap: {
    flex: 1,
  },

  reflectionLabel: {
    color: COLORS.coralDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  reflectionQuestion: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },

  chatCard: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 28,
    marginTop: 22,
    borderRadius: 20,
    backgroundColor: COLORS.coral,
    padding: 19,
    shadowColor: COLORS.coralDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.19,
    shadowRadius: 13,
    elevation: 5,
  },

  chatContent: {
    flex: 1,
  },

  chatTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },

  chatDescription: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    lineHeight: 20,
  },

  chatIconCircle: {
    width: 67,
    height: 67,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
    backgroundColor: COLORS.white,
    marginLeft: 15,
  },

  dateInfo: {
    marginTop: 18,
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
  },

  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 23,
    backgroundColor: 'rgba(31, 28, 25, 0.53)',
  },

  quoteModal: {
    width: '100%',
    maxWidth: 470,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 22,
    paddingBottom: 22,
    shadowColor: '#1B1714',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },

  modalHandle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    marginTop: 12,
    borderRadius: 3,
    backgroundColor: '#E8DED7',
  },

  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  modalIconWrap: {
    width: 49,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.coralLight,
  },

  modalCloseButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#F8F2EE',
  },

  modalEyebrow: {
    marginTop: 20,
    color: COLORS.coralDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
  },

  modalTitle: {
    marginTop: 7,
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '900',
  },

  modalQuoteBox: {
    marginTop: 18,
    borderRadius: 19,
    backgroundColor: COLORS.coralPale,
    padding: 18,
  },

  modalQuoteText: {
    marginTop: 8,
    color: COLORS.text,
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 27,
  },

  modalAuthor: {
    marginTop: 15,
    color: COLORS.coralDark,
    fontSize: 13,
    fontWeight: '800',
  },

  modalSummaryBox: {
    flexDirection: 'row',
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: COLORS.greenSoft,
    padding: 14,
  },

  modalSummaryText: {
    flex: 1,
    marginLeft: 10,
    color: '#386D4D',
    fontSize: 14,
    lineHeight: 20,
  },

  modalCloseMainButton: {
    alignItems: 'center',
    marginTop: 18,
    borderRadius: 15,
    backgroundColor: COLORS.coral,
    paddingVertical: 14,
  },

  modalCloseMainButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
  },

  feedbackModal: {
    width: '100%',
    maxWidth: 390,
    alignItems: 'center',
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 25,
    paddingTop: 29,
    paddingBottom: 22,
    shadowColor: '#1B1714',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },

  feedbackIconWrap: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35,
    backgroundColor: COLORS.coralLight,
  },

  feedbackTitle: {
    marginTop: 17,
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },

  feedbackText: {
    marginTop: 9,
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  feedbackButton: {
    width: '100%',
    alignItems: 'center',
    marginTop: 22,
    borderRadius: 15,
    backgroundColor: COLORS.coral,
    paddingVertical: 14,
  },

  feedbackButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
  },

  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
});