import { Colors } from '@/constants/Colors';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

export default function Profile() {
	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				contentContainerStyle={{ alignItems: 'center', marginTop: 40 }}
			></ScrollView>
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
});
