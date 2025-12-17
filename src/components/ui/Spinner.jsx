import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <Loader2
      className={`animate-spin text-indigo-600 dark:text-indigo-400 ${sizes[size]} ${className}`}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="xl" />
    </div>
  );
}

export function InlineSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
      <Spinner size="md" className="mr-3" />
      <span>{text}</span>
    </div>
  );
}
