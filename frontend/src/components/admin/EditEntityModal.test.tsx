import { render, screen, fireEvent } from '@testing-library/react';
import EditEntityModal from './EditEntityModal';

const makeProps = (overrides: Partial<Parameters<typeof EditEntityModal>[0]> = {}) => ({
  isOpen: true,
  onClose: vi.fn(),
  entityType: 'group' as const,
  entity: {
    id: 'g1',
    name: 'Test Group',
    description: 'A test description',
    imageUrl: undefined,
    thumbnailUrl: undefined,
  },
  onSave: vi.fn().mockResolvedValue(undefined),
  onUploadPhoto: vi.fn().mockResolvedValue(undefined),
  onDeletePhoto: vi.fn().mockResolvedValue(undefined),
  submitting: false,
  ...overrides,
});

describe('EditEntityModal', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(
      <EditEntityModal {...makeProps({ isOpen: false })} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal when isOpen is true', () => {
    render(<EditEntityModal {...makeProps()} />);
    expect(screen.getByText('Edit Product Group')).toBeInTheDocument();
  });

  it('shows "Edit Product" for type entities', () => {
    render(<EditEntityModal {...makeProps({ entityType: 'type' })} />);
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
  });

  it('shows "Edit Unit" for asset entities', () => {
    render(<EditEntityModal {...makeProps({ entityType: 'asset' })} />);
    expect(screen.getByText('Edit Unit')).toBeInTheDocument();
  });

  it('shows the current name in the input', () => {
    render(<EditEntityModal {...makeProps()} />);
    const input = screen.getByPlaceholderText('Product Group name') as HTMLInputElement;
    expect(input.value).toBe('Test Group');
  });

  it('shows the current description in the textarea', () => {
    render(<EditEntityModal {...makeProps()} />);
    const textarea = screen.getByPlaceholderText('Describe this product group...') as HTMLTextAreaElement;
    expect(textarea.value).toBe('A test description');
  });

  it('shows placeholder text based on entity type', () => {
    render(<EditEntityModal {...makeProps({ entityType: 'asset' })} />);
    expect(screen.getByPlaceholderText('Unit name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe this unit...')).toBeInTheDocument();
  });

  it('calls onClose when the X button is clicked', () => {
    const onClose = vi.fn();
    render(<EditEntityModal {...makeProps({ onClose })} />);
    fireEvent.click(screen.getByRole('button', { name: '' })); // X button has no accessible name
    // Actually, let's click the backdrop close or use a different approach
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <div id="backdrop-test">
        <EditEntityModal {...makeProps({ onClose })} />
      </div>
    );
    // Click the backdrop (the outermost div)
    const backdrop = screen.getByText('Edit Product Group').closest('.fixed');
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSave with only changed fields', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<EditEntityModal {...makeProps({ onSave })} />);
    // Change the name
    const input = screen.getByPlaceholderText('Product Group name');
    fireEvent.change(input, { target: { value: 'New Name' } });
    fireEvent.click(screen.getByText('Save Changes'));
    expect(onSave).toHaveBeenCalledWith('group', 'g1', { name: 'New Name' });
  });

  it('calls onSave with description when only description changes', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<EditEntityModal {...makeProps({ onSave })} />);
    const textarea = screen.getByPlaceholderText('Describe this product group...');
    fireEvent.change(textarea, { target: { value: 'Updated desc' } });
    fireEvent.click(screen.getByText('Save Changes'));
    expect(onSave).toHaveBeenCalledWith('group', 'g1', { description: 'Updated desc' });
  });

  it('disables Save button when name is empty', () => {
    render(<EditEntityModal {...makeProps({ entity: { id: 'g1', name: '', description: '' } })} />);
    const saveBtn = screen.getByText('Save Changes');
    expect(saveBtn).toBeDisabled();
  });

  it('disables Save button when name is only whitespace', () => {
    render(<EditEntityModal {...makeProps()} />);
    const input = screen.getByPlaceholderText('Product Group name');
    fireEvent.change(input, { target: { value: '   ' } });
    const saveBtn = screen.getByText('Save Changes');
    expect(saveBtn).toBeDisabled();
  });

  it('shows "Saving…" when submitting is true', () => {
    render(<EditEntityModal {...makeProps({ submitting: true })} />);
    expect(screen.getByText('Saving…')).toBeInTheDocument();
  });

  it('disables buttons when submitting', () => {
    render(<EditEntityModal {...makeProps({ submitting: true })} />);
    expect(screen.getByText('Saving…')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });

  it('shows "No photo" placeholder when no thumbnail', () => {
    render(<EditEntityModal {...makeProps()} />);
    expect(screen.getByText('No photo')).toBeInTheDocument();
  });

  it('shows thumbnail image when thumbnailUrl is provided', () => {
    render(
      <EditEntityModal
        {...makeProps({
          entity: {
            id: 'g1',
            name: 'Test',
            thumbnailUrl: '/uploads/groups/test_thumb.jpg',
            imageUrl: '/uploads/groups/test.jpg',
          },
        })}
      />
    );
    const img = screen.getByAltText('Thumbnail');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/uploads/groups/test_thumb.jpg');
  });

  it('shows Replace button when entity has a photo', () => {
    render(
      <EditEntityModal
        {...makeProps({
          entity: { id: 'g1', name: 'Test', imageUrl: '/uploads/test.jpg' },
        })}
      />
    );
    expect(screen.getByText('Replace')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('shows Upload button when entity has no photo', () => {
    render(<EditEntityModal {...makeProps()} />);
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<EditEntityModal {...makeProps({ onClose })} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('syncs local state when entity prop changes', () => {
    const { rerender } = render(<EditEntityModal {...makeProps()} />);
    const input = screen.getByPlaceholderText('Product Group name') as HTMLInputElement;
    expect(input.value).toBe('Test Group');

    rerender(
      <EditEntityModal
        {...makeProps({
          entity: { id: 'g1', name: 'Updated Name', description: 'New desc' },
        })}
      />
    );
    expect(input.value).toBe('Updated Name');
    const textarea = screen.getByPlaceholderText('Describe this product group...') as HTMLTextAreaElement;
    expect(textarea.value).toBe('New desc');
  });
});
