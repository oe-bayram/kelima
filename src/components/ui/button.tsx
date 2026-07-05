import { cva, type VariantProps } from 'class-variance-authority';
import { ActivityIndicator, Pressable, type PressableProps, Text } from 'react-native';

import { cn } from '@/lib/utils';

const buttonVariants = cva('flex-row items-center justify-center rounded-xl', {
  variants: {
    variant: {
      default: 'bg-brand',
      secondary: 'bg-neutral-200 dark:bg-neutral-800',
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

/** Spinner-Farbe passend zur Textfarbe der jeweiligen Variante. */
const spinnerColor: Record<NonNullable<VariantProps<typeof buttonVariants>['variant']>, string> = {
  default: '#ffffff',
  destructive: '#ffffff',
  secondary: '#111827',
  outline: '#111827',
  ghost: '#208AEF',
};

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    label: string;
    /** Zeigt einen Spinner statt des Labels und deaktiviert den Button. */
    loading?: boolean;
    className?: string;
  };

export function Button({
  label,
  variant,
  size,
  className,
  disabled,
  loading,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      className={cn(buttonVariants({ variant, size }), isDisabled && 'opacity-50', className)}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor[variant ?? 'default']} />
      ) : (
        <Text className={labelVariants({ variant })}>{label}</Text>
      )}
    </Pressable>
  );
}
