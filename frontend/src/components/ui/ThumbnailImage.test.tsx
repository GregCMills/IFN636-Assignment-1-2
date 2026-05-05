import { render, screen, fireEvent } from '@testing-library/react';
import ThumbnailImage from './ThumbnailImage';

describe('ThumbnailImage', () => {
  it('renders nothing when thumbnailUrl is undefined', () => {
    const { container } = render(
      <ThumbnailImage onClick={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when thumbnailUrl is an empty string', () => {
    const { container } = render(
      <ThumbnailImage thumbnailUrl="" onClick={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders an image when thumbnailUrl is provided', () => {
    render(
      <ThumbnailImage thumbnailUrl="/thumb.jpg" onClick={vi.fn()} />
    );
    const img = screen.getByAltText('Thumbnail');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/thumb.jpg');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(
      <ThumbnailImage thumbnailUrl="/thumb.jpg" onClick={onClick} />
    );
    fireEvent.click(screen.getByAltText('Thumbnail'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('stops propagation on click', () => {
    const outerClick = vi.fn();
    const onClick = vi.fn();
    render(
      <div onClick={outerClick}>
        <ThumbnailImage thumbnailUrl="/thumb.jpg" onClick={onClick} />
      </div>
    );
    fireEvent.click(screen.getByAltText('Thumbnail'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(outerClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(
      <ThumbnailImage thumbnailUrl="/thumb.jpg" onClick={vi.fn()} className="custom-class" />
    );
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('custom-class');
  });
});
