import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ENABLED_KEY = 'callconnect_enabled';
const MESSAGE_KEY = 'callconnect_message';
const DEFAULT_MESSAGE = 'Thanks for connecting with us.';

export default function HomeScreen() {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [loaded, setLoaded] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const savedEnabled = await AsyncStorage.getItem(ENABLED_KEY);
        const savedMessage = await AsyncStorage.getItem(MESSAGE_KEY);

        if (savedEnabled !== null) setEnabled(savedEnabled === 'true');
        if (savedMessage !== null) setMessage(savedMessage);
      } catch {
        Alert.alert('Could not load saved settings.');
      } finally {
        setLoaded(true);
      }
    }

    loadSettings();
  }, []);

  async function saveEnabled(value: boolean) {
    setEnabled(value);
    setSavedNotice(false);

    try {
      await AsyncStorage.setItem(ENABLED_KEY, String(value));
      setSavedNotice(true);
    } catch {
      Alert.alert('Could not save the setting.');
    }
  }

  async function saveMessage(value: string) {
    setMessage(value);
    setSavedNotice(false);

    try {
      await AsyncStorage.setItem(MESSAGE_KEY, value);
      setSavedNotice(true);
    } catch {
      Alert.alert('Could not save the message.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>C</Text>
          </View>
          <View>
            <Text style={styles.brand}>CallConnect</Text>
            <Text style={styles.tagline}>Stay connected, effortlessly</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>YOUR CALL ASSISTANT</Text>
          <Text style={styles.heroTitle}>A thoughtful follow-up,</Text>
          <Text style={styles.heroTitleAccent}>after every call.</Text>
          <Text style={styles.heroDescription}>
            Set a message to send when your call is finished.
          </Text>

          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                enabled ? styles.statusDotOn : styles.statusDotOff,
              ]}
            />
            <Text style={styles.statusText}>
              {enabled ? 'Auto-reply enabled' : 'Auto-reply is off'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>↗</Text>
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Auto-reply</Text>
              <Text style={styles.cardSubtitle}>
                Turn your follow-up preference on or off
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={saveEnabled}
              disabled={!loaded}
              trackColor={{ false: '#D8DFEA', true: '#A5B4FC' }}
              thumbColor={enabled ? '#4F46E5' : '#FFFFFF'}
            />
          </View>

          <View style={styles.separator} />

          <Text style={styles.fieldLabel}>YOUR MESSAGE</Text>
          <TextInput
            value={message}
            onChangeText={saveMessage}
            placeholder="Type your message"
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={300}
            style={styles.input}
            editable={loaded}
          />

          <View style={styles.messageFooter}>
            <Text style={styles.characterCount}>{message.length}/300</Text>
            {savedNotice && (
              <Text style={styles.savedNotice}>✓ Saved on this device</Text>
            )}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>i</Text>
          <Text style={styles.infoText}>
            Your preferences are saved on this device. Automatic SMS sending
            is not active yet.
          </Text>
        </View>

        <Text style={styles.footer}>MADE TO KEEP YOU CONNECTED</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
  },
  brand: {
    color: '#172554',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  tagline: {
    color: '#7B879B',
    fontSize: 12,
    marginTop: 3,
  },
  hero: {
    backgroundColor: '#172554',
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
    overflow: 'hidden',
  },
  eyebrow: {
    color: '#A5B4FC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 15,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  heroTitleAccent: {
    color: '#A5B4FC',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  heroDescription: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    maxWidth: 270,
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#293866',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotOn: {
    backgroundColor: '#4ADE80',
  },
  statusDotOff: {
    backgroundColor: '#94A3B8',
  },
  statusText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9EDF5',
    shadowColor: '#172554',
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIconText: {
    color: '#4F46E5',
    fontSize: 24,
    fontWeight: '700',
  },
  cardHeaderText: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    color: '#172554',
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#7B879B',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#EEF1F6',
    marginVertical: 20,
  },
  fieldLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  input: {
    minHeight: 108,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#FAFBFE',
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    color: '#1E293B',
    textAlignVertical: 'top',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    minHeight: 18,
  },
  characterCount: {
    color: '#94A3B8',
    fontSize: 11,
  },
  savedNotice: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  infoIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: '#C7D2FE',
    color: '#3730A3',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    color: '#4B5680',
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    color: '#A0AABC',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 24,
  },
});