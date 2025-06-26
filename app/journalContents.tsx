import { Colors } from '@/constants/Colors';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function JournalContents() {
	const params = useLocalSearchParams();
	const tags = Array.isArray(params.tags) ? params.tags : [];

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{params.title || 'Untitled'}</Text>
			<Text style={styles.content}>
				{params.content || 'No content available.'}
			</Text>
			<View style={styles.tagsContainer}>
				{tags.map((tag, index) => (
					<Text key={index} style={styles.tag}>
						{tag}
					</Text>
				))}
			</View>
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
		fontSize: 30,
		fontFamily: 'PixelifySans_Bold',
		color: Colors.title,
		marginBottom: 16,
	},
	content: {
		fontSize: 16,
		color: Colors.textOther,
		marginBottom: 16,
	},
	tagsContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 8,
	},
	tag: {
		borderRadius: 4,
		paddingHorizontal: 8,
		paddingVertical: 4,
		backgroundColor: Colors.primary,
		color: Colors.text,
	},
});
