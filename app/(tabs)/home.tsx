import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes, LineHeights } from '@/constants/Font';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Image,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

export default function Profile() {
	const [refreshing, setRefreshing] = useState(false);
	const [dreams, setDreams] = useState<any[]>([]);
	const [profiles, setProfiles] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchFeed();
		setRefreshing(false);
	};

	const fetchFeed = async () => {
		setLoading(true);

		// 1. Get current user
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const userId = user?.id;
		if (!user) {
			setDreams([]);
			setLoading(false);
			return;
		}

		// 2. Get buddy user IDs
		const { data: buddies } = await supabase
			.from('buddies')
			.select('user_id, buddy_id, status')
			.or(`user_id.eq.${userId},buddy_id.eq.${userId}`)
			.eq('status', 'accepted');
		const buddyIds = buddies
			? buddies.map((b) => (b.user_id === userId ? b.buddy_id : b.user_id))
			: [];

		const buddyAndSelfIds = [...buddyIds, userId];

		// 3. Fetch dreams from buddies
		const { data: dreamsData, error } = await supabase
			.from('journals')
			.select('id, title, content, created_at, user_id')
			.in('user_id', buddyAndSelfIds)
			.eq('visibility', 'buddies')
			.order('created_at', { ascending: false });

		if (!error) setDreams(dreamsData || []);

		const { data: profilesData, error: profileDataError } = await supabase
			.from('profiles')
			.select('id, username, avatar_url')
			.in('id', buddyAndSelfIds);

		if (!profileDataError) setProfiles(profilesData || []);

		setLoading(false);
	};

	useEffect(() => {
		fetchFeed();
	}, []);

	return (
		<SafeAreaView style={styles.container}>
			{loading ? (
				<ActivityIndicator size="large" color="#fff" />
			) : (
				<FlatList
					data={dreams}
					keyExtractor={(item) => item.id}
					ListEmptyComponent={
						<Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>
							No dreams from your buddies yet.
						</Text>
					}
					renderItem={({ item }) => {
						const profile = profiles.find((p) => p.id === item.user_id);

						return (
							<TouchableOpacity
								onPress={() =>
									router.push({
										pathname: '/journalContents',
										params: item,
									})
								}
							>
								<View style={styles.senderContainer}>
									<Image
										source={
											profile?.avatar_url
												? { uri: profile.avatar_url }
												: require('@/assets/images/react-logo.png')
										}
										style={styles.avatar}
									/>
									<Text style={styles.username}>
										{profile?.username || 'Unknown'} dreamed of...
									</Text>
								</View>
								<View style={styles.entryItemOuter}>
									<View style={styles.entryRow}>
										{/* Thumbnail */}
										<Image
											source={
												item.thumbnail
													? { uri: item.thumbnail }
													: require('@/assets/images/bitnap_highres_logo.png')
											}
											style={styles.thumbnail}
										/>
										{/* Text */}
										<View style={styles.entryContentCol}>
											<Text style={styles.entryTitle}>{item.title}</Text>
											<Text style={styles.entryContent}>{item.content}</Text>
										</View>
									</View>
									{/* Date and tags on the same row at the bottom */}
									<View style={styles.entryFooter}>
										<View style={styles.tagContainer}>
											{item.tags &&
												item.tags.length > 0 &&
												item.tags.map((tag: string, idx: number) => (
													<Text style={styles.tag} key={idx}>
														{tag}
													</Text>
												))}
										</View>
										<Text style={styles.entryDate}>
											{format(new Date(item.created_at), 'MMM dd, yyyy')}{' '}
											{'    >>'}
										</Text>
									</View>
								</View>
							</TouchableOpacity>
						);
					}}
					style={styles.entryList}
					refreshing={refreshing}
					onRefresh={onRefresh}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		paddingTop: 5,
		backgroundColor: Colors.background,
	},
	entryList: {
		flex: 1,
		width: '100%',
		marginBottom: 48,
	},
	senderContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		gap: 8,
		marginBottom: 8,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 60,
		backgroundColor: Colors.backgroundAlt,
		borderWidth: 4,
		borderColor: Colors.background,
	},
	username: {
		fontFamily: Fonts.dogicaPixelBold,
		fontSize: FontSizes.large,
		color: Colors.textOther,
	},
	entryItemOuter: {
		marginBottom: 16,
		marginHorizontal: 16,
		backgroundColor: Colors.backgroundAlt,
		borderRadius: 8,
		padding: 12,
	},
	entryDateRow: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		marginBottom: 4,
		marginRight: 16,
	},
	entryRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	},
	entryTitle: {
		color: Colors.primary,
		fontSize: FontSizes.medium,
		lineHeight: LineHeights.medium,
		fontWeight: 'bold',
		fontFamily: Fonts.dogicaPixelBold,
		marginBottom: 4,
	},
	entryContent: {
		color: Colors.textOther,
		fontSize: FontSizes.small,
		lineHeight: LineHeights.medium,
		fontFamily: Fonts.dogicaPixel,
	},
	thumbnail: {
		width: 64,
		height: 64,
		borderRadius: 8,
		marginRight: 12,
	},
	entryContentCol: {
		flex: 1,
		justifyContent: 'flex-start',
	},
	tagContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: 6,
	},
	tag: {
		borderRadius: 4,
		paddingHorizontal: 8,
		paddingVertical: 4,
		backgroundColor: Colors.primary,
		color: Colors.text,
		fontSize: FontSizes.small,
		overflow: 'hidden',
		fontFamily: Fonts.dogicaPixel,
		marginRight: 6,
		marginBottom: 4,
	},
	entryFooter: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between', // tags left, date right
		marginTop: 8,
	},
	entryDate: {
		color: Colors.textOther,
		fontSize: FontSizes.small,
		textAlign: 'right',
		fontFamily: Fonts.dogicaPixel,
	},
});
