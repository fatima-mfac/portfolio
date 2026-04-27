export const componentMetadata = {
  component: {
    name: 'BackButton',
    category: 'atoms',
    description: 'Material Design arrow-back icon button. Returns the user to the previous page or a specified href.',
    type: 'interactive',
  },
  usage: {
    useCases: ['top of mobile use-case pages', 'returning to a parent listing screen'],
    requiredProps: [],
    commonPatterns: [
      {
        name: 'mobile-use-case-back',
        description: 'Top of mobile use-case page returning to /work',
        composition: "<BackButton href='/work' ariaLabel='Back to Work' />",
      },
      {
        name: 'history-back',
        description: 'Returns to previous browser history entry',
        composition: "<BackButton ariaLabel='Go back' />",
      },
    ],
    antiPatterns: [
      {
        scenario: 'Using BackButton inside the desktop header',
        reason: 'Desktop has the project list nav for navigation; back button is a mobile pattern only',
        alternative: 'Use Header project links on desktop',
      },
      {
        scenario: 'Using BackButton without an aria-label on a meaningful destination',
        reason: 'Screen readers need explicit context for icon-only buttons',
        alternative: "Always pass ariaLabel='Back to <destination>'",
      },
    ],
  },
  composition: {
    slots: {},
    nestedComponents: [],
    commonPartners: [],
    parentConstraints: ['Mobile use-case page top'],
  },
  behavior: {
    states: ['default', 'hover'],
    interactions: { click: 'navigates to href if provided, otherwise router.back()' },
    responsive: {},
  },
  accessibility: {
    role: 'button',
    keyboardSupport: 'Tab to focus, Enter/Space to activate',
    screenReader: 'Announces the aria-label (e.g. "Back to Work")',
    focusManagement: 'Standard browser focus ring',
    wcag: 'AA',
  },
  aiHints: {
    priority: 'medium',
    keywords: ['back', 'back button', 'arrow back', 'return', 'navigate back', 'mobile back'],
    context: "Use at the top of mobile use-case pages to return to /work — not in the desktop header.",
  },
} as const;
