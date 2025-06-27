import { Colors } from '@/constants/Colors';
import { FontSizes, Fonts, LineHeights } from '@/constants/Font';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Image,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Profile() {
	const [profile, setProfile] = useState<{
		username: string | null;
		avatar_url: string | null;
		created_at: string | null;
		bio: string | null;
	} | null>(null);
	const [buddyCount, setBuddyCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const router = useRouter();

	const fetchProfile = async () => {
		setLoading(true);
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			setProfile(null);
			setLoading(false);
			return;
		}

		const { data, error } = await supabase
			.from('profiles')
			.select('username, bio, avatar_url, created_at')
			.eq('id', user.id)
			.single();

		if (error) {
			console.error('Error loading profile:', error.message);
			setProfile(null);
		} else {
			setProfile(data);
		}

		// Fetch buddy count
		const { count, error: buddyError } = await supabase
			.from('buddies')
			.select('*', { count: 'exact', head: true })
			.or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`)
			.eq('status', 'accepted');
		if (!buddyError) setBuddyCount(count || 0);

		setLoading(false);
		setRefreshing(false);
	};

	useEffect(() => {
		fetchProfile();
	}, []);

	const onRefresh = () => {
		setRefreshing(true);
		fetchProfile();
	};

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (!profile) {
		return (
			<View style={styles.center}>
				<Text>No profile found.</Text>
			</View>
		);
	}

	const joinDate = profile.created_at
		? new Date(profile.created_at).toLocaleDateString()
		: 'Unknown';

	return (
		<ScrollView
			contentContainerStyle={{ flexGrow: 1 }}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
		>
			<View style={styles.container}>
				<View style={styles.banner} />
				<View style={styles.avatarWrapper}>
					<Image
						source={
							profile.avatar_url
								? { uri: profile.avatar_url }
								: require('@/assets/images/react-logo.png')
						}
						style={styles.avatar}
					/>
				</View>
				<Text style={styles.username}>{profile.username || 'No username'}</Text>
				<Text style={styles.bio}>{profile.bio || ''}</Text>
				<Text style={styles.joinDate}>Joined: {joinDate}</Text>
				<TouchableOpacity
					style={styles.editButton}
					onPress={() => router.push('/buddies')}
				>
					<Text style={styles.editButtonText}>Buddies: {buddyCount || 0}</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.editButton}
					onPress={() => router.push('/editProfile')}
				>
					<Text style={styles.editButtonText}>Edit Profile</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
		alignItems: 'center',
	},
	banner: {
		width: '100%',
		height: 160,
		backgroundColor: Colors.backgroundAlt,
		marginBottom: 75,
	},
	avatarWrapper: {
		position: 'absolute',
		top: 100,
		left: 0,
		right: 0,
		alignItems: 'center',
		zIndex: 2,
	},
	avatar: {
		width: 120,
		height: 120,
		borderRadius: 60,
		marginBottom: 20,
		backgroundColor: Colors.backgroundAlt,
		borderWidth: 4,
		borderColor: Colors.background,
	},
	username: {
		fontSize: FontSizes.extraLarge,
		fontFamily: Fonts.dogicaPixelBold,
		color: Colors.title,
		marginBottom: 8,
	},
	bio: {
		color: Colors.text,
		marginBottom: 8,
		fontSize: FontSizes.medium,
		fontFamily: Fonts.dogicaPixelBold,
		lineHeight: LineHeights.medium,
	},
	joinDate: {
		color: Colors.textOther,
		fontSize: FontSizes.small,
		fontFamily: Fonts.dogicaPixelBold,
	},
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	editButton: {
		marginTop: 24,
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
		backgroundColor: Colors.backgroundAlt,
	},
	editButtonText: {
		color: '#fff',
		fontWeight: '600',
		fontSize: FontSizes.medium,
		fontFamily: Fonts.dogicaPixelBold,
	},
});
