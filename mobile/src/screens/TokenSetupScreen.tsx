import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../context/AppContext';

export function TokenSetupScreen() {
  const { saveToken } = useApp();
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  const handleSave = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Please enter a token');
      return;
    }
    if (!trimmed.startsWith('ghp_') && !trimmed.startsWith('github_pat_')) {
      setError('Token should start with ghp_ or github_pat_');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveToken(trimmed);
    } catch {
      setError('Failed to save token');
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Git Dashboard</Text>
        <Text style={styles.subtitle}>GitHub PR Dashboard for iOS</Text>

        <View style={styles.card}>
          <Text style={styles.label}>GitHub Personal Access Token</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="ghp_xxxxxxxxxxxx"
              placeholderTextColor="#666"
              secureTextEntry={!showToken}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
            />
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowToken((prev) => !prev)}
            >
              <Text style={styles.toggleText}>{showToken ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, !input.trim() && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving || !input.trim()}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Token</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.link}
          onPress={() => Linking.openURL('https://github.com/settings/tokens/new?scopes=repo&description=Git+Dashboard+iOS')}
        >
          <Text style={styles.linkText}>Create a new token on GitHub</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Requires a Classic token with <Text style={styles.code}>repo</Text> scope,{' '}
          or a Fine-grained token with Pull requests (read) and Checks (read).
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#e6edf3',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7d8590',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e6edf3',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#e6edf3',
  },
  toggleButton: {
    marginLeft: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  toggleText: {
    color: '#58a6ff',
    fontSize: 14,
    fontWeight: '500',
  },
  error: {
    color: '#f85149',
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#238636',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#58a6ff',
    fontSize: 14,
  },
  hint: {
    color: '#7d8590',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#e6edf3',
  },
});
