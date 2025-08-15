import { Redirect } from 'expo-router';

export default function CreateScreen() {
	// This screen should never actually render since we intercept the tab press
	return <Redirect href="/" />;
}
