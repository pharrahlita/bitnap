import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Font';
import { useAuth } from '@/contexts/AuthContext';
import { checkServerConnection } from '@/utils/checkServerConnection';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

export default function MaintenanceScreen() {
	const router = useRouter();
	const { user } = useAuth();
	const [checking, setChecking] = useState(false);

	const handleRetry = async () => {
		setChecking(true);
		try {
			console.log('Maintenance: Checking server connection...');
			const isServerUp = await checkServerConnection();

			if (isServerUp) {
				console.log('Maintenance: Server is back up!');
				// Server is back up, navigate appropriately
				if (user) {
					console.log('Maintenance: User is logged in, going to home');
					router.replace('/');
				} else {
					console.log('Maintenance: No user, going to welcome');
					router.replace('/welcome');
				}
			} else {
				console.log('Maintenance: Server still down');
				Alert.alert(
					'Still Under Maintenance',
					'The server is still unreachable. Please try again in a few minutes.',
					[{ text: 'OK' }]
				);
			}
		} catch (error) {
			console.error('Maintenance: Error checking connection:', error);
			Alert.alert(
				'Connection Error',
				'Unable to check server status. Please try again.',
				[{ text: 'OK' }]
			);
		} finally {
			setChecking(false);
		}
	};

	return (
		<View style={styles.container}>
			<Image
				source={require('@/assets/images/react-logo.png')}
				style={styles.logo}
			/>
			<Text style={styles.title}>App Under Maintenance</Text>
			<Text style={styles.subtitle}>
				We&apos;re currently performing maintenance on our servers.
			</Text>
			<Text style={styles.description}>
				Please check back in a few minutes. We apologize for any inconvenience.
			</Text>
			<TouchableOpacity
				style={[styles.retryButton, checking && styles.retryButtonDisabled]}
				onPress={handleRetry}
				disabled={checking}
			>
				{checking ? (
					<ActivityIndicator color={Colors.background} size="small" />
				) : (
					<Text style={styles.retryButtonText}>Try Again</Text>
				)}
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 32,
	},
	logo: {
		width: 80,
		height: 80,
		marginBottom: 32,
		tintColor: Colors.primary,
	},
	title: {
		fontSize: FontSizes.large,
		fontFamily: Fonts.dogicaPixelBold,
		color: Colors.text,
		marginBottom: 16,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: FontSizes.medium,
		fontFamily: Fonts.dogicaPixel,
		color: Colors.textOther,
		marginBottom: 24,
		textAlign: 'center',
	},
	description: {
		fontSize: FontSizes.small,
		fontFamily: Fonts.dogicaPixel,
		color: Colors.textAlt,
		marginBottom: 32,
		textAlign: 'center',
		lineHeight: 20,
	},
	retryButton: {
		backgroundColor: Colors.primary,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	retryButtonDisabled: {
		backgroundColor: Colors.textAlt,
		opacity: 0.6,
	},
	retryButtonText: {
		color: Colors.background,
		fontFamily: Fonts.dogicaPixelBold,
		fontSize: FontSizes.medium,
	},
});
