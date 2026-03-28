import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export const BRAND_ICON_COLOR = '#47C96F';
export const BRAND_ICON_STROKE = 2;
export const BRAND_ICON_SIZE = 24;

export type IconComponent = React.ComponentType<any> | LucideIcon;

export interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  as: IconComponent;
  size?: number;
  color?: string;
  strokeWidth?: number;
  motionHover?: boolean;
}

export function BrandIcon({
  as: Icon,
  size = BRAND_ICON_SIZE,
  color = BRAND_ICON_COLOR,
  strokeWidth = BRAND_ICON_STROKE,
  motionHover = false,
  ...rest
}: BrandIconProps) {
  const icon = <Icon size={size} color={color} strokeWidth={strokeWidth} {...rest} />;
  if (motionHover) {
    return <motion.div whileHover={{ scale: 1.1 }}>{icon}</motion.div>;
  }
  return icon;
}

export function withBrandDefaults<TProps extends object>(Icon: IconComponent) {
  return function WrappedIcon(props: Partial<BrandIconProps> & TProps) {
    const { size, color, strokeWidth, motionHover, ...rest } = props as any;
    return (
      <BrandIcon
        as={Icon}
        size={size ?? BRAND_ICON_SIZE}
        color={color ?? BRAND_ICON_COLOR}
        strokeWidth={strokeWidth ?? BRAND_ICON_STROKE}
        motionHover={motionHover ?? false}
        {...(rest as any)}
      />
    );
  };
}
