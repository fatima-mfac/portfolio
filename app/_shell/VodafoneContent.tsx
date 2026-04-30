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
      question: 'How complex was the product?',
      answer:
        "Very. The app runs across multiple markets, with different router models, different legal content, and sometimes completely different flows. We needed to think that one design decision ripple across all of that variation. It required a level of attention to detail that most app projects don't demand.",
    },
    {
      type: 'qa',
      question: 'How did you manage all that complexity?',
      answer:
        'Our workflow was methodic. We worked in Figma branches, managed the design system carefully, and used Transifex to handle all the translation strings so we could design in English and trust the platform to distribute the rest. Every line of text had a specific string attached that we needed to carefully keep in check. Any slip in that process had consequences.',
    },
    {
      type: 'qa',
      question: 'Some features involved communicating very technical concepts. How did you handle that?',
      answer:
        "First you need to understand them yourself, and sometimes that was truly a challenge. Being close to the dev team on a daily basis was crucial for that. And then comes the harder part: taking something complex and making it feel safe and obvious to someone who just wants their Wi-Fi to work. Concepts like MAC address randomisation, for example, require the user to go into their phone settings and turn off a security feature. Explaining what that is and why it's safe to do on a home network is genuinely hard. You need a very balanced and simple communication between text and visuals. The technical detail has to disappear into the copy and the flow.",
    },
    {
      type: 'qa',
      question: "Did you ever have to design something you didn't fully believe in?",
      answer:
        "Oh yes, but that's part of the job sometimes. There are business decisions where the value is not correlated with core user needs but with brand positioning. In this case it was nothing that would harm the user, just a feature that didn't have real value for them. I was responsible for it, and despite that, I did my very best work to improve it.",
    },
    {
      type: 'qa',
      question: "Why didn't you push back harder?",
      answer:
        "I questioned and challenged but the feature was already in development when I joined and I wasn't in a position to question its existence. As a contractor your sphere of influence is limited. I understood it was a strategic positioning move and I have very present that I design for users primarily but also for the business. The key is balance.",
    },
    {
      type: 'qa',
      question: 'Tell me about a lost battle.',
      answer:
        "I have a funny one, so the app has a network status section with ilustrations at the top you see every time you open it. The Wi-Fi one was a cloud with arrows. An upload icon. Nothing to do with Wi-Fi, which is the foundation of the entire app. That bothered me. I pushed for a proper illustration and even suggested prompting AI to generate something. The answer was no, only what's in the design system. It still bothers me to this day.",
    },
  ],
};

export function VodafoneContent() {
  return <UseCase config={CONFIG} />;
}
