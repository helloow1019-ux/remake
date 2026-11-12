import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Stamp } from '../ui/Stamp';
import { Chip } from '../ui/Chip';
import { PaperSheet } from '../ui/PaperSheet';
import '../lib/i18n';

describe('Web UI Craft Components', () => {
  it('renders Stamp component with tested status', () => {
    const { container } = render(<Stamp status="TESTED" />);
    expect(container.textContent).toContain('TESTED');
  });

  it('renders Stamp component with AI draft status', () => {
    const { container } = render(<Stamp status="AI_DRAFT" />);
    expect(container.textContent).toContain('DRAFT');
  });

  it('renders Stamp component with danger variant', () => {
    const { container } = render(<Stamp variant="danger">REJECTED</Stamp>);
    expect(container.textContent).toContain('REJECTED');
  });

  it('renders Chip component with selection state', () => {
    const { container, rerender } = render(<Chip label="Plastic Bottles" selected={false} />);
    expect(container.textContent).toContain('Plastic Bottles');
    expect(container.querySelector('button')?.className).toContain('bg-card');

    rerender(<Chip label="Plastic Bottles" selected={true} />);
    expect(container.querySelector('button')?.className).toContain('bg-leaf');
  });

  it('renders PaperSheet with tactile kraft texture', () => {
    const { container } = render(
      <PaperSheet pinColor="brass">
        <div>Manifesto Content</div>
      </PaperSheet>
    );
    expect(container.textContent).toContain('Manifesto Content');
    expect(container.firstElementChild?.className).toContain('kraft-texture');
  });
});

