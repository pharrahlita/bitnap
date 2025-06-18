// Fallback for using MaterialIcons on Android and web.

import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type IconMapping = Record<
	| SymbolViewProps['name']
	| 'moon.new'
	| 'moon.waxing.crescent'
	| 'moon.first.quarter'
	| 'moon.waxing.gibbous'
	| 'moon.full'
	| 'moon.waning.gibbous'
	| 'moon.last.quarter'
	| 'moon.waning.crescent',
	ComponentProps<typeof Icon>['name']
>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
	'house.fill': 'home',
	'paperplane.fill': 'send',
	'chevron.left.forwardslash.chevron.right': 'code',
	'chevron.right': 'chevron-right',
	'moon.new': 'moon-new',
	'moon.waxing.crescent': 'moon-waxing-crescent',
	'moon.first.quarter': 'moon-first-quarter',
	'moon.waxing.gibbous': 'moon-waxing-gibbous',
	'moon.full': 'moon-full',
	'moon.waning.gibbous': 'moon-waning-gibbous',
	'moon.last.quarter': 'moon-last-quarter',
	'moon.waning.crescent': 'moon-waning-crescent',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
	name,
	size = 24,
	color,
	style,
}: {
	name: IconSymbolName;
	size?: number;
	color: string | OpaqueColorValue;
	style?: StyleProp<TextStyle>;
	weight?: SymbolWeight;
}) {
	return <Icon name={MAPPING[name]} size={size} color={color} style={style} />;
}
