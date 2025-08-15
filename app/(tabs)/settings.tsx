import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Font';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	Alert,
	Image,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

export default function SettingsScreen() {
	const router = useRouter();
	const { user } = useAuth();
	const [profile, setProfile] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [notificationsEnabled, setNotificationsEnabled] = useState(false);
	const [darkModeEnabled, setDarkModeEnabled] = useState(false);

	useEffect(() => {
		loadProfile();
	}, []);

	const loadProfile = async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			setProfile(null);
			setLoading(false);
			return;
		}

		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.single();

			if (error) {
				console.error('Error loading profile:', error);
			} else {
				setProfile(data);
			}
		} catch (err) {
			console.error('Error loading profile:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleEditProfile = () => {
		router.push('/editProfile');
	};

	const handleChangePassword = () => {
		router.push('/changePassword');
	};

	const handleSignOut = async () => {
		Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Sign Out',
				style: 'destructive',
				onPress: async () => {
					const { error } = await supabase.auth.signOut();
					if (error) {
						Alert.alert('Error', 'Failed to sign out');
					}
				},
			},
		]);
	};

	const handleDeleteAccount = () => {
		Alert.alert(
			'Delete Account',
			'Are you sure you want to permanently delete your account? This action cannot be undone.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: () => {
						// TODO: Implement account deletion
						Alert.alert(
							'Coming Soon',
							'Account deletion will be available soon.'
						);
					},
				},
			]
		);
	};

	const SettingItem = ({
		title,
		subtitle,
		onPress,
		rightComponent,
		showArrow = true,
	}: {
		title: string;
		subtitle?: string;
		onPress?: () => void;
		rightComponent?: React.ReactNode;
		showArrow?: boolean;
	}) => (
		<TouchableOpacity
			style={styles.settingItem}
			onPress={onPress}
			disabled={!onPress}
		>
			<View style={styles.settingItemLeft}>
				<Text style={styles.settingTitle}>{title}</Text>
				{subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
			</View>
			{rightComponent ||
				(showArrow && onPress && <Text style={styles.arrow}>›</Text>)}
		</TouchableOpacity>
	);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={styles.loadingText}>Loading...</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.outerContainer}>
			<ScrollView style={styles.container}>
				{/* Profile Section */}
				<View style={styles.profileSection}>
					<Image
						source={
							profile?.avatar_url
								? { uri: profile.avatar_url }
								: {
										uri: 'https://vpbgjvtouzmiuunlvwff.supabase.co/storage/v1/object/public/avatars/default/default_avatar.png',
								  }
						}
						style={styles.avatar}
					/>
					<Text style={styles.username}>
						{profile?.username || 'Unknown User'}
					</Text>
					<Text style={styles.email}>{profile?.email}</Text>
				</View>

				{/* Account Settings */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Account</Text>
					<SettingItem
						title="Edit Profile"
						subtitle="Update your profile information"
						onPress={handleEditProfile}
					/>
					<SettingItem title="Change Password" onPress={handleChangePassword} />
				</View>

				{/* App Settings */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Preferences</Text>
					<SettingItem
						title="Notifications"
						subtitle="Receive daily journal reminders"
						rightComponent={
							<Switch
								value={notificationsEnabled}
								onValueChange={setNotificationsEnabled}
								trackColor={{
									false: Colors.backgroundAlt,
									true: Colors.primary,
								}}
								thumbColor={
									notificationsEnabled ? Colors.button : Colors.textAlt
								}
							/>
						}
						showArrow={false}
					/>
					<SettingItem
						title="Dark Mode"
						subtitle="Switch to dark theme"
						rightComponent={
							<Switch
								value={darkModeEnabled}
								onValueChange={setDarkModeEnabled}
								trackColor={{
									false: Colors.backgroundAlt,
									true: Colors.primary,
								}}
								thumbColor={darkModeEnabled ? Colors.button : Colors.textAlt}
							/>
						}
						showArrow={false}
					/>
				</View>

				{/* Journal Settings */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Journal</Text>
					<SettingItem
						title="Export Data"
						subtitle="Download your journal entries"
						onPress={() => {
							// TODO: Implement data export
							Alert.alert('Coming Soon', 'Data export will be available soon.');
						}}
					/>
					<SettingItem
						title="Privacy Settings"
						subtitle="Manage your data privacy"
						onPress={() => {
							// TODO: Implement privacy settings
							Alert.alert(
								'Coming Soon',
								'Privacy settings will be available soon.'
							);
						}}
					/>
				</View>

				{/* Support */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Support</Text>
					<SettingItem
						title="Help Center"
						onPress={() => {
							Alert.alert('Help', 'Contact support at help@bitnap.com');
						}}
					/>
					<SettingItem
						title="Privacy Policy"
						onPress={() => {
							Alert.alert(
								'Coming Soon',
								'Privacy policy will be available soon.'
							);
						}}
					/>
					<SettingItem
						title="Terms of Service"
						onPress={() => {
							Alert.alert(
								'Coming Soon',
								'Terms of service will be available soon.'
							);
						}}
					/>
				</View>

				{/* Danger Zone */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Account Actions</Text>
					<SettingItem
						title="Sign Out"
						onPress={handleSignOut}
						showArrow={false}
					/>
					<SettingItem
						title="Delete Account"
						subtitle="Permanently delete your account"
						onPress={handleDeleteAccount}
						showArrow={false}
					/>
				</View>

				<View style={styles.footer}>
					<Text style={styles.version}>bitnap v1.0.0</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	outerContainer: {
		flex: 1,
		backgroundColor: Colors.backgroundAlt,
	},
	container: {
		flex: 1,
		backgroundColor: Colors.backgroundAlt,
		marginBottom: 32,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.background,
	},
	loadingText: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.medium,
		color: Colors.text,
	},
	profileSection: {
		alignItems: 'center',
		padding: 24,
		borderBottomWidth: 1,
		borderBottomColor: Colors.backgroundAlt,
	},
	avatar: {
		width: 128,
		height: 128,
		borderRadius: 96,
		backgroundColor: Colors.backgroundAlt,
		marginBottom: 24,
	},
	username: {
		fontFamily: Fonts.dogicaPixelBold,
		fontSize: FontSizes.extraLarge,
		color: Colors.title,
		marginBottom: 4,
	},
	email: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.textAlt,
	},
	section: {
		marginTop: 24,
	},
	sectionTitle: {
		fontFamily: Fonts.dogicaPixelBold,
		fontSize: FontSizes.medium,
		color: Colors.title,
		paddingHorizontal: 16,
		paddingBottom: 8,
		textTransform: 'uppercase',
	},
	settingItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: Colors.backgroundAlt,
		backgroundColor: Colors.background,
	},
	settingItemLeft: {
		flex: 1,
	},
	settingTitle: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.medium,
		color: Colors.text,
		marginBottom: 2,
	},
	settingSubtitle: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.textOther,
		marginTop: 5,
	},
	arrow: {
		fontFamily: Fonts.dogicaPixelBold,
		fontSize: FontSizes.large,
		color: Colors.textAlt,
		marginLeft: 8,
	},
	footer: {
		alignItems: 'center',
		padding: 24,
	},
	version: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.textAlt,
	},
});
