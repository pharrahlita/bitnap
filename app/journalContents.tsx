import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes, LineHeights } from '@/constants/Font';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function JournalContents() {
	const params = useLocalSearchParams();
	console.log(params);
	const tags =
		typeof params.tags === 'string'
			? params.tags.split(',').filter(Boolean)
			: Array.isArray(params.tags)
			? params.tags
			: [];

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{params.title || 'Untitled'}</Text>

			<Text style={styles.label}>Date</Text>
			<Text style={styles.content}>
				{params.date
					? new Date(params.date as string).toLocaleDateString()
					: '—'}
			</Text>

			<Text style={styles.label}>Dream Type</Text>
			<Text style={styles.content}>{params.dream_type || '—'}</Text>

			<Text style={styles.label}>Contents</Text>
			<Text style={styles.content}>
				{params.content || 'No content available.'}
			</Text>

			{!!tags.length && (
				<>
					<Text style={styles.label}>Tags</Text>
					<View style={styles.tagsContainer}>
						{tags.map((tag, index) => (
							<Text key={index} style={styles.tag}>
								{tag}
							</Text>
						))}
					</View>
				</>
			)}

			{(params.sleep_time || params.wake_time) && (
				<>
					<Text style={styles.label}>Sleep/Wake</Text>
					<Text style={styles.content}>
						{params.sleep_time
							? `Sleep: ${new Date(
									params.sleep_time as string
							  ).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit',
							  })}`
							: ''}
						{params.wake_time
							? `  Wake: ${new Date(
									params.wake_time as string
							  ).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit',
							  })}`
							: ''}
					</Text>
				</>
			)}

			{(params.mood_before || params.mood_after) && (
				<>
					<Text style={styles.label}>Mood</Text>
					<Text style={styles.content}>
						{params.mood_before ? `Before: ${params.mood_before}` : ''}
						{params.mood_after ? `  After: ${params.mood_after}` : ''}
					</Text>
				</>
			)}

			{params.sleep_quality && Number(params.sleep_quality) > 0 && (
				<>
					<Text style={styles.label}>Sleep Quality</Text>
					<Text style={styles.content}>
						{'★'.repeat(Number(params.sleep_quality))}
						{'☆'.repeat(5 - Number(params.sleep_quality))}
					</Text>
				</>
			)}

			{params.feelings && (
				<>
					<Text style={styles.label}>Feelings Before Sleep</Text>
					<Text style={styles.content}>{params.feelings}</Text>
				</>
			)}

			{params.interpretation && (
				<>
					<Text style={styles.label}>Interpretation</Text>
					<Text style={styles.content}>{params.interpretation}</Text>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: Colors.background,
	},
	title: {
		fontFamily: Fonts.dogicaPixelBold,
		fontSize: FontSizes.extraLarge,
		color: Colors.primary,
	},
	content: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.medium,
		lineHeight: LineHeights.medium,
		color: Colors.textOther,
	},
	label: {
		marginTop: 12,
		fontFamily: Fonts.dogicaPixelBold,
		fontSize: 14,
		color: Colors.primary,
		letterSpacing: 1,
	},
	tagsContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		marginTop: 8,
	},
	tag: {
		borderRadius: 4,
		paddingHorizontal: 8,
		paddingVertical: 4,
		backgroundColor: Colors.primary,
		color: Colors.text,
		marginRight: 8,
	},
});
