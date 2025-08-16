import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes, LineHeights } from '@/constants/Font';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function JournalContents() {
	const params = useLocalSearchParams();
	console.log(params);
	const tags =
		typeof params.tags === 'string'
			? params.tags.split(',').filter(Boolean)
			: Array.isArray(params.tags)
			? params.tags
			: [];

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const formatTime = (timeString: string) => {
		return new Date(timeString).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const renderStars = (rating: number) => {
		const stars = [];
		for (let i = 1; i <= 5; i++) {
			stars.push(
				<Text key={i} style={styles.star}>
					{i <= rating ? '★' : '☆'}
				</Text>
			);
		}
		return <View style={styles.starsContainer}>{stars}</View>;
	};

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			{/* Header Section */}
			<View style={styles.header}>
				<Text style={styles.title}>{params.title || 'Untitled Dream'}</Text>
				<View style={styles.headerInfo}>
					<Text style={styles.date}>
						{params.date ? formatDate(params.date as string) : '—'}
					</Text>
					{params.visibility && (
						<View style={styles.visibilityBadge}>
							<Text style={styles.visibilityText}>
								{params.visibility === 'buddies' ? '👥 Shared' : '🔒 Private'}
							</Text>
						</View>
					)}
				</View>
				<View style={styles.dreamTypeBadge}>
					<Text style={styles.dreamTypeText}>
						{params.dream_type || 'Standard'} Dream
					</Text>
				</View>
			</View>

			{/* Main Content Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Dream Content</Text>
				<View style={styles.contentContainer}>
					<Text style={styles.content}>
						{params.content || 'No content available.'}
					</Text>
				</View>
			</View>

			{/* Tags Section */}
			{!!tags.length && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Tags</Text>
					<View style={styles.tagsContainer}>
						{tags.map((tag, index) => (
							<View key={index} style={styles.tagBadge}>
								<Text style={styles.tagText}>{tag.trim()}</Text>
							</View>
						))}
					</View>
				</View>
			)}

			{/* Sleep Information Section */}
			{(params.sleep_time ||
				params.wake_time ||
				(params.sleep_quality && Number(params.sleep_quality) > 0)) && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Sleep Information</Text>

					{(params.sleep_time || params.wake_time) && (
						<View style={styles.infoRow}>
							<Text style={styles.label}>Sleep Schedule</Text>
							<View style={styles.timeContainer}>
								{params.sleep_time && (
									<Text style={styles.timeText}>
										🌙 Sleep: {formatTime(params.sleep_time as string)}
									</Text>
								)}
								{params.wake_time && (
									<Text style={styles.timeText}>
										☀️ Wake: {formatTime(params.wake_time as string)}
									</Text>
								)}
							</View>
						</View>
					)}

					{params.sleep_quality && Number(params.sleep_quality) > 0 && (
						<View style={styles.infoRow}>
							<Text style={styles.label}>Sleep Quality</Text>
							<View style={styles.qualityContainer}>
								{renderStars(Number(params.sleep_quality))}
								<Text style={styles.qualityText}>
									{Number(params.sleep_quality)}/5
								</Text>
							</View>
						</View>
					)}
				</View>
			)}

			{/* Mood Section */}
			{(params.mood_before || params.mood_after) && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Mood</Text>
					<View style={styles.moodContainer}>
						{params.mood_before && (
							<View style={styles.moodItem}>
								<Text style={styles.moodLabel}>Before Sleep</Text>
								<Text style={styles.moodEmoji}>{params.mood_before}</Text>
							</View>
						)}
						{params.mood_after && (
							<View style={styles.moodItem}>
								<Text style={styles.moodLabel}>After Waking</Text>
								<Text style={styles.moodEmoji}>{params.mood_after}</Text>
							</View>
						)}
					</View>
				</View>
			)}

			{/* Feelings Section */}
			{params.feelings && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Feelings Before Sleep</Text>
					<View style={styles.contentContainer}>
						<Text style={styles.content}>{params.feelings}</Text>
					</View>
				</View>
			)}

			{/* Interpretation Section */}
			{params.interpretation && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Dream Interpretation</Text>
					<View style={styles.contentContainer}>
						<Text style={styles.content}>{params.interpretation}</Text>
					</View>
				</View>
			)}

			{/* Bottom Padding */}
			<View style={styles.bottomPadding} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	header: {
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: Colors.backgroundAlt,
	},
	title: {
		fontFamily: Fonts.dogicaPixelBold,
		fontSize: FontSizes.extraLarge,
		color: Colors.primary,
		marginBottom: 8,
		lineHeight: LineHeights.extraLarge,
	},
	headerInfo: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	date: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.textAlt,
	},
	visibilityBadge: {
		backgroundColor: Colors.backgroundAlt,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	visibilityText: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.textOther,
	},
	dreamTypeBadge: {
		backgroundColor: Colors.primary,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		alignSelf: 'flex-start',
	},
	dreamTypeText: {
		fontFamily: Fonts.dogicaPixelBold,
		fontSize: FontSizes.small,
		color: Colors.text,
	},
	section: {
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: Colors.backgroundAlt,
	},
	sectionTitle: {
		fontFamily: Fonts.dogicaPixelBold,
		fontSize: FontSizes.medium,
		color: Colors.primary,
		marginBottom: 12,
		letterSpacing: 1,
	},
	contentContainer: {
		backgroundColor: Colors.backgroundAlt,
		padding: 16,
		borderRadius: 8,
	},
	content: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		lineHeight: LineHeights.medium,
		color: Colors.textOther,
	},
	label: {
		fontFamily: Fonts.dogicaPixelBold,
		fontSize: FontSizes.small,
		color: Colors.primary,
		marginBottom: 8,
		letterSpacing: 1,
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	tagBadge: {
		backgroundColor: Colors.backgroundAlt,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: Colors.primary,
	},
	tagText: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.primary,
	},
	infoRow: {
		marginBottom: 16,
	},
	timeContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		backgroundColor: Colors.backgroundAlt,
		padding: 12,
		borderRadius: 8,
		marginTop: 4,
	},
	timeText: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.textOther,
	},
	qualityContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.backgroundAlt,
		padding: 12,
		borderRadius: 8,
		marginTop: 4,
	},
	starsContainer: {
		flexDirection: 'row',
		marginRight: 12,
	},
	star: {
		fontSize: FontSizes.medium,
		color: Colors.primary,
		marginRight: 2,
	},
	qualityText: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.textOther,
	},
	moodContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		backgroundColor: Colors.backgroundAlt,
		padding: 16,
		borderRadius: 8,
	},
	moodItem: {
		alignItems: 'center',
	},
	moodLabel: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.small,
		color: Colors.textAlt,
		marginBottom: 8,
	},
	moodEmoji: {
		fontSize: 32,
	},
	bottomPadding: {
		height: 20,
	},
});
