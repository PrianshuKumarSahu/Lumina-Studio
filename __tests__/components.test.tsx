import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import ProgressBar from '@/components/ui/ProgressBar';

describe('UI Component Suite', () => {
  describe('Button Component', () => {
    it('renders with children text', () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('triggers onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Submit</Button>);
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disables button and displays loading indicator when isLoading=true', () => {
      render(<Button isLoading>Save Changes</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('aria-busy', 'true');
    });

    it('applies variant styles correctly', () => {
      const { container } = render(<Button variant="danger">Delete</Button>);
      expect(container.firstChild).toHaveClass('text-red-700');
    });
  });

  describe('Card Component', () => {
    it('renders children with default padding and border', () => {
      render(<Card><h3>Card Content</h3></Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('applies hover transitions when hover prop is true', () => {
      const { container } = render(<Card hover>Interactive Content</Card>);
      expect(container.firstChild).toHaveClass('hover:shadow-md');
    });
  });

  describe('Badge Component', () => {
    it('renders label with accessible pill layout', () => {
      render(<Badge color="text-rose-700" bg="bg-rose-100">Wedding</Badge>);
      const badge = screen.getByText('Wedding');
      expect(badge).toHaveClass('text-rose-700');
      expect(badge).toHaveClass('bg-rose-100');
    });
  });

  describe('Input Component (Accessible)', () => {
    it('associates label with input using generated id', () => {
      render(<Input label="Event Name" placeholder="My Wedding" />);
      const input = screen.getByLabelText('Event Name');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'My Wedding');
    });

    it('displays error message and sets aria-invalid when error is present', () => {
      render(<Input label="Budget" error="Budget is required" />);
      const input = screen.getByLabelText('Budget');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('alert')).toHaveTextContent('Budget is required');
    });
  });

  describe('ProgressBar Component (Accessible)', () => {
    it('renders accessible progressbar with aria attributes', () => {
      render(<ProgressBar value={75} max={100} label="Budget Used" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '75');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
      expect(progressbar).toHaveAttribute('aria-valuetext', '75% completed');
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });
});
