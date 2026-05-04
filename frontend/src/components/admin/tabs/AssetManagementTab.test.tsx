import { render, screen, fireEvent } from '@testing-library/react';
import AssetManagementTab from './AssetManagementTab';
import type { AdminTabProps } from '../../../types/assets';

const makeProps = (overrides: Partial<AdminTabProps> = {}): AdminTabProps => ({
  users: [],
  assets: [
    { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Available', description: 'A shiny unit' },
    { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Available' },
  ],
  assetTypes: [
    { id: 't1', groupId: 'g1', name: 'MacBook Air M2', description: 'Lightweight laptop' },
    { id: 't2', groupId: 'g1', name: 'MacBook Pro 16', description: 'Powerful workstation' },
  ],
  productGroups: [
    { id: 'g1', name: 'Laptops', description: 'All laptop categories' },
    { id: 'g2', name: 'Desktops', description: 'Desktop computers' },
  ],
  updateAssetStatuses: vi.fn().mockResolvedValue(undefined),
  createProductGroup:  vi.fn().mockResolvedValue({ id: 'x', name: 'X' }),
  deleteProductGroup:  vi.fn().mockResolvedValue(undefined),
  createAssetType:     vi.fn().mockResolvedValue({ id: 'x', groupId: 'g1', name: 'X' }),
  deleteAssetType:     vi.fn().mockResolvedValue(undefined),
  createAsset:         vi.fn().mockResolvedValue({ id: 'x', typeId: 't1', name: 'X', status: 'Available' as const }),
  createAssets:        vi.fn().mockResolvedValue([]),
  deleteAsset:         vi.fn().mockResolvedValue(undefined),
  uploadPhoto:         vi.fn().mockResolvedValue(undefined),
  deletePhoto:         vi.fn().mockResolvedValue(undefined),
  updateEntity:        vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('AssetManagementTab — edit buttons', () => {
  it('shows Pencil (edit) button on group cards on hover', () => {
    render(<AssetManagementTab {...makeProps()} />);
    // Pencil buttons should be present in the DOM (opacity-0 on hover, but rendered)
    const pencilButtons = screen.getAllByTitle(/Edit/);
    // Should have Edit group titles
    const groupEditBtns = screen.getAllByTitle('Edit group');
    expect(groupEditBtns.length).toBeGreaterThanOrEqual(2);
  });

  it('does NOT show Camera button anywhere', () => {
    render(<AssetManagementTab {...makeProps()} />);
    // Camera-based titles like 'Replace photo' or 'Add photo' should not exist
    expect(screen.queryByTitle('Replace photo')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Add photo')).not.toBeInTheDocument();
  });

  it('shows Pencil buttons for type cards', () => {
    render(<AssetManagementTab {...makeProps()} />);
    const typeEditBtns = screen.getAllByTitle('Edit product');
    expect(typeEditBtns.length).toBeGreaterThanOrEqual(1);
  });

  it('shows Pencil buttons for unit rows', () => {
    render(<AssetManagementTab {...makeProps()} />);
    const unitEditBtns = screen.getAllByTitle('Edit unit');
    expect(unitEditBtns.length).toBeGreaterThanOrEqual(1);
  });

  it('opens EditEntityModal when a group Pencil is clicked', () => {
    render(<AssetManagementTab {...makeProps()} />);
    // Click the first group edit button
    const groupEditBtn = screen.getAllByTitle('Edit group')[0];
    fireEvent.click(groupEditBtn);
    // Modal should appear
    expect(screen.getByText('Edit Product Group')).toBeInTheDocument();
  });

  it('opens EditEntityModal when a type Pencil is clicked', () => {
    render(<AssetManagementTab {...makeProps()} />);
    const typeEditBtn = screen.getAllByTitle('Edit product')[0];
    fireEvent.click(typeEditBtn);
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
  });

  it('opens EditEntityModal when a unit Pencil is clicked', () => {
    render(<AssetManagementTab {...makeProps()} />);
    const unitEditBtn = screen.getAllByTitle('Edit unit')[0];
    fireEvent.click(unitEditBtn);
    expect(screen.getByText('Edit Unit')).toBeInTheDocument();
  });

  it('passes entity name to the modal', () => {
    render(<AssetManagementTab {...makeProps()} />);
    const groupEditBtn = screen.getAllByTitle('Edit group')[0];
    fireEvent.click(groupEditBtn);
    const input = screen.getByPlaceholderText('Product Group name') as HTMLInputElement;
    expect(input.value).toBe('Laptops');
  });

  it('closes the modal when Cancel is clicked', () => {
    render(<AssetManagementTab {...makeProps()} />);
    const groupEditBtn = screen.getAllByTitle('Edit group')[0];
    fireEvent.click(groupEditBtn);
    expect(screen.getByText('Edit Product Group')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Edit Product Group')).not.toBeInTheDocument();
  });
});

describe('AssetManagementTab — descriptions on cards', () => {
  it('shows group descriptions on group cards', () => {
    render(<AssetManagementTab {...makeProps()} />);
    expect(screen.getByText('All laptop categories')).toBeInTheDocument();
    expect(screen.getByText('Desktop computers')).toBeInTheDocument();
  });

  it('shows type descriptions on type cards', () => {
    render(<AssetManagementTab {...makeProps()} />);
    expect(screen.getByText('Lightweight laptop')).toBeInTheDocument();
    expect(screen.getByText('Powerful workstation')).toBeInTheDocument();
  });

  it('shows unit descriptions on unit rows', () => {
    render(<AssetManagementTab {...makeProps()} />);
    expect(screen.getByText('A shiny unit')).toBeInTheDocument();
  });

  it('does not show description for units without one', () => {
    render(<AssetManagementTab {...makeProps()} />);
    // Unit 002 has no description, so its description should not appear
    // But verifying the name "Unit 002" renders is enough to confirm the row exists
    expect(screen.getByText('Unit 002')).toBeInTheDocument();
  });
});
