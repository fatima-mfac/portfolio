export const componentMetadata = {
  component: {
    name: 'Header',
    category: 'organisms',
    description: 'Site header with logo, primary nav, and project links. Transparent background.',
    type: 'navigation',
  },
  usage: {
    useCases: ['top of every page'],
    requiredProps: [],
    commonPatterns: [
      {
        name: 'desktop-header',
        description: 'Full header with nav and project links',
        composition: "<Header breakpoint='desktop' />",
      },
      {
        name: 'mobile-header',
        description: 'Mobile header — logo and nav only, no project links',
        composition: "<Header breakpoint='mobile' />",
      },
    ],
    antiPatterns: [
      {
        scenario: 'Adding background color to the header',
        reason: 'The header is intentionally transparent — background comes from the page',
        alternative: 'Control background at the page level',
      },
    ],
  },
  composition: {
    slots: {},
    nestedComponents: ['NavItem'],
    commonPartners: [],
    parentConstraints: ['Place at the top of every page layout'],
  },
  behavior: {
    states: ['default'],
    interactions: {},
    responsive: { breakpoint: "Use breakpoint='mobile' below 768px" },
  },
  accessibility: {
    role: 'banner',
    keyboardSupport: 'Tab through nav links and project links',
    screenReader: 'Primary navigation and project links announced separately',
    focusManagement: 'Standard focus order left to right',
    wcag: 'AA',
  },
  aiHints: {
    priority: 'high',
    keywords: ['header', 'navigation', 'nav', 'logo', 'site header', 'top bar'],
    context: "Use at the top of every page — pass breakpoint='mobile' on small screens to hide project links",
  },
} as const;
