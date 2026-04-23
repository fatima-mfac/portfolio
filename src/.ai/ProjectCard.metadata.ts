export const componentMetadata = {
  component: {
    name: 'ProjectCard',
    category: 'molecules',
    description: 'Project entry card showing category label and role description, links to a case study.',
    type: 'display',
  },
  usage: {
    useCases: ['project listing on index page', 'portfolio entries'],
    requiredProps: ['title', 'role'],
    commonPatterns: [
      {
        name: 'project-list',
        description: 'Column of project cards on the index page',
        composition: "<ProjectCard title='App Patina' role='I built an app...' href='/use-case' />",
      },
    ],
    antiPatterns: [
      {
        scenario: 'Adding images or additional metadata to the card',
        reason: 'The card has exactly two elements by design: label and role description',
        alternative: 'Keep to title + role only as designed',
      },
    ],
  },
  composition: {
    slots: {},
    nestedComponents: [],
    commonPartners: ['FilterTag'],
    parentConstraints: [],
  },
  behavior: {
    states: ['default', 'hover'],
    interactions: { hover: 'background transitions to opaque, role text to primary color' },
    responsive: { width: 'adapts to container width' },
  },
  accessibility: {
    role: 'link (when href provided) or generic',
    keyboardSupport: 'Tab to focus, Enter to navigate when href provided',
    screenReader: 'Reads title then role description',
    focusManagement: 'Standard browser focus ring',
    wcag: 'AA',
  },
  aiHints: {
    priority: 'high',
    keywords: ['project', 'card', 'portfolio', 'case study', 'work', 'entry'],
    context: 'Use for every project entry on the index page — exactly two text elements, no images',
  },
} as const;
