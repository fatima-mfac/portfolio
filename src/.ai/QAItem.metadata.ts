export const componentMetadata = {
  component: {
    name: 'QAItem',
    category: 'molecules',
    description: 'Question and answer pair. Size=lg is responsive (sm typography on mobile, lg on desktop) and is the right default everywhere. Size=sm locks to compact typography on every viewport.',
    type: 'display',
  },
  usage: {
    useCases: ['about page Q&A section', 'use-case article Q&A sections'],
    requiredProps: ['question', 'answer'],
    commonPatterns: [
      {
        name: 'about-qa',
        description: 'Small Q&A for the About page',
        composition: "<QAItem question='Why are you a designer?' answer='...' size='sm' />",
      },
      {
        name: 'article-qa',
        description: 'Large Q&A for use-case articles',
        composition: "<QAItem question='Why did you build Patina?' answer='...' size='lg' />",
      },
    ],
    antiPatterns: [
      {
        scenario: 'Adding borders, padding, or dividers inside the component',
        reason: 'QAItem has no internal padding — spacing is handled by the parent layout',
        alternative: 'Add gap/spacing to the parent container',
      },
    ],
  },
  composition: {
    slots: {},
    nestedComponents: [],
    commonPartners: [],
    parentConstraints: ['Parent handles all spacing between items'],
  },
  behavior: {
    states: ['default'],
    interactions: {},
    responsive: { width: 'fills container width' },
  },
  accessibility: {
    role: 'group (implicit via div)',
    keyboardSupport: 'None — display only',
    screenReader: 'Reads question then answer in order',
    focusManagement: 'None',
    wcag: 'AA',
  },
  aiHints: {
    priority: 'high',
    keywords: ['qa', 'question', 'answer', 'faq', 'interview', 'article'],
    context: "Use size='lg' as the default — it's responsive and degrades to compact typography on mobile automatically. Use size='sm' only when you want compact typography to stay even at desktop widths.",
  },
} as const;
