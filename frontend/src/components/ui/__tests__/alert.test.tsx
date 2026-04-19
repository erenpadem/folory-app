import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

describe('Alert', () => {
  it('renders with role alert and content', () => {
    render(
      <Alert>
        <AlertTitle>Başlık</AlertTitle>
        <AlertDescription>Açıklama metni</AlertDescription>
      </Alert>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Başlık')).toBeInTheDocument();
    expect(screen.getByText('Açıklama metni')).toBeInTheDocument();
  });
});
