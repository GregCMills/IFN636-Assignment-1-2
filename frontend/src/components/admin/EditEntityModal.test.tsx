import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    const input = screen.getByPlaceholderText('e.g. Product Group') as HTMLInputElement;
    expect(input.value).toBe('Test Group');
  });

  it('shows the current description in the textarea', () => {
    render(<EditEntityModal {...makeProps()} />);
    const textarea = screen.getByPlaceholderText('Describe this product group...') as HTMLTextAreaElement;
    expect(textarea.value).toBe('A test description');
  });

  it('shows placeholder text based on entity type', () => {
    render(<EditEntityModal {...makeProps({ entityType: 'asset' })} />);
    expect(screen.getByPlaceholderText('e.g. Unit')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe this unit...')).toBeInTheDocument();
  });

  it('calls onClose when the X button is clicked', () => {
    const onClose = vi.fn();
    render(<EditEntityModal {...makeProps({ onClose })} />);
    // The X button is the first button with an X icon inside the modal
    const buttons = screen.getAllByRole('button');
    const xButton = buttons.find(btn => btn.querySelector('svg'));
    if (xButton) fireEvent.click(xButton);
    expect(onClose).toHaveBeenCalled();
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

  it('calls onSave with only changed fields', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<EditEntityModal {...makeProps({ onSave })} />);
    const input = screen.getByPlaceholderText('e.g. Product Group');
    fireEvent.change(input, { target: { value: 'New Name' } });
    fireEvent.click(screen.getByText('Save Changes'));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('group', 'g1', { name: 'New Name' });
    });
  });

  it('calls onSave with description when only description changes', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<EditEntityModal {...makeProps({ onSave })} />);
    const textarea = screen.getByPlaceholderText('Describe this product group...');
    fireEvent.change(textarea, { target: { value: 'Updated desc' } });
    fireEvent.click(screen.getByText('Save Changes'));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('group', 'g1', { description: 'Updated desc' });
    });
  });

  it('disables Save button when name is empty', () => {
    render(<EditEntityModal {...makeProps({ entity: { id: 'g1', name: '', description: '' } })} />);
    const saveBtn = screen.getByText('Save Changes');
    expect(saveBtn).toBeDisabled();
  });

  it('disables Save button when name is only whitespace', () => {
    render(<EditEntityModal {...makeProps()} />);
    const input = screen.getByPlaceholderText('e.g. Product Group');
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

  it('shows "No photo" placeholder when no image', () => {
    render(<EditEntityModal {...makeProps()} />);
    expect(screen.getByText('No photo')).toBeInTheDocument();
  });

  it('shows image when entity has imageUrl', () => {
    render(
      <EditEntityModal
        {...makeProps({
          entity: {
            id: 'g1',
            name: 'Test',
            imageUrl: '/uploads/groups/test.jpg',
          },
        })}
      />
    );
    const img = screen.getByAltText('Test');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/uploads/groups/test.jpg');
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
  });

  it('shows Upload button when entity has no photo', () => {
    render(<EditEntityModal {...makeProps()} />);
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<EditEntityModal {...makeProps({ onClose })} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('syncs local state when entity prop changes', () => {
    const { rerender } = render(<EditEntityModal {...makeProps()} />);
    const input = screen.getByPlaceholderText('e.g. Product Group') as HTMLInputElement;
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

  describe('photo upload / delete — deferred to Save', () => {
    it('does NOT call onUploadPhoto when a file is selected', () => {
      const onUploadPhoto = vi.fn().mockResolvedValue(undefined);
      render(
        <EditEntityModal
          {...makeProps({
            onUploadPhoto,
            entity: { id: 'g1', name: 'Test', imageUrl: '/uploads/test.jpg' },
          })}
        />
      );

      const file = new File(['dummy'], 'photo.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(onUploadPhoto).not.toHaveBeenCalled();
    });

    it('calls onUploadPhoto on Save when a file was selected', async () => {
      const onUploadPhoto = vi.fn().mockResolvedValue(undefined);
      const onSave = vi.fn().mockResolvedValue(undefined);
      render(
        <EditEntityModal
          {...makeProps({
            onUploadPhoto,
            onSave,
            entity: { id: 'g1', name: 'Test', imageUrl: '/uploads/test.jpg' },
          })}
        />
      );

      const file = new File(['dummy'], 'photo.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(onUploadPhoto).toHaveBeenCalledWith('group', 'g1', file);
      });
    });

    it('does NOT call onDeletePhoto when Remove is clicked', () => {
      const onDeletePhoto = vi.fn().mockResolvedValue(undefined);
      render(
        <EditEntityModal
          {...makeProps({
            onDeletePhoto,
            entity: { id: 'g1', name: 'Test', imageUrl: '/uploads/test.jpg' },
          })}
        />
      );

      const buttons = screen.getAllByRole('button');
      const trashBtn = buttons.find(
        btn => btn.className.includes('bg-red-500/90')
      );
      if (trashBtn) fireEvent.click(trashBtn);

      expect(onDeletePhoto).not.toHaveBeenCalled();
    });

    it('calls onDeletePhoto on Save after Remove was clicked', async () => {
      const onDeletePhoto = vi.fn().mockResolvedValue(undefined);
      const onSave = vi.fn().mockResolvedValue(undefined);
      render(
        <EditEntityModal
          {...makeProps({
            onDeletePhoto,
            onSave,
            entity: { id: 'g1', name: 'Test', imageUrl: '/uploads/test.jpg' },
          })}
        />
      );

      const buttons = screen.getAllByRole('button');
      const trashBtn = buttons.find(
        btn => btn.className.includes('bg-red-500/90')
      );
      expect(trashBtn).toBeTruthy();
      fireEvent.click(trashBtn!);

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(onDeletePhoto).toHaveBeenCalledWith('group', 'g1');
      });
    });

    it('discards pending upload when Cancel is clicked', () => {
      const onUploadPhoto = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();
      render(
        <EditEntityModal
          {...makeProps({
            onUploadPhoto,
            onClose,
            entity: { id: 'g1', name: 'Test', imageUrl: '/uploads/test.jpg' },
          })}
        />
      );

      const file = new File(['dummy'], 'photo.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      fireEvent.click(screen.getByText('Cancel'));

      expect(onUploadPhoto).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('discards pending delete when Cancel is clicked', () => {
      const onDeletePhoto = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();
      render(
        <EditEntityModal
          {...makeProps({
            onDeletePhoto,
            onClose,
            entity: { id: 'g1', name: 'Test', imageUrl: '/uploads/test.jpg' },
          })}
        />
      );

      const buttons = screen.getAllByRole('button');
      const trashBtn = buttons.find(
        btn => btn.className.includes('bg-red-500/90')
      );
      if (trashBtn) fireEvent.click(trashBtn);

      fireEvent.click(screen.getByText('Cancel'));

      expect(onDeletePhoto).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('shows "Change" text on Replace button after file selected', () => {
      render(
        <EditEntityModal
          {...makeProps({
            entity: { id: 'g1', name: 'Test', imageUrl: '/uploads/test.jpg' },
          })}
        />
      );

      const file = new File(['dummy'], 'photo.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByText('Change')).toBeInTheDocument();
    });

    it('shows Undo button after Remove is clicked', () => {
      render(
        <EditEntityModal
          {...makeProps({
            entity: { id: 'g1', name: 'Test', imageUrl: '/uploads/test.jpg' },
          })}
        />
      );

      const buttons = screen.getAllByRole('button');
      const trashBtn = buttons.find(
        btn => btn.className.includes('bg-red-500/90')
      );
      expect(trashBtn).toBeTruthy();
      fireEvent.click(trashBtn!);

      // Re-query after the click — the trash button should now be blue (undo state)
      const updatedButtons = screen.getAllByRole('button');
      const undoBtn = updatedButtons.find(
        btn => btn.className.includes('bg-blue')
      );
      expect(undoBtn).toBeTruthy();
    });
  });
});
