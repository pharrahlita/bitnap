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

	const getPasswordStrength = (password: string) => {
		if (password.length === 0)
			return { level: 0, text: '', color: Colors.textAlt };
		if (password.length < 6)
			return { level: 20, text: 'Too Short', color: '#ff4444' };
		if (password.length < 8)
			return { level: 40, text: 'Weak', color: '#ff8800' };

		let score = 40;
		if (/[a-z]/.test(password)) score += 15;
		if (/[A-Z]/.test(password)) score += 15;
		if (/[0-9]/.test(password)) score += 15;
		if (/[^a-zA-Z0-9]/.test(password)) score += 15;

		if (score < 60) return { level: score, text: 'Fair', color: '#ffaa00' };
		if (score < 85) return { level: score, text: 'Good', color: '#88cc00' };
		return { level: 100, text: 'Strong', color: '#00cc44' };
	};

	const passwordStrength = getPasswordStrength(newPassword);

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

						{/* Password Strength Indicator */}
						{newPassword.length > 0 && (
							<View style={styles.strengthContainer}>
								<View style={styles.strengthBar}>
									<View
										style={[
											styles.strengthFill,
											{
												width: `${passwordStrength.level}%`,
												backgroundColor: passwordStrength.color,
											},
										]}
									/>
								</View>
								<Text
									style={[
										styles.strengthText,
										{ color: passwordStrength.color },
									]}
								>
									{passwordStrength.text}
								</Text>
							</View>
						)}

						{/* Password Requirements */}
						{newPassword.length > 0 && (
							<View style={styles.requirementsContainer}>
								<Text style={styles.requirementsTitle}>
									Password Requirements:
								</Text>
								<View style={styles.requirement}>
									<Text
										style={[
											styles.requirementText,
											newPassword.length >= 6
												? styles.requirementMet
												: styles.requirementUnmet,
										]}
									>
										{newPassword.length >= 6 ? '✓' : '×'} At least 6 characters
									</Text>
								</View>
								<View style={styles.requirement}>
									<Text
										style={[
											styles.requirementText,
											/[a-z]/.test(newPassword)
												? styles.requirementMet
												: styles.requirementUnmet,
										]}
									>
										{/[a-z]/.test(newPassword) ? '✓' : '×'} Lowercase letter
									</Text>
								</View>
								<View style={styles.requirement}>
									<Text
										style={[
											styles.requirementText,
											/[A-Z]/.test(newPassword)
												? styles.requirementMet
												: styles.requirementUnmet,
										]}
									>
										{/[A-Z]/.test(newPassword) ? '✓' : '×'} Uppercase letter
									</Text>
								</View>
								<View style={styles.requirement}>
									<Text
										style={[
											styles.requirementText,
											/[0-9]/.test(newPassword)
												? styles.requirementMet
												: styles.requirementUnmet,
										]}
									>
										{/[0-9]/.test(newPassword) ? '✓' : '×'} Number
									</Text>
								</View>
							</View>
						)}

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
		padding: 12,
		borderRadius: 8,
		fontSize: 16,
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
	strengthContainer: {
		marginTop: 8,
		marginBottom: 12,
	},
	strengthBar: {
		height: 4,
		backgroundColor: Colors.backgroundAlt,
		borderRadius: 2,
		overflow: 'hidden',
		marginBottom: 6,
	},
	strengthFill: {
		height: '100%',
		borderRadius: 2,
		transition: 'width 0.3s ease',
	},
	strengthText: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		textAlign: 'right',
	},
	requirementsContainer: {
		backgroundColor: Colors.backgroundAlt,
		padding: 12,
		borderRadius: 6,
		marginTop: 8,
		marginBottom: 8,
	},
	requirementsTitle: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.text,
		marginBottom: 6,
	},
	requirement: {
		marginBottom: 2,
	},
	requirementText: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
	},
	requirementMet: {
		color: '#00cc44',
	},
	requirementUnmet: {
		color: Colors.textAlt,
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
