import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform, View } from 'react-native';

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors.tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: () => (
					<View
						style={{
							backgroundColor: Colors.backgroundAlt,
							flex: 1,
						}}
					/>
				),
				tabBarShowLabel: false,
				tabBarStyle: Platform.select({
					ios: {
						// Use a transparent background on iOS to show the blur effect
						position: 'absolute',
						borderTopColor: 'transparent',
					},
					default: {},
				}),
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Journal',
					tabBarIcon: ({ focused }) => (
						<Image
							source={require('@/assets/images/icons/journal.png')}
							style={{
								width: 36,
								height: 36,
								marginTop: 25,
								tintColor: focused ? '#fff' : undefined,
							}}
							resizeMode="contain"
						/>
					),
				}}
			/>
		</Tabs>
	);
}
