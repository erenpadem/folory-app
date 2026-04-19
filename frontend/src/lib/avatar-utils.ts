/**
 * Avatar utility functions
 */

/**
 * Get initials from a name
 * Examples:
 * - "Eren Padem" -> "EP"
 * - "Ayşe Yılmaz" -> "AY"
 * - "Mehmet" -> "M"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  
  const words = name.trim().split(/\s+/);
  
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  
  // Get first letter of first word and first letter of last word
  const firstInitial = words[0].charAt(0).toUpperCase();
  const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
  
  return firstInitial + lastInitial;
}

/**
 * Get a color based on a string (for consistent avatar colors)
 */
export function getAvatarColor(name: string | null | undefined): string {
  if (!name) return 'bg-gray-500';
  
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

