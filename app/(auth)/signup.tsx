import { Colors } from '@/constants/Colors';
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

	// Basic username validation
	const isValidUsername = (name: string) => /^[a-zA-Z0-9_]{3,15}$/.test(name);

	const handleSignUp = async () => {
		if (!username) {
			Alert.alert('Username is required');
			return;
		}
		if (!isValidUsername(username)) {
			Alert.alert(
				'Invalid username',
				'Username must be 3-15 characters and contain only letters, numbers, or underscores.'
			);
			return;
		}

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

			// Use the user id from the signup response
			if (!data.user?.id) {
				Alert.alert('Could not fetch user ID to create profile');
				return;
			}

			const { error: profileError } = await supabase.from('profiles').insert({
				id: data.user.id,
				username,
			});

			if (profileError) {
				Alert.alert('Profile error', profileError.message);
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
						placeholder="Username"
						value={username}
						onChangeText={setUsername}
						autoCapitalize="none"
						style={styles.input}
						placeholderTextColor={Colors.textAlt}
					/>

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
		fontSize: 36,
		fontFamily: 'PixelifySans_Bold',
		color: Colors.title,
		marginBottom: 24,
	},
	input: {
		backgroundColor: '#fff',
		color: Colors.textAlt,
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		fontFamily: 'PixelifySans',
		width: '100%',
	},
	button: {
		backgroundColor: Colors.primary,
		padding: 14,
		borderRadius: 8,
		width: '100%',
	},
	buttonText: {
		color: Colors.button,
		fontSize: 16,
		textAlign: 'center',
		fontFamily: 'PixelifySans_Bold',
	},
	linkText: {
		color: Colors.textAlt,
		textAlign: 'center',
		marginTop: 16,
		fontFamily: 'PixelifySans',
	},
});
