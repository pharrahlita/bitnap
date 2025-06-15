import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	Alert,
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
		<View style={styles.container}>
			<Text style={styles.title}>Create Account</Text>

			<TextInput
				placeholder="Username"
				value={username}
				onChangeText={setUsername}
				autoCapitalize="none"
				style={styles.input}
			/>

			<TextInput
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				keyboardType="email-address"
				autoCapitalize="none"
				style={styles.input}
			/>

			<TextInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				textContentType="newPassword"
				autoComplete="password-new"
				style={styles.input}
			/>

			<TextInput
				placeholder="Confirm Password"
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
				textContentType="newPassword"
				autoComplete="password-new"
				style={styles.input}
			/>

			<TouchableOpacity style={styles.button} onPress={handleSignUp}>
				<Text style={styles.buttonText}>Create Account</Text>
			</TouchableOpacity>

			<TouchableOpacity onPress={() => router.replace('/login')}>
				<Text style={styles.linkText}>Already have an account? Login</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		padding: 24,
		backgroundColor: '#1c1c1c',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: Colors.dark.text,
		marginBottom: 20,
		textAlign: 'center',
	},
	input: {
		backgroundColor: '#2e2e2e',
		color: Colors.dark.text,
		padding: 12,
		borderRadius: 10,
		marginBottom: 16,
	},
	button: {
		backgroundColor: Colors.dark.primary,
		padding: 14,
		borderRadius: 10,
	},
	buttonText: {
		color: Colors.dark.text,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	linkText: {
		color: Colors.dark.primary,
		textAlign: 'center',
		marginTop: 16,
	},
});
