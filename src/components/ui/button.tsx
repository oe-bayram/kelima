import { cva, type VariantProps } from 'class-variance-authority';
import { Pressable, type PressableProps, Text } from 'react-native';

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

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    label: string;
    className?: string;
  };

export function Button({ label, variant, size, className, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cn(buttonVariants({ variant, size }), disabled && 'opacity-50', className)}
      {...props}
    >
      <Text className={labelVariants({ variant })}>{label}</Text>
    </Pressable>
  );
}
