import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Font';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function SignUpScreen() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const handleSignUp = async () => {
		if (password !== confirmPassword) {
			Alert.alert('Passwords do not match');
			return;
		}

		if (!email || !password || !confirmPassword) {
			Alert.alert('Please fill out all fields');
			return;
		}

		try {
			// Sign up user (creates account but does NOT log them in yet)
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) {
				Alert.alert('Signup error', error.message);
				return;
			}

			if (
				data.user &&
				data.user.identities &&
				data.user.identities.length === 0
			) {
				Alert.alert(
					'Account exists',
					'An account with this email already exists. Redirecting to login...'
				);
				router.push('/login');
				return;
			}

			// Inform user to verify email before login
			Alert.alert(
				'Signup successful',
				'Please check your email to confirm your account, then log in.'
			);

			// Navigate to login screen
			router.push('/login');
		} catch (err) {
			console.error('Unexpected error:', err);
			Alert.alert('Unexpected error', 'Please try again later.');
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

					<Text style={styles.title}>Create Account</Text>

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
						textContentType="newPassword"
						autoComplete="password-new"
						style={styles.input}
						placeholderTextColor={Colors.textAlt}
					/>

					<TextInput
						placeholder="Confirm Password"
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						secureTextEntry
						textContentType="newPassword"
						autoComplete="password-new"
						style={styles.input}
						placeholderTextColor={Colors.textAlt}
					/>

					<TouchableOpacity style={styles.button} onPress={handleSignUp}>
						<Text style={styles.buttonText}>Create Account</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={() => router.replace('/login')}>
						<Text style={styles.linkText}>
							Already have an account?
							<Text style={{ color: Colors.primary }}> Login</Text>
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
