import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes } from '@/constants/Font';
import { PropsWithChildren, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function Collapsible({
	children,
	title,
}: PropsWithChildren & { title: string }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.heading}
				onPress={() => setIsOpen((value) => !value)}
				activeOpacity={0.8}
			>
				<IconSymbol
					name="chevron.right"
					size={18}
					weight="medium"
					color={Colors.icon}
					style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
				/>

				<Text style={styles.title}>{title}</Text>
			</TouchableOpacity>
			{isOpen && <View style={styles.content}>{children}</View>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 8,
		marginBottom: 16,
		borderWidth: 4,
		borderStyle: 'solid',
		borderColor: Colors.backgroundAlt,
	},
	heading: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		padding: 8,
		backgroundColor: Colors.backgroundAlt,
	},
	title: {
		fontFamily: Fonts.dogicaPixel,
		fontSize: FontSizes.medium,
		color: Colors.text,
	},
	content: {
		marginTop: 6,
		padding: 8,
	},
});
