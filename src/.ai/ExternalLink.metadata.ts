export const componentMetadata = {
  component: {
    name: 'ExternalLink',
    category: 'atoms',
    description: 'External URL displayed in monospace, used in the header project links section.',
    type: 'navigation',
  },
  usage: {
    useCases: ['project URL links in header', 'external references'],
    requiredProps: ['url'],
    commonPatterns: [
      {
        name: 'project-link',
        description: 'Link to a live project',
        composition: "<ExternalLink url='patinascreen.com' href='https://patinascreen.com' />",
      },
    ],
    antiPatterns: [
      {
        scenario: 'Using ExternalLink for internal page navigation',
        reason: 'NavItem has the correct typography and semantics for internal links',
        alternative: 'Use NavItem for internal navigation',
      },
    ],
  },
  composition: {
    slots: {},
    nestedComponents: [],
    commonPartners: ['Header'],
    parentConstraints: ['Header — project-links section'],
  },
  behavior: {
    states: ['default', 'active'],
    interactions: { click: 'opens URL in new tab' },
    responsive: {},
  },
  accessibility: {
    role: 'link',
    keyboardSupport: 'Tab to focus, Enter to open',
    screenReader: 'Reads URL text, opens in new tab',
    focusManagement: 'Standard browser focus ring',
    wcag: 'AA',
  },
  aiHints: {
    priority: 'medium',
    keywords: ['external link', 'url', 'project link', 'monospace link', 'live project'],
    context: 'Use only for external project URLs displayed in monospace in the header — not for internal nav',
  },
} as const;
