import { render, screen, fireEvent } from '@testing-library/react';
import ImageLightbox from './ImageLightbox';

describe('ImageLightbox', () => {
  it('returns null when imageUrl is null', () => {
    const { container } = render(
      <ImageLightbox imageUrl={null} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when imageUrl is an empty string', () => {
    const { container } = render(
      <ImageLightbox imageUrl="" onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the full-size image when imageUrl is provided', () => {
    render(
      <ImageLightbox imageUrl="/full.jpg" onClose={vi.fn()} />
    );
    const img = screen.getByAltText('Full-size preview');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/full.jpg');
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <ImageLightbox imageUrl="/full.jpg" onClose={onClose} />
    );
    fireEvent.click(screen.getByLabelText('Close lightbox'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <ImageLightbox imageUrl="/full.jpg" onClose={onClose} />
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose for non-Escape keys', () => {
    const onClose = vi.fn();
    render(
      <ImageLightbox imageUrl="/full.jpg" onClose={onClose} />
    );
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <ImageLightbox imageUrl="/full.jpg" onClose={onClose} />
    );
    const backdrop = screen.getByAltText('Full-size preview').closest('.fixed')!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cleans up the keydown listener on unmount', () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <ImageLightbox imageUrl="/full.jpg" onClose={onClose} />
    );
    unmount();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
