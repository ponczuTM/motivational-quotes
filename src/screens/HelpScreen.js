// src/screens/HelpScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const COLORS = {
  background: '#FCF4EC',
  surface: '#FFFDFB',
  coral: '#FF7A45',
  coralDark: '#E96332',
  coralLight: '#FFE5D8',
  text: '#20252D',
  textSecondary: '#676B72',
  border: '#F1E5DD',
  green: '#4EA66E',
  greenSoft: '#E7F4EA',
  blue: '#4A9BD4',
  blueSoft: '#E9F4FC',
  purple: '#8A63C8',
  purpleSoft: '#F2EAFE',
  white: '#FFFFFF',
};

const TOPICS = [
  {
    id: 'direction',
    title: 'Nie wiem, co dalej',
    description: 'Pomogę Ci uporządkować myśli i wybrać mały krok na teraz.',
    icon: 'compass-outline',
    iconColor: COLORS.coral,
    backgroundColor: COLORS.coralLight,
  },
  {
    id: 'work',
    title: 'Praca i pieniądze',
    description: 'Porozmawiajmy o pracy, zmianach i codziennych sprawach.',
    icon: 'briefcase-outline',
    iconColor: COLORS.green,
    backgroundColor: COLORS.greenSoft,
  },
  {
    id: 'daily',
    title: 'Sprawy codzienne',
    description: 'Znajdźmy prostszy sposób na to, co dziś Cię przytłacza.',
    icon: 'home-outline',
    iconColor: COLORS.blue,
    backgroundColor: COLORS.blueSoft,
  },
  {
    id: 'change',
    title: 'Chcę coś zmienić',
    description: 'Nazwijmy zmianę, której potrzebujesz, i zacznijmy spokojnie.',
    icon: 'target',
    iconColor: COLORS.purple,
    backgroundColor: COLORS.purpleSoft,
  },
];

export default function HelpScreen() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [message, setMessage] = useState('');
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const handleTopicPress = (topic) => {
    setSelectedTopic(topic);
  };

  const handleSendMessage = () => {
    if (!selectedTopic) {
      return;
    }

    setIsConfirmationVisible(true);
    setMessage('');
  };

  return (
    <View style={styles.screen}>
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
              name="hand-heart-outline"
              size={33}
              color={COLORS.coral}
            />
          </View>

          <Text style={styles.title}>Jestem tutaj dla Ciebie</Text>

          <Text style={styles.subtitle}>
            Wybierz obszar, o którym chcesz porozmawiać. Nie musisz mieć
            gotowej odpowiedzi ani planu.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Co jest teraz najważniejsze?</Text>
          <Text style={styles.sectionHint}>
            Możesz wybrać jedną opcję.
          </Text>
        </View>

        <View style={styles.topicsContainer}>
          {TOPICS.map((topic) => {
            const isSelected = selectedTopic?.id === topic.id;

            return (
              <Pressable
                key={topic.id}
                onPress={() => handleTopicPress(topic)}
                style={({ pressed }) => [
                  styles.topicCard,
                  isSelected && styles.topicCardSelected,
                  pressed && styles.cardPressed,
                ]}
              >
                <View
                  style={[
                    styles.topicIconWrap,
                    { backgroundColor: topic.backgroundColor },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={topic.icon}
                    size={29}
                    color={topic.iconColor}
                  />
                </View>

                <View style={styles.topicTextWrap}>
                  <Text
                    style={[
                      styles.topicTitle,
                      isSelected && styles.topicTitleSelected,
                    ]}
                  >
                    {topic.title}
                  </Text>

                  <Text style={styles.topicDescription}>
                    {topic.description}
                  </Text>
                </View>

                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        {selectedTopic ? (
          <View style={styles.messageSection}>
            <View style={styles.messageHeader}>
              <View style={styles.messageHeaderIcon}>
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={20}
                  color={COLORS.coral}
                />
              </View>

              <View style={styles.messageHeaderText}>
                <Text style={styles.messageTitle}>Napisz kilka słów</Text>
                <Text style={styles.messageSubtitle}>
                  To opcjonalne. Możesz opisać, co czujesz lub czego potrzebujesz.
                </Text>
              </View>
            </View>

            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Na przykład: nie wiem, od czego zacząć..."
              placeholderTextColor="#A69D98"
              multiline
              textAlignVertical="top"
              style={styles.messageInput}
              maxLength={600}
            />

            <Text style={styles.charactersCounter}>
              {message.length}/600
            </Text>

            <Pressable
              onPress={handleSendMessage}
              style={({ pressed }) => [
                styles.sendButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <View style={styles.sendButtonIcon}>
                <MaterialCommunityIcons
                  name="send-outline"
                  size={20}
                  color={COLORS.white}
                />
              </View>

              <Text style={styles.sendButtonText}>Rozpocznij rozmowę</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.tipCard}>
            <View style={styles.tipIconWrap}>
              <MaterialCommunityIcons
                name="information-outline"
                size={22}
                color={COLORS.blue}
              />
            </View>

            <Text style={styles.tipText}>
              Wybierz temat, aby przejść dalej i rozpocząć spokojną rozmowę.
            </Text>
          </View>
        )}

        <View style={styles.safetyCard}>
          <View style={styles.safetyIconWrap}>
            <MaterialCommunityIcons
              name="shield-heart-outline"
              size={25}
              color={COLORS.green}
            />
          </View>

          <View style={styles.safetyContent}>
            <Text style={styles.safetyTitle}>Twoja przestrzeń</Text>
            <Text style={styles.safetyDescription}>
              Możesz zatrzymać się w dowolnym momencie. Nie ocenimy Cię.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isConfirmationVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsConfirmationVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsConfirmationVisible(false)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={36}
                color={COLORS.coral}
              />
            </View>

            <Text style={styles.modalTitle}>Dziękujemy</Text>

            <Text style={styles.modalText}>
              Dobrze, że o tym mówisz. Jesteśmy obok i przejdziemy przez to
              razem, krok po kroku.
            </Text>

            <Pressable
              onPress={() => setIsConfirmationVisible(false)}
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.modalButtonText}>Rozumiem</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 20 : 14,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  header: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 7,
  },

  headerIconWrap: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35,
    backgroundColor: COLORS.coralLight,
  },

  title: {
    marginTop: 16,
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 9,
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  sectionHeader: {
    marginTop: 31,
    marginBottom: 14,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },

  sectionHint: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  topicsContainer: {
    gap: 11,
  },

  topicCard: {
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    padding: 14,
  },

  topicCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.coral,
    backgroundColor: '#FFF8F4',
  },

  topicIconWrap: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    marginRight: 13,
  },

  topicTextWrap: {
    flex: 1,
    paddingRight: 8,
  },

  topicTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },

  topicTitleSelected: {
    color: COLORS.coralDark,
  },

  topicDescription: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },

  radioOuter: {
    width: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D2C8C2',
    borderRadius: 12,
  },

  radioOuterSelected: {
    borderColor: COLORS.coral,
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.coral,
  },

  messageSection: {
    marginTop: 21,
    borderWidth: 1,
    borderColor: '#F1DDD2',
    borderRadius: 21,
    backgroundColor: '#FFF9F5',
    padding: 17,
  },

  messageHeader: {
    flexDirection: 'row',
  },

  messageHeaderIcon: {
    width: 39,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: COLORS.coralLight,
    marginRight: 11,
  },

  messageHeaderText: {
    flex: 1,
  },

  messageTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },

  messageSubtitle: {
    marginTop: 3,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },

  messageInput: {
    minHeight: 122,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#E9DDD6',
    borderRadius: 15,
    backgroundColor: COLORS.white,
    padding: 13,
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 21,
  },

  charactersCounter: {
    marginTop: 6,
    color: '#9B918C',
    fontSize: 11,
    textAlign: 'right',
  },

  sendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 13,
    borderRadius: 15,
    backgroundColor: COLORS.coral,
    paddingVertical: 14,
  },

  sendButtonIcon: {
    marginRight: 9,
  },

  sendButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
  },

  tipCard: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 21,
    borderRadius: 17,
    backgroundColor: COLORS.blueSoft,
    padding: 15,
  },

  tipIconWrap: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginRight: 11,
  },

  tipText: {
    flex: 1,
    color: '#4D6F87',
    fontSize: 13,
    lineHeight: 19,
  },

  safetyCard: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 22,
    borderRadius: 19,
    backgroundColor: COLORS.greenSoft,
    padding: 16,
  },

  safetyIconWrap: {
    width: 47,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: COLORS.white,
    marginRight: 12,
  },

  safetyContent: {
    flex: 1,
  },

  safetyTitle: {
    color: '#326747',
    fontSize: 15,
    fontWeight: '900',
  },

  safetyDescription: {
    marginTop: 3,
    color: '#4D7A5D',
    fontSize: 13,
    lineHeight: 18,
  },

  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(31, 28, 25, 0.53)',
  },

  modalCard: {
    width: '100%',
    maxWidth: 390,
    alignItems: 'center',
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 25,
    paddingTop: 28,
    paddingBottom: 22,
    shadowColor: '#1B1714',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },

  modalIconWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: COLORS.coralLight,
  },

  modalTitle: {
    marginTop: 17,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
  },

  modalText: {
    marginTop: 9,
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  modalButton: {
    width: '100%',
    alignItems: 'center',
    marginTop: 22,
    borderRadius: 15,
    backgroundColor: COLORS.coral,
    paddingVertical: 14,
  },

  modalButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
  },

  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },

  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
});