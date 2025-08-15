import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Font';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

export default function ChangePasswordScreen() {
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const validatePasswords = () => {
		if (
			!currentPassword.trim() ||
			!newPassword.trim() ||
			!confirmPassword.trim()
		) {
			Alert.alert('Error', 'Please fill in all fields.');
			return false;
		}

		if (newPassword.length < 6) {
			Alert.alert('Error', 'New password must be at least 6 characters long.');
			return false;
		}

		if (newPassword !== confirmPassword) {
			Alert.alert('Error', 'New password and confirmation do not match.');
			return false;
		}

		if (currentPassword === newPassword) {
			Alert.alert(
				'Error',
				'New password must be different from current password.'
			);
			return false;
		}

		return true;
	};

	const handleChangePassword = async () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		if (!validatePasswords()) return;

		setLoading(true);

		try {
			// First verify current password by attempting to sign in
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user?.email) {
				throw new Error('No user email found');
			}

			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: user.email,
				password: currentPassword.trim(),
			});

			if (signInError) {
				throw new Error('Current password is incorrect');
			}

			// Update to new password
			const { error: updateError } = await supabase.auth.updateUser({
				password: newPassword.trim(),
			});

			if (updateError) {
				throw updateError;
			}

			Alert.alert('Success', 'Password updated successfully!', [
				{
					text: 'OK',
					onPress: () => router.back(),
				},
			]);

			// Clear form
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
		} catch (error: any) {
			console.error('Password change error:', error);
			Alert.alert('Error', error.message || 'Failed to update password');
		} finally {
			setLoading(false);
		}
	};

	const isFormValid =
		currentPassword.trim() &&
		newPassword.trim() &&
		confirmPassword.trim() &&
		newPassword === confirmPassword &&
		newPassword.length >= 6;

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.content}>
					<View style={styles.form}>
						<Text style={styles.label}>Current Password</Text>
						<TextInput
							style={styles.input}
							placeholder="Enter current password"
							secureTextEntry
							value={currentPassword}
							onChangeText={setCurrentPassword}
							onFocus={() => Haptics.selectionAsync()}
							placeholderTextColor={Colors.textAlt}
							autoCapitalize="none"
							autoCorrect={false}
						/>

						<Text style={styles.label}>New Password</Text>
						<TextInput
							style={styles.input}
							placeholder="Enter new password (min 6 characters)"
							secureTextEntry
							value={newPassword}
							onChangeText={setNewPassword}
							onFocus={() => Haptics.selectionAsync()}
							placeholderTextColor={Colors.textAlt}
							autoCapitalize="none"
							autoCorrect={false}
						/>

						<Text style={styles.label}>Confirm New Password</Text>
						<TextInput
							style={[
								styles.input,
								confirmPassword &&
									newPassword !== confirmPassword &&
									styles.inputError,
							]}
							placeholder="Confirm new password"
							secureTextEntry
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							onFocus={() => Haptics.selectionAsync()}
							placeholderTextColor={Colors.textAlt}
							autoCapitalize="none"
							autoCorrect={false}
						/>

						{confirmPassword && newPassword !== confirmPassword && (
							<Text style={styles.errorText}>Passwords do not match</Text>
						)}

						<TouchableOpacity
							style={[
								styles.button,
								(!isFormValid || loading) && styles.buttonDisabled,
							]}
							onPress={handleChangePassword}
							disabled={!isFormValid || loading}
						>
							{loading ? (
								<ActivityIndicator color={Colors.button} size="small" />
							) : (
								<Text style={styles.buttonText}>Update Password</Text>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.cancelButton}
							onPress={() => router.back()}
							disabled={loading}
						>
							<Text style={styles.cancelButtonText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	scrollView: {
		flex: 1,
		padding: 24,
	},
	content: {
		flex: 1,
	},
	form: {
		flex: 1,
	},
	label: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.text,
		marginBottom: 8,
		marginTop: 16,
	},
	input: {
		backgroundColor: Colors.backgroundAlt,
		color: Colors.textOther,
		padding: 10,
		borderRadius: 8,
		fontSize: 16, // Regular readable font size
		borderWidth: 1,
		borderColor: 'transparent',
	},
	inputError: {
		borderColor: '#ff4444',
		borderWidth: 1,
	},
	errorText: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: '#ff4444',
		marginTop: 4,
		marginBottom: 8,
	},
	button: {
		backgroundColor: Colors.primary,
		padding: 16,
		borderRadius: 8,
		marginTop: 32,
		alignItems: 'center',
	},
	buttonDisabled: {
		backgroundColor: Colors.textAlt,
		opacity: 0.6,
	},
	buttonText: {
		color: Colors.button,
		fontFamily: Fonts.dogicaPixelBold,
		fontSize: FontSizes.medium,
	},
	cancelButton: {
		padding: 16,
		alignItems: 'center',
		marginTop: 16,
	},
	cancelButtonText: {
		color: Colors.textAlt,
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.medium,
	},
});
