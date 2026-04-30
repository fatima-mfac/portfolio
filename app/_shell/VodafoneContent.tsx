import { UseCase, type UseCaseConfig } from './UseCase';

const CONFIG: UseCaseConfig = {
  heroLabel: 'Vodafone',
  descriptionBoldPrefix: 'Vodafone,',
  description:
    'a broadband app used by millions. I joined the global in-house product team as Senior Product Designer, owning features, contributing to the design system, and making decisions based on real user testing.',
  metadata: [
    'Role .......... Senior Product Designer',
    'Scope ......... Mobile app, design system',
    'Tools ......... Figma',
    'Published ..... Live, 1m+ downloads',
  ],
  sections: [
    {
      type: 'qa',
      question: 'What was it like being part of an in-house product team after years of consultancy?',
      answer:
        'Different in the best way. I was part of the team, not a supplier to it. I owned features, participated in user testing, and made decisions based on what I actually saw users do. That kind of continuity changes how you design. You stop optimising for the handoff and start optimising for the product.',
    },
    {
      type: 'qa',
      question:
        'The app runs across multiple countries with different router models. How do you design for something that behaves differently depending on where you are?',
      answer:
        "The core experience was consistent but everything around it wasn't. Onboarding changed based on which router model you had. Legal copy was different in Italy than in Germany. Some flows were market specific entirely. The design system had to hold across all of that while the content changed underneath it.",
    },
    {
      type: 'qa',
      question: "What did you push for that didn't make it in?",
      answer:
        "Two things. I had ownership of a feature where the value for users was genuinely questionable. It felt like one of those features that exists to signal something, environmental responsibility, more than to actually help anyone. The real saving was very low so we tried to communicate the value in a more abstract way, avoiding showing the actual number. Almost all users in testing pushed back on that. They wanted the real figure, not an abstraction. So that approach didn't work either. The feature was already in development when I joined and had some technical complexity behind it. Sometimes that's just the reality. You're not always in a position to question why something exists, especially as a contractor. If I had been a full employee I would have pushed harder to understand why we went with it despite the user testing pointing in the opposite direction. Either way I gave it my best because that's the job even when you don't fully believe in what you're designing.\n\nThe other one still bothers me. The Wi-Fi illustration, which is the foundation of the entire app, wasn't on the agency's illustration list. What we had looked like a cloud. In user testing people said upload, cloud storage. Not Wi-Fi. I pushed hard. No more resources. We launched with it. I was the only one who seemed to think that was a problem.",
    },
  ],
};

export function VodafoneContent() {
  return <UseCase config={CONFIG} />;
}
