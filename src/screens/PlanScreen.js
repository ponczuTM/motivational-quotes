// src/screens/PlanScreen.js

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Platform,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ref, onValue, set, push, update, remove } from 'firebase/database';

import { useAuth } from '../context/AuthContext';
import { database } from '../../firebaseConfig';
import ScreenContainer from '../components/ScreenContainer';
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
};

const INITIAL_STEPS = [
  {
    id: 'step-1',
    text: 'Zatrzymać się na chwilę i wziąć spokojny oddech',
    completed: false,
  },
  {
    id: 'step-2',
    text: 'Zrobić jedną małą rzecz, która ułatwi mi dzień',
    completed: false,
  },
  {
    id: 'step-3',
    text: 'Zauważyć coś, za co mogę być dziś wdzięczny',
    completed: false,
  },
];

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export default function PlanScreen() {
  const { user } = useAuth();

  const [steps, setSteps] = useState([]);
  const [newStepText, setNewStepText] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Nasłuchujemy na kroki planu użytkownika w Firebase Realtime Database
  useEffect(() => {
    if (!user?.uid) {
      setSteps([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const stepsRef = ref(database, `users/${user.uid}/plan/steps`);

    const unsubscribe = onValue(stepsRef, (snapshot) => {
      if (snapshot.exists()) {
        const stepsData = snapshot.val();
        const stepsList = Object.entries(stepsData)
          .map(([id, value]) => ({ id, ...value }))
          .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

        setSteps(stepsList);
        setIsLoading(false);
      } else {
        // Brak zapisanych kroków - zapisujemy domyślne, żeby użytkownik miał punkt startowy
        const defaultStepsData = {};
        INITIAL_STEPS.forEach((step) => {
          defaultStepsData[step.id] = {
            text: step.text,
            completed: false,
            createdAt: new Date().toISOString(),
          };
        });

        set(stepsRef, defaultStepsData);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Za każdym razem, gdy zmieni się stan kroków, zapisujemy migawkę dzienną
  // (data + % wykonanych zadań), żeby można było później budować statystyki
  useEffect(() => {
    if (!user?.uid || isLoading) {
      return;
    }

    const totalCount = steps.length;
    const completedCount = steps.filter((step) => step.completed).length;
    const percent =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const today = getTodayDate();

    const historyRef = ref(database, `users/${user.uid}/plan/history/${today}`);

    set(historyRef, {
      date: today,
      completedCount,
      totalCount,
      percent,
      updatedAt: new Date().toISOString(),
    });
  }, [steps, user?.uid, isLoading]);

  const completedSteps = useMemo(
    () => steps.filter((step) => step.completed).length,
    [steps]
  );

  const progress =
    steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

  const toggleStep = (id) => {
    if (!user?.uid) {
      return;
    }

    const step = steps.find((currentStep) => currentStep.id === id);

    if (!step) {
      return;
    }

    const stepRef = ref(database, `users/${user.uid}/plan/steps/${id}`);
    update(stepRef, { completed: !step.completed });
  };

  const removeStep = (id) => {
    if (!user?.uid) {
      return;
    }

    const stepRef = ref(database, `users/${user.uid}/plan/steps/${id}`);
    remove(stepRef);
  };

  const addStep = () => {
    const trimmedText = newStepText.trim();

    if (!trimmedText || !user?.uid) {
      return;
    }

    const stepsRef = ref(database, `users/${user.uid}/plan/steps`);
    const newStepRef = push(stepsRef);

    set(newStepRef, {
      text: trimmedText,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    setNewStepText('');
    setIsAddModalVisible(false);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        <ActivityIndicator size="large" color={COLORS.coral} />

        <Text style={styles.loadingText}>Ładujemy Twój plan...</Text>
      </View>
    );

  }

  return (
            <ScreenContainer>
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
              name="clipboard-text-outline"
              size={34}
              color={COLORS.coral}
            />
          </View>

          <Text style={styles.title}>Mój plan na dziś</Text>

          <Text style={styles.subtitle}>
            Nie musisz zrobić wszystkiego. Jeden mały krok też ma znaczenie.
          </Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressTopRow}>
            <View>
              <Text style={styles.progressLabel}>TWÓJ DZISIEJSZY POSTĘP</Text>

              <Text style={styles.progressValue}>
                {completedSteps} z {steps.length} kroków
              </Text>
            </View>

            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>{progress}%</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <Text style={styles.progressDescription}>
            {progress === 0 &&
              'Zacznij od jednego małego kroku, kiedy będziesz gotowy.'}

            {progress > 0 &&
              progress < 100 &&
              'Dobrze Ci idzie. Każda mała rzecz przybliża Cię do celu.'}

            {progress === 100 &&
              'Wspaniale. Wszystkie zaplanowane kroki są już za Tobą.'}
          </Text>
        </View>

        <View style={styles.stepsHeader}>
          <Text style={styles.sectionTitle}>Małe kroki</Text>

          <Pressable
            onPress={() => setIsAddModalVisible(true)}
            style={({ pressed }) => [
              styles.addSmallButton,
              pressed && styles.smallButtonPressed,
            ]}
          >
            <MaterialCommunityIcons
              name="plus"
              size={19}
              color={COLORS.coral}
            />

            <Text style={styles.addSmallButtonText}>Dodaj</Text>
          </Pressable>
        </View>

        {steps.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <MaterialCommunityIcons
                name="playlist-plus"
                size={32}
                color={COLORS.coral}
              />
            </View>

            <Text style={styles.emptyTitle}>Twój plan jest pusty</Text>

            <Text style={styles.emptyText}>
              Dodaj drobny krok, który możesz wykonać dla siebie dzisiaj.
            </Text>

            <Pressable
              onPress={() => setIsAddModalVisible(true)}
              style={({ pressed }) => [
                styles.emptyButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.emptyButtonText}>Dodaj pierwszy krok</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.stepsContainer}>
            {steps.map((step) => (
              <View
                key={step.id}
                style={[
                  styles.stepCard,
                  step.completed && styles.stepCardCompleted,
                ]}
              >
                <Pressable
                  onPress={() => toggleStep(step.id)}
                  style={[
                    styles.checkbox,
                    step.completed && styles.checkboxCompleted,
                  ]}
                >
                  {step.completed && (
                    <MaterialCommunityIcons
                      name="check"
                      size={18}
                      color={COLORS.white}
                    />
                  )}
                </Pressable>

                <Pressable
                  onPress={() => toggleStep(step.id)}
                  style={styles.stepTextPressable}
                >
                  <Text
                    style={[
                      styles.stepText,
                      step.completed && styles.stepTextCompleted,
                    ]}
                  >
                    {step.text}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => removeStep(step.id)}
                  hitSlop={10}
                  style={({ pressed }) => [
                    styles.removeButton,
                    pressed && styles.removeButtonPressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color="#A69A94"
                  />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={styles.reminderCard}>
          <View style={styles.reminderIconWrap}>
            <MaterialCommunityIcons
              name="heart-pulse"
              size={26}
              color={COLORS.green}
            />
          </View>

          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>Pamiętaj o sobie</Text>

            <Text style={styles.reminderText}>
              Twój plan ma Ci pomagać, a nie tworzyć presję. Możesz go zmienić
              w każdej chwili.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setIsAddModalVisible(true)}
          style={({ pressed }) => [
            styles.addStepButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <View style={styles.addStepIconWrap}>
            <MaterialCommunityIcons
              name="plus"
              size={22}
              color={COLORS.white}
            />
          </View>

          <Text style={styles.addStepButtonText}>Dodaj mały krok</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsAddModalVisible(false)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            <View style={styles.modalTopRow}>
              <View style={styles.modalIconWrap}>
                <MaterialCommunityIcons
                  name="playlist-plus"
                  size={25}
                  color={COLORS.coral}
                />
              </View>

              <Pressable
                onPress={() => setIsAddModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color={COLORS.textSecondary}
                />
              </Pressable>
            </View>

            <Text style={styles.modalTitle}>Dodaj mały krok</Text>

            <Text style={styles.modalDescription}>
              Wybierz coś prostego i możliwego do wykonania dzisiaj.
            </Text>

            <TextInput
              value={newStepText}
              onChangeText={setNewStepText}
              placeholder="Na przykład: zadzwonić do bliskiej osoby"
              placeholderTextColor="#A69D98"
              style={styles.modalInput}
              maxLength={180}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={addStep}
            />

            <Text style={styles.modalCounter}>
              {newStepText.length}/180
            </Text>

            <Pressable
              onPress={addStep}
              disabled={!newStepText.trim()}
              style={({ pressed }) => [
                styles.modalAddButton,
                !newStepText.trim() && styles.modalAddButtonDisabled,
                pressed && newStepText.trim() && styles.buttonPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={COLORS.white}
              />

              <Text style={styles.modalAddButtonText}>Dodaj do planu</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
  },

  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 20 : 14,
    paddingHorizontal: 20,
    paddingBottom: 42,
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: 16,
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
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

  progressCard: {
    marginTop: 27,
    borderWidth: 1,
    borderColor: '#F1DDD2',
    borderRadius: 22,
    backgroundColor: '#FFF9F5',
    padding: 18,
  },

  progressTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressLabel: {
    color: COLORS.coralDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  progressValue: {
    marginTop: 5,
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '900',
  },

  progressCircle: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: COLORS.coralLight,
  },

  progressCircleText: {
    color: COLORS.coralDark,
    fontSize: 15,
    fontWeight: '900',
  },

  progressTrack: {
    height: 9,
    overflow: 'hidden',
    marginTop: 17,
    borderRadius: 5,
    backgroundColor: '#F1E3DC',
  },

  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: COLORS.coral,
  },

  progressDescription: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },

  stepsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 29,
    marginBottom: 14,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '900',
  },

  addSmallButton: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 13,
    backgroundColor: COLORS.coralLight,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  addSmallButtonText: {
    marginLeft: 4,
    color: COLORS.coralDark,
    fontSize: 13,
    fontWeight: '900',
  },

  stepsContainer: {
    gap: 10,
  },

  stepCard: {
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 9,
  },

  stepCardCompleted: {
    borderColor: '#D7EAD9',
    backgroundColor: '#F7FCF7',
  },

  checkbox: {
    width: 27,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#CEC5C0',
    borderRadius: 9,
    marginRight: 12,
  },

  checkboxCompleted: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.green,
  },

  stepTextPressable: {
    flex: 1,
  },

  stepText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },

  stepTextCompleted: {
    color: '#6C8272',
    textDecorationLine: 'line-through',
  },

  removeButton: {
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
    borderRadius: 12,
  },

  removeButtonPressed: {
    backgroundColor: '#F8EEE9',
  },

  emptyCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    padding: 24,
  },

  emptyIconWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.coralLight,
  },

  emptyTitle: {
    marginTop: 14,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },

  emptyText: {
    marginTop: 7,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },

  emptyButton: {
    marginTop: 17,
    borderRadius: 14,
    backgroundColor: COLORS.coral,
    paddingHorizontal: 17,
    paddingVertical: 12,
  },

  emptyButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
  },

  reminderCard: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 22,
    borderRadius: 19,
    backgroundColor: COLORS.greenSoft,
    padding: 16,
  },

  reminderIconWrap: {
    width: 47,
    height: 47,
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
    marginTop: 3,
    color: '#4D7A5D',
    fontSize: 13,
    lineHeight: 18,
  },

  addStepButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 21,
    borderRadius: 17,
    backgroundColor: COLORS.coral,
    paddingVertical: 16,
    shadowColor: COLORS.coralDark,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 11,
    elevation: 5,
  },

  addStepIconWrap: {
    marginRight: 8,
  },

  addStepButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },

  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(31, 28, 25, 0.53)',
  },

  modalCard: {
    width: '100%',
    marginTop:
      (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) + 24,
    borderRadius: 29,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 22,
    paddingBottom: 28,
  },

  modalHandle: {
    alignSelf: 'center',
    width: 47,
    height: 5,
    marginTop: 12,
    borderRadius: 3,
    backgroundColor: '#E7DDD8',
  },

  modalTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
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

  modalTitle: {
    marginTop: 18,
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
  },

  modalDescription: {
    marginTop: 7,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  modalInput: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E7DCD5',
    borderRadius: 15,
    backgroundColor: '#FFFEFD',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 15,
  },

  modalCounter: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'right',
  },

  modalAddButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 14,
    borderRadius: 15,
    backgroundColor: COLORS.coral,
    paddingVertical: 15,
  },

  modalAddButtonDisabled: {
    backgroundColor: '#D8B6A5',
  },

  modalAddButtonText: {
    marginLeft: 8,
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
  },

  smallButtonPressed: {
    opacity: 0.74,
  },

  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
});