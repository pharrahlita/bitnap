import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	});

	if (!loaded) {
		// Async font loading only occurs in development.
		return null;
	}

	return (
		<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
			<AuthProvider>
				<LayoutWithAuth />
				<StatusBar style="auto" />
			</AuthProvider>
		</ThemeProvider>
	);
}

function LayoutWithAuth() {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading) {
			if (!user) {
				router.replace('/welcome');
			}
		}
	}, [user, loading]);

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<Stack>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen name="(auth)/welcome" options={{ headerShown: false }} />
			<Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
			<Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
			<Stack.Screen
				name="editProfile"
				options={{
					title: 'Edit Profile',
					headerBackTitle: 'Profile',
				}}
			/>
			<Stack.Screen name="+not-found" />
		</Stack>
	);
}
