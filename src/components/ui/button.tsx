import { Ionicons } from '@expo/vector-icons';
import { cva, type VariantProps } from 'class-variance-authority';
import { ActivityIndicator, Pressable, type PressableProps, Text } from 'react-native';

import { cn } from '@/lib/utils';

const buttonVariants = cva('flex-row items-center justify-center gap-2 rounded-xl', {
  variants: {
    variant: {
      default: 'bg-brand',
      secondary: 'bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700',
      outline: 'border border-neutral-300 dark:border-neutral-700',
      ghost: '',
      destructive: 'bg-status-nichtGewusst',
    },
    size: {
      default: 'h-12 px-5',
      sm: 'h-10 px-4',
      lg: 'h-14 px-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const labelVariants = cva('text-base font-semibold', {
  variants: {
    variant: {
      default: 'text-white',
      secondary: 'text-neutral-900 dark:text-white',
      outline: 'text-neutral-900 dark:text-white',
      ghost: 'text-brand',
      destructive: 'text-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type Variant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;

/** Icon- bzw. Spinner-Farbe passend zur Textfarbe der jeweiligen Variante. */
const contentColor: Record<Variant, string> = {
  default: '#ffffff',
  destructive: '#ffffff',
  secondary: '#1A1A18',
  outline: '#1A1A18',
  ghost: '#1A6E51', // primary-600 (Pinien-Grün)
};

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    label: string;
    /** Zeigt einen Spinner statt des Labels und deaktiviert den Button. */
    loading?: boolean;
    /** Optionales Ionicons-Symbol links / rechts vom Label. */
    iconLeft?: keyof typeof Ionicons.glyphMap;
    iconRight?: keyof typeof Ionicons.glyphMap;
    className?: string;
  };

export function Button({
  label,
  variant,
  size,
  className,
  disabled,
  loading,
  iconLeft,
  iconRight,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const v = variant ?? 'default';
  const color = contentColor[v];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      className={cn(buttonVariants({ variant, size }), isDisabled && 'opacity-50', className)}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {iconLeft ? <Ionicons name={iconLeft} size={18} color={color} /> : null}
          <Text className={labelVariants({ variant })}>{label}</Text>
          {iconRight ? <Ionicons name={iconRight} size={18} color={color} /> : null}
        </>
      )}
    </Pressable>
  );
}
