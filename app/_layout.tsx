import { Colors } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
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
		PixelifySans: require('../assets/fonts/PixelifySans-Regular.ttf'),
		PixelifySans_Bold: require('../assets/fonts/PixelifySans-Bold.ttf'),
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
					headerShown: true,
					headerTitleStyle: {
						fontFamily: 'PixelifySans_Bold',
						color: Colors.title,
						fontSize: 20,
					},
					headerTintColor: Colors.primary,
					headerBackground: () => (
						<View
							style={{
								backgroundColor: Colors.backgroundAlt,
								flex: 1,
							}}
						/>
					),
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
					headerShown: true,
					headerTitleStyle: {
						fontFamily: 'PixelifySans_Bold',
						color: Colors.title,
						fontSize: 20,
					},
					headerBackground: () => (
						<View
							style={{
								backgroundColor: Colors.backgroundAlt,
								flex: 1,
							}}
						/>
					),
					headerRight: () => (
						<TouchableOpacity
							onPress={() => router.replace('/')}
							style={{ width: 50, alignItems: 'center' }}
						>
							<Text
								style={{
									color: Colors.primary,
									fontSize: 16,
									fontFamily: 'PixelifySans',
								}}
							>
								Close
							</Text>
						</TouchableOpacity>
					),
				}}
			/>
			<Stack.Screen name="+not-found" />
		</Stack>
	);
}
