import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
	const router = useRouter();

	return (
		<View style={styles.container}>
			<Text style={styles.title}>bitnap</Text>
			<TouchableOpacity
				style={styles.buttonOutlined}
				onPress={() => router.push('/login')}
			>
				<Text style={[styles.buttonText, { color: Colors.dark.primary }]}>
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
		backgroundColor: '#1c1c1c',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: Colors.dark.primary,
		marginBottom: 40,
	},
	buttonOutlined: {
		backgroundColor: 'transparent',
		borderColor: Colors.dark.primary,
		borderWidth: 2,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 25,
		marginVertical: 10,
		width: '75%',
		alignItems: 'center',
	},
	buttonFilled: {
		backgroundColor: Colors.dark.primary,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 25,
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
