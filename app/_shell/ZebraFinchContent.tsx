import { UseCase, type UseCaseConfig } from './UseCase';

const CONFIG: UseCaseConfig = {
  heroLabel: 'Zebra Finch',
  descriptionBoldPrefix: 'Zebra Finch,',
  description:
    'short lead paragraph describing the project — what it is, the role I played, and the scope. Replace with the final copy.',
  metadata: [
    'Role .......... [role]',
    'Scope ......... [scope]',
    'Tools ......... [tools]',
    'Year .......... [year]',
  ],
  sections: [
    { type: 'qa', question: 'Question 1?', answer: 'Placeholder answer for the first question.' },
    { type: 'screenshot', label: 'Screenshot 1' },
    { type: 'qa', question: 'Question 2?', answer: 'Placeholder answer for the second question.' },
    { type: 'qa', question: 'Question 3?', answer: 'Placeholder answer for the third question.' },
    { type: 'qa', question: 'Question 4?', answer: 'Placeholder answer for the fourth question.' },
    { type: 'brand', label: 'Brand visual' },
    { type: 'qa', question: 'Question 5?', answer: 'Placeholder answer for the fifth question.' },
    { type: 'qa', question: 'Question 6?', answer: 'Placeholder answer for the sixth question.' },
  ],
};

export function ZebraFinchContent() {
  return <UseCase config={CONFIG} />;
}
