import { UseCase, type UseCaseConfig } from './UseCase';

const CONFIG: UseCaseConfig = {
  heroLabel: 'Herc Rentals',
  descriptionBoldPrefix: 'Herc Rentals,',
  description:
    'a B2B platform for renting and managing heavy equipment across app and website. I was part of the product team as Senior Product Designer, owning key features including real time tracking and monitoring of heavy machinery in the field.',
  metadata: [
    'Role .......... Senior Product Designer',
    'Scope ......... Mobile app, web platform, design system',
    'Tools ......... Figma',
    'Results ....... 25% quarterly growth in new digital accounts, 150% telematics adoption growth in 12 months',
  ],
  externalLink: { url: 'hercrentals.com' },
  sections: [
    {
      type: 'qa',
      question: 'What was your role in the team?',
      answer:
        'I was responsible for co-creating the visual direction, creating the design system from scratch, designing multiple features and prototyping entire flows, and presenting to very demanding stakeholders. My main area was the fleet management and tracking side of the platform, the most technically complex and demanding part of the product to design for.',
    },
    {
      type: 'qa',
      question: 'What are the conditions someone uses this in?',
      answer:
        'Outdoors on a construction site. Noise, flashing lights, people moving around. Not someone sitting at a desk with time to think. That context shaped every decision about clarity and speed.',
    },
    { type: 'screenshot', label: 'Screenshot 1' },
    {
      type: 'qa',
      question: 'What was the hardest design challenge?',
      answer:
        "The map. Users could draw geofences around jobsites and if a machine crossed that boundary it would trigger an alert. On that same map you'd have trucks, excavators, lifts, all kinds of heavy machinery, each moving or stationary, all in real time. Each with its own state. Working, idle, not working, with a problem. At scale that's a map full of dots stacking on top of each other. We solved that with clustering. Zoomed out you see the cluster. Zoom in and the individual machines appear with their states. A colour and shape system that let operators understand their fleet at a glance without reading anything. A lot of iteration to get there.",
    },
    {
      type: 'qa',
      question: 'There were also construction lights in the product. What was that about?',
      answer:
        'Those big lights that illuminate construction sites at night. Users could schedule them to turn on and off at specific times. Sounds simple but the scheduling logic had a lot of complexity and there was a lot of back and forth getting the toggle behaviour and states right. One of the more interesting problems on the project.',
    },
    { type: 'brand', label: 'Brand visual' },
    {
      type: 'qa',
      question: 'Construction and heavy machinery is not a beautiful world. How did you approach the UI?',
      answer:
        "We spent a lot of time benchmarking and finding the right balance between functionality and sleekness. The standards were high. The colour palette was carefully planned because we had a lot of semantic elements, machine states, alerts, statuses, that needed their own place in the system and had to be used consistently. In an interface full of information and data points, decoration for its own sake wasn't an option. Typography scale, colour, every element had to earn its place. The goal was to strip it back as much as possible while still feeling considered and premium. Unsexy subject matter, sleek product.",
    },
    {
      type: 'qa',
      question: '150% adoption growth in 12 months. Do you take credit for that?',
      answer:
        'Our team was very focused on delivering the best product possible and the client was extremely demanding. The sessions were intense. When you work that hard with that much pressure and the numbers move like that, you believe the design had something to do with it. I do.',
    },
  ],
};

export function HercRentalsContent() {
  return <UseCase config={CONFIG} />;
}
