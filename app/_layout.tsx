import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
	useNavigation,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';

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
	const navigation = useNavigation();

	useEffect(() => {
		if (!loading) {
			if (!user) {
				router.replace('/welcome');
			}
		}
	}, [user, loading, router]);

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
				name="journalContents"
				options={{
					title: 'Dream Contents',
					headerBackTitle: 'Back',
				}}
			/>
			<Stack.Screen
				name="editProfile"
				options={{
					title: 'Edit Profile',
					headerBackTitle: 'Profile',
				}}
			/>
			<Stack.Screen
				name="buddies"
				options={{
					title: 'Your Buddies',
					headerBackTitle: 'Profile',
				}}
			/>
			<Stack.Screen
				name="otherProfile"
				options={{
					title: 'User Profile',
					headerBackTitle: 'Back',
				}}
			/>
			<Stack.Screen
				name="createJournalEntry"
				options={{
					title: 'Create Entry',
					presentation: 'modal',
					headerRight: () => (
						<TouchableOpacity onPress={() => router.replace('/')}>
							<Text style={{ color: '#1e90ff', fontSize: 16 }}>Close</Text>
						</TouchableOpacity>
					),
				}}
			/>
			<Stack.Screen name="+not-found" />
		</Stack>
	);
}
