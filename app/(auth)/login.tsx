import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Font';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		setLoading(true);

		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				// Check for network/connection errors by status code
				if (
					error.status === 0 || // Network error
					error.status >= 500 || // Server errors
					error.message.includes('Failed to fetch') ||
					error.message.includes('NetworkError') ||
					error.message.includes('NETWORK_ERROR')
				) {
					Alert.alert(
						'Connection Error',
						'Unable to connect to the server. Please check your internet connection or try again later. The app may be down for maintenance.'
					);
				} else if (error.status === 400) {
					Alert.alert('Login Failed', 'Invalid email or password.');
				} else if (error.status === 429) {
					Alert.alert(
						'Too Many Attempts',
						'Please wait a moment before trying again.'
					);
				} else {
					Alert.alert('Login Error', error.message);
				}
				setLoading(false);
				return;
			}

			// Rest of your login logic...
			const user = data.user;
			if (!user) {
				Alert.alert('Login error', 'No user returned');
				setLoading(false);
				return;
			}

			const { data: profiles, error: profileError } = await supabase
				.from('profiles')
				.select('id, username')
				.eq('id', user.id);

			if (profileError) {
				// Handle profile check errors with status codes too
				if (profileError.code === 'PGRST301' || profileError.code === '42P01') {
					Alert.alert(
						'Setup Error',
						'Database is being set up. Please try again in a moment.'
					);
				} else {
					Alert.alert('Error checking profile', profileError.message);
				}
				setLoading(false);
				return;
			}

			if (!profiles || profiles.length === 0 || !profiles[0].username) {
				setLoading(false);
				router.push({
					pathname: '../setUsername',
					params: { userId: user.id },
				});
				return;
			}

			setLoading(false);
			router.replace('/');
		} catch (err: any) {
			setLoading(false);
			// Network errors often don't have status codes in the catch block
			if (!navigator.onLine) {
				Alert.alert('No Internet', 'Please check your internet connection.');
			} else {
				Alert.alert(
					'Connection Error',
					'Unable to connect to the server. The app may be down for maintenance.'
				);
			}
		}
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.container}>
					<Image
						source={require('@/assets/images/bitnap_highres_logo.png')}
						style={{ width: 200, height: 200, marginBottom: 25 }}
						resizeMode="contain"
					/>

					<Text style={styles.title}>Log In</Text>

					<TextInput
						placeholder="Email"
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
						autoCapitalize="none"
						style={styles.input}
						placeholderTextColor={Colors.textAlt}
					/>

					<TextInput
						placeholder="Password"
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						style={styles.input}
						placeholderTextColor={Colors.textAlt}
					/>
					<TouchableOpacity
						style={styles.button}
						onPress={handleLogin}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color={Colors.text} />
						) : (
							<Text style={styles.buttonText}>Log In</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity onPress={() => router.replace('/signup')}>
						<Text style={styles.linkText}>
							Don't have an account?
							<Text style={{ color: Colors.primary }}> Sign up</Text>
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
		backgroundColor: Colors.background,
	},
	title: {
		fontSize: FontSizes.extraLarge,
		fontFamily: Fonts.dogicaPixelBold,
		color: Colors.title,
		marginBottom: 24,
	},
	input: {
		backgroundColor: '#fff',
		color: Colors.textAlt,
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		fontFamily: Fonts.dogicaPixel,
		width: '100%',
		fontSize: FontSizes.small,
	},
	button: {
		backgroundColor: Colors.primary,
		padding: 12,
		borderRadius: 8,
		width: '100%',
	},
	buttonText: {
		color: Colors.button,
		fontSize: FontSizes.medium,
		textAlign: 'center',
		fontFamily: Fonts.dogicaPixelBold,
	},
	linkText: {
		color: Colors.textAlt,
		textAlign: 'center',
		marginTop: 16,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
	},
});
