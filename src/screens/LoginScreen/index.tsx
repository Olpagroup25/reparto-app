import { useState } from 'react';
import { Text, View } from 'react-native';
import { BrandMark, Button, ScreenContainer, TextField } from '@/components';
import { useAuth } from '@/auth/AuthContext';
import type { LoginScreenProps } from './types';
import { styles } from './styles';
import { APP_VERSION, formatLoginError } from './utils';

export type { LoginScreenProps };

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { login, isLoggingIn, sessionError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real insa_reparto auth: `username` here is the route/vehicle credential's
  // login (insa.repartidor.credencial.login, e.g. "reparto01@insareparto.local"), not a
  // person's username — see src/api/repartoApiClient.ts.
  const handleLogin = async () => {
    try {
      await login(username, password);
      setError(null);
      navigation.replace('DateSelection');
    } catch (e) {
      setError(formatLoginError(e));
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <BrandMark />
      </View>
      <View style={styles.form}>
        {/* Banner de sesión cerrada de forma remota / token expirado.
            Distinto del error de credenciales: el color es informativo
            (naranja) en vez de rojo, y el mensaje explica qué pasó. */}
        {sessionError ? (
          <View style={styles.sessionErrorBanner}>
            <Text style={styles.sessionErrorText}>{sessionError.text}</Text>
          </View>
        ) : null}
        <TextField
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setError(null);
          }}
          placeholder="Usuario"
          // Login is email-shaped (e.g. "reparto01@insareparto.local" — see
          // insa.repartidor.credencial) even though it's not a real mailbox,
          // so the keyboard/autofill/password-manager treat it as a login.
          keyboardType="email-address"
          autoComplete="email"
          textContentType="username"
          autoCapitalize="none"
        />
        <TextField
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(null);
          }}
          placeholder="Contraseña"
          secureTextEntry={!showPassword}
          textContentType="password"
          rightIcon={showPassword ? 'visibility-off' : 'visibility'}
          onRightIconPress={() => setShowPassword((v) => !v)}
          containerStyle={styles.spaced}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title="Ingresar"
          variant="primary"
          fullWidth
          loading={isLoggingIn}
          onPress={handleLogin}
          style={styles.button}
        />
      </View>
      <Text style={styles.version}>{APP_VERSION}</Text>
    </ScreenContainer>
  );
}
