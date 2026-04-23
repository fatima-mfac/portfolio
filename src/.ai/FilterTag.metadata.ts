export const componentMetadata = {
  component: {
    name: 'FilterTag',
    category: 'atoms',
    description: 'Pill-shaped filter chip for toggling project category filters.',
    type: 'interactive',
  },
  usage: {
    useCases: ['project category filtering', 'tag selection'],
    requiredProps: ['label'],
    commonPatterns: [
      {
        name: 'filter-group',
        description: 'Row of filter tags for project filtering',
        composition: "<FilterTag label='All' state='active' /><FilterTag label='Branding' />",
      },
    ],
    antiPatterns: [
      {
        scenario: 'Using FilterTag for navigation',
        reason: 'FilterTag is a toggle button, not a link',
        alternative: 'Use NavItem for navigation',
      },
    ],
  },
  composition: {
    slots: {},
    nestedComponents: [],
    commonPartners: ['ProjectCard'],
    parentConstraints: [],
  },
  behavior: {
    states: ['default', 'active'],
    interactions: { click: 'calls onClick handler, state controlled externally' },
    responsive: {},
  },
  accessibility: {
    role: 'button',
    keyboardSupport: 'Tab to focus, Space/Enter to toggle',
    screenReader: 'Announces pressed state via aria-pressed',
    focusManagement: 'Standard browser focus ring',
    wcag: 'AA',
  },
  aiHints: {
    priority: 'medium',
    keywords: ['filter', 'tag', 'chip', 'category', 'toggle', 'pill'],
    context: 'Use for project category filter chips on the index page — not for navigation or CTAs',
  },
} as const;
