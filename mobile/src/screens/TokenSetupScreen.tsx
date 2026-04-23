import React, { useEffect, useMemo, useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useDeviceFlow } from '../auth/useDeviceFlow';
import { getOAuthAvailability } from '../auth/oauthConfig';

type Mode = 'oauth' | 'pat';

export function TokenSetupScreen() {
  const { saveToken } = useApp();
  const oauthAvailability = useMemo(() => getOAuthAvailability(), []);
  const [mode, setMode] = useState<Mode>(oauthAvailability.available ? 'oauth' : 'pat');

  const { state: oauthState, start: startOAuth, cancel: cancelOAuth } = useDeviceFlow();

  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [patError, setPatError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  // Persist OAuth token as soon as polling succeeds.
  useEffect(() => {
    if (oauthState.status === 'success' && oauthState.token) {
      saveToken(oauthState.token).catch(() => {
        // Saving failure surfaces in the device-flow error path next time.
      });
    }
  }, [oauthState.status, oauthState.token, saveToken]);

  const handleSavePat = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setPatError('Please enter a token');
      return;
    }
    if (!trimmed.startsWith('ghp_') && !trimmed.startsWith('github_pat_')) {
      setPatError('Token should start with ghp_ or github_pat_');
      return;
    }
    setSaving(true);
    setPatError(null);
    try {
      await saveToken(trimmed);
    } catch {
      setPatError('Failed to save token');
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Git Dashboard</Text>
        <Text style={styles.subtitle}>GitHub PR Dashboard for iOS</Text>

        {mode === 'oauth' && oauthAvailability.available ? (
          <OAuthCard
            state={oauthState}
            onStart={startOAuth}
            onCancel={cancelOAuth}
            onUsePat={() => {
              cancelOAuth();
              setMode('pat');
            }}
          />
        ) : (
          <PatCard
            input={input}
            showToken={showToken}
            saving={saving}
            error={patError}
            onChangeInput={(v) => {
              setInput(v);
              if (patError) setPatError(null);
            }}
            onToggleShow={() => setShowToken((p) => !p)}
            onSubmit={handleSavePat}
            oauthReason={oauthAvailability.available ? null : oauthAvailability.reason ?? null}
            onUseOAuth={oauthAvailability.available ? () => setMode('oauth') : undefined}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function OAuthCard({
  state,
  onStart,
  onCancel,
  onUsePat,
}: {
  state: ReturnType<typeof useDeviceFlow>['state'];
  onStart: () => void;
  onCancel: () => void;
  onUsePat: () => void;
}) {
  if (state.status === 'awaiting' && state.device) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Authorize on GitHub</Text>
        <Text style={styles.helper}>
          Open the URL below and enter this code, then approve the dashboard.
        </Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText} selectable>
            {state.device.user_code}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => Linking.openURL(state.device!.verification_uri).catch(() => {})}
        >
          <Text style={styles.linkText}>{state.device.verification_uri}</Text>
        </TouchableOpacity>
        <Text style={styles.waiting}>Waiting for approval…</Text>
        <ActivityIndicator color="#58a6ff" style={{ marginVertical: 8 }} />
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onCancel}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={onUsePat}>
          <Text style={styles.linkText}>Use a Personal Access Token instead</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Sign in with GitHub</Text>
      <Text style={styles.helper}>
        Connect securely without copying a token. We'll open GitHub to confirm.
      </Text>
      {state.status === 'error' && state.error && <Text style={styles.error}>{state.error}</Text>}
      <TouchableOpacity
        style={[styles.button, state.status === 'requesting' && styles.buttonDisabled]}
        onPress={onStart}
        disabled={state.status === 'requesting'}
      >
        {state.status === 'requesting' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Connect with GitHub</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={onUsePat}>
        <Text style={styles.linkText}>Use a Personal Access Token instead</Text>
      </TouchableOpacity>
    </View>
  );
}

function PatCard({
  input,
  showToken,
  saving,
  error,
  onChangeInput,
  onToggleShow,
  onSubmit,
  oauthReason,
  onUseOAuth,
}: {
  input: string;
  showToken: boolean;
  saving: boolean;
  error: string | null;
  onChangeInput: (v: string) => void;
  onToggleShow: () => void;
  onSubmit: () => void;
  oauthReason: string | null;
  onUseOAuth?: () => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>GitHub Personal Access Token</Text>
      {oauthReason && <Text style={styles.helper}>{oauthReason}</Text>}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={onChangeInput}
          placeholder="ghp_xxxxxxxxxxxx"
          placeholderTextColor="#666"
          secureTextEntry={!showToken}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
        />
        <TouchableOpacity style={styles.toggleButton} onPress={onToggleShow}>
          <Text style={styles.toggleText}>{showToken ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, !input.trim() && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={saving || !input.trim()}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Token</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => Linking.openURL('https://github.com/settings/tokens/new?scopes=repo&description=Git+Dashboard+iOS')}
      >
        <Text style={styles.linkText}>Create a new token on GitHub</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        Requires a Classic token with <Text style={styles.code}>repo</Text> scope,{' '}
        or a Fine-grained token with Pull requests (read) and Checks (read).
      </Text>

      {onUseOAuth && (
        <TouchableOpacity style={styles.linkButton} onPress={onUseOAuth}>
          <Text style={styles.linkText}>Sign in with GitHub OAuth instead</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
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
  helper: {
    fontSize: 13,
    color: '#7d8590',
    marginBottom: 12,
    lineHeight: 18,
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
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  secondaryButtonText: {
    color: '#e6edf3',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#58a6ff',
    fontSize: 14,
    textAlign: 'center',
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
  codeBox: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 12,
  },
  codeText: {
    color: '#58a6ff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  waiting: {
    color: '#7d8590',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
