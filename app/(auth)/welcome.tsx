import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Font';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
	const router = useRouter();

	return (
		<View style={styles.container}>
			<Image
				source={require('@/assets/images/bitnap_highres_logo.png')}
				style={{ width: 200, height: 200, marginBottom: 25 }}
				resizeMode="contain"
			/>
			<Text style={styles.title}>bitnap.</Text>
			<TouchableOpacity
				style={styles.buttonOutlined}
				onPress={() => router.push('/login')}
			>
				<Text style={[styles.buttonText, { color: Colors.primary }]}>
					Sign In
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.buttonFilled}
				onPress={() => router.push('/signup')}
			>
				<Text style={styles.buttonText}>Sign Up</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
		backgroundColor: Colors.background,
	},
	title: {
		fontSize: FontSizes.extraExtraLarge,
		fontFamily: Fonts.dogicaPixelBold,
		color: Colors.title,
		marginBottom: 40,
	},
	buttonOutlined: {
		backgroundColor: 'transparent',
		borderColor: Colors.primary,
		borderWidth: 2,
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		width: '75%',
	},
	buttonFilled: {
		backgroundColor: Colors.primary,
		padding: 12,
		borderRadius: 8,
		width: '75%',
	},
	buttonText: {
		color: Colors.button,
		fontSize: FontSizes.medium,
		textAlign: 'center',
		fontFamily: Fonts.dogicaPixelBold,
	},
});
