import { Colors } from '@/constants/Colors';
import { FontSizes, Fonts, LineHeights } from '@/constants/Font';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Image,
	RefreshControl,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function OtherProfile() {
	const params = useLocalSearchParams();
	const navigation = useNavigation();
	const [profile, setProfile] = useState<{
		username: string | null;
		avatar_url: string | null;
		created_at: string | null;
		bio: string | null;
	} | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		navigation.setOptions({
			title: profile?.username ? `${profile.username}'s Profile` : 'Profile',
		});
	}, [profile?.username]);

	const fetchProfile = async () => {
		if (!params.userId) {
			setProfile(null);
			setLoading(false);
			return;
		}
		const { data, error } = await supabase
			.from('profiles')
			.select('username, bio, avatar_url, created_at')
			.eq('id', params.userId)
			.single();
		if (error) {
			setProfile(null);
		} else {
			setProfile(data);
		}

		setLoading(false);
		setRefreshing(false);
	};

	useEffect(() => {
		fetchProfile();
	}, [params.userId]);

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
				<Text>Profile not found.</Text>
			</View>
		);
	}

	const joinDate = profile.created_at
		? new Date(profile.created_at).toLocaleDateString()
		: 'Unknown';

	return (
		<SafeAreaView style={styles.outerContainer}>
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
					<Text style={styles.username}>
						{profile.username || 'No username'}
					</Text>
					<Text style={styles.bio}>{profile.bio || ''}</Text>
					<Text style={styles.joinDate}>Joined: {joinDate}</Text>
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
});
