import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState title="Boş" description="Henüz içerik yok." />
    );
    expect(screen.getByRole('heading', { name: 'Boş' })).toBeInTheDocument();
    expect(screen.getByText('Henüz içerik yok.')).toBeInTheDocument();
  });

  it('calls onAction when button clicked', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="T"
        description="D"
        actionText="Yenile"
        onAction={onAction}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Yenile' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders icon when provided', () => {
    const { container } = render(
      <EmptyState
        icon={BookOpen}
        title="Kitap yok"
        description="Açıklama"
      />
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
