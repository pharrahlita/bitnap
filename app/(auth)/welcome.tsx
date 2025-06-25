import { Colors } from '@/constants/Colors';
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
				<Text style={[styles.buttonText, { color: Colors.dark.secondary }]}>
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
		paddingTop: 200,
		paddingBottom: 200,
		backgroundColor: '#3E3748',
	},
	title: {
		fontSize: 48,
		fontWeight: 'bold',
		fontFamily: 'PixelifySans_Bold',
		color: Colors.dark.text,
		marginBottom: 40,
	},
	buttonOutlined: {
		backgroundColor: 'transparent',
		borderColor: Colors.dark.secondary,
		borderWidth: 2,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		marginVertical: 10,
		width: '75%',
		alignItems: 'center',
	},
	buttonFilled: {
		backgroundColor: Colors.dark.secondary,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		marginVertical: 10,
		width: '75%',
		alignItems: 'center',
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
});
