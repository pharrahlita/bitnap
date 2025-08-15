import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Font';
import { pickImage } from '@/utils/pickImage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function EditProfile() {
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [bio, setBio] = useState('');
	const [loading, setLoading] = useState(false);
	const [uploadingAvatar, setUploadingAvatar] = useState(false);

	const PLACEHOLDER_AVATAR_URL =
		'https://vpbgjvtouzmiuunlvwff.supabase.co/storage/v1/object/public/avatars/default/default_avatar.png';
	const [avatarUrl, setAvatarUrl] = useState(PLACEHOLDER_AVATAR_URL);

	useEffect(() => {
		const fetchProfile = async () => {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError || !user) return;

			const { data, error } = await supabase
				.from('profiles')
				.select('username, bio, avatar_url')
				.eq('id', user.id)
				.single();

			if (data) {
				setUsername(data.username || '');
				setBio(data.bio || '');
				setAvatarUrl(data.avatar_url || PLACEHOLDER_AVATAR_URL);
			} else if (error) {
				console.error('Error loading profile:', error.message);
			}
		};

		fetchProfile();
	}, []);

	const validateForm = () => {
		if (!username.trim()) {
			Alert.alert('Error', 'Username is required.');
			return false;
		}

		if (username.trim().length < 3) {
			Alert.alert('Error', 'Username must be at least 3 characters long.');
			return false;
		}

		if (username.trim().length > 20) {
			Alert.alert('Error', 'Username must be less than 20 characters.');
			return false;
		}

		if (bio.length > 500) {
			Alert.alert('Error', 'Bio must be less than 500 characters.');
			return false;
		}

		return true;
	};

	const handleSave = async () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		if (!validateForm()) return;

		setLoading(true);

		try {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (userError || !user) {
				throw new Error('Unable to fetch user');
			}

			const { error } = await supabase
				.from('profiles')
				.update({
					username: username.trim(),
					bio: bio.trim(),
					avatar_url: avatarUrl,
				})
				.eq('id', user.id);

			if (error) {
				throw error;
			}

			Alert.alert('Success', 'Profile updated successfully!', [
				{
					text: 'OK',
					onPress: () => router.back(),
				},
			]);
		} catch (error: any) {
			console.error('Profile update error:', error);
			Alert.alert('Update failed', error.message || 'Failed to update profile');
		} finally {
			setLoading(false);
		}
	};

	const handlePick = async () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setUploadingAvatar(true);

		try {
			const publicUrl = await pickImage();
			if (publicUrl) {
				setAvatarUrl(publicUrl);
				Alert.alert('Success', 'Avatar updated successfully!');
			} else {
				Alert.alert('Error', 'Failed to upload avatar');
			}
		} catch (error) {
			Alert.alert('Error', 'Failed to upload avatar');
		} finally {
			setUploadingAvatar(false);
		}
	};

	const isFormValid =
		username.trim().length >= 3 &&
		username.trim().length <= 20 &&
		bio.length <= 500;

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.content}>
					<TouchableOpacity
						style={[
							styles.avatarButton,
							uploadingAvatar && styles.avatarButtonDisabled,
						]}
						onPress={handlePick}
						disabled={loading || uploadingAvatar}
						activeOpacity={0.7}
					>
						<Image
							source={
								avatarUrl ? { uri: avatarUrl } : { uri: PLACEHOLDER_AVATAR_URL }
							}
							style={styles.avatar}
						/>
						{uploadingAvatar && (
							<ActivityIndicator
								style={styles.avatarLoader}
								color={Colors.primary}
								size="large"
							/>
						)}
					</TouchableOpacity>
					<Text style={styles.avatarHint}>Tap avatar to change</Text>

					<Text style={styles.label}>Username</Text>
					<TextInput
						style={styles.input}
						value={username}
						onChangeText={setUsername}
						placeholder="Enter your username"
						placeholderTextColor={Colors.textAlt}
						onFocus={() => Haptics.selectionAsync()}
						autoCapitalize="none"
						autoCorrect={false}
						maxLength={20}
					/>
					<Text style={styles.charCount}>{username.length}/20 characters</Text>

					<Text style={styles.label}>Bio</Text>
					<TextInput
						style={[styles.input, styles.bioInput]}
						multiline
						value={bio}
						onChangeText={setBio}
						placeholder="Tell us about yourself..."
						placeholderTextColor={Colors.textAlt}
						onFocus={() => Haptics.selectionAsync()}
						textAlignVertical="top"
						maxLength={500}
					/>
					<Text style={styles.charCount}>{bio.length}/500 characters</Text>

					<TouchableOpacity
						style={[
							styles.button,
							(!isFormValid || loading) && styles.buttonDisabled,
						]}
						onPress={handleSave}
						disabled={!isFormValid || loading}
					>
						{loading ? (
							<ActivityIndicator color={Colors.button} size="small" />
						) : (
							<Text style={styles.buttonText}>Save Changes</Text>
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
		fontSize: 16, // Regular readable font size
		borderWidth: 1,
		borderColor: 'transparent',
	},
	bioInput: {
		height: 100,
		paddingTop: 12,
	},
	charCount: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.textAlt,
		textAlign: 'right',
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
	avatar: {
		width: 125,
		height: 125,
		borderRadius: 62.5,
		backgroundColor: Colors.backgroundAlt,
	},
	avatarButton: {
		alignSelf: 'center',
		marginBottom: 8,
		position: 'relative',
	},
	avatarButtonDisabled: {
		opacity: 0.7,
	},
	avatarLoader: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.3)',
		borderRadius: 62.5,
	},
	avatarHint: {
		textAlign: 'center',
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.textAlt,
		marginBottom: 24,
	},
});
