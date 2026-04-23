export const componentMetadata = {
  component: {
    name: 'NavItem',
    category: 'atoms',
    description: 'Text navigation link used in the site header.',
    type: 'navigation',
  },
  usage: {
    useCases: ['primary site navigation', 'header nav links'],
    requiredProps: ['label'],
    commonPatterns: [
      {
        name: 'active-state',
        description: 'Mark the current page',
        composition: "<NavItem label='About' href='/about' state='active' />",
      },
    ],
    antiPatterns: [
      {
        scenario: 'Using NavItem for external project URLs',
        reason: 'ExternalLink uses monospace and different color semantics',
        alternative: 'Use ExternalLink for external URLs',
      },
    ],
  },
  composition: {
    slots: {},
    nestedComponents: [],
    commonPartners: ['Header', 'ExternalLink'],
    parentConstraints: ['Header — logo-and-nav section'],
  },
  behavior: {
    states: ['default', 'active'],
    interactions: { click: 'navigates to href' },
    responsive: {},
  },
  accessibility: {
    role: 'link',
    keyboardSupport: 'Tab to focus, Enter to navigate',
    screenReader: 'Reads label text, announces current page when active',
    focusManagement: 'Standard browser focus ring',
    wcag: 'AA',
  },
  aiHints: {
    priority: 'high',
    keywords: ['nav', 'navigation', 'link', 'menu', 'header link', 'page link'],
    context: 'Use for internal page navigation in the site header — not for external URLs or CTAs',
  },
} as const;
