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
		backgroundColor: '#1c1c1c',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: 16,
	},
	content: {
		fontSize: 16,
		color: '#aaa',
		marginBottom: 16,
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	tag: {
		backgroundColor: '#333',
		color: '#fff',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		marginRight: 8,
		marginBottom: 8,
	},
});
