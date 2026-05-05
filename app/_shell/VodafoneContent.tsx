import { UseCase, type UseCaseConfig } from './UseCase';

const CONFIG: UseCaseConfig = {
  heroLabel: 'Vodafone',
  descriptionBoldPrefix: 'Vodafone Broadband,',
  description:
    "an award-winning app that lets millions of customers manage and control their home broadband connection. I joined their global in-house product team as Senior Product Designer, working on one of the most technically complex consumer apps I've worked on.",
  metadata: [
    'Role .......... Senior Product Designer',
    'Scope ......... Mobile app, design system',
    'Tools ......... Figma',
    'Published ..... Live, 1m+ downloads',
  ],
  sections: [
     {
      type: 'qa',
      question: 'How did you end up at Vodafone?',
      answer:
        "Through Deloitte as a contractor. They needed someone autonomous, detail-oriented, with strong critical thinking and comfortable with complex problem solving. I was picked for that. Fully embedded in their global in-house product team as Senior Product Designer.",
    },
    {
      type: 'qa',
      question: 'What does the app actually do?',
      answer:
        "It lets you manage your home Wi-Fi, set up your router, check who's connected, pause internet access, troubleshoot your connection, set up guest networks, and a growing list of features we were actively developing. A highly complex and technical app.",
    },
     {
      type: 'qa',
      question: 'What was the hardest part of the work itself?',
      answer:
        "Making technical things feel human. The product talks to physical devices, routers and extenders, that don't always cooperate. And some features required explaining concepts most users have never heard of in a way that felt safe and obvious. Getting that balance right between copy and visuals took real effort.",
    },
    {
      type: 'qa',
      question: "So it's was a very complex product to work on",
      answer:
        "Very. The app runs across multiple markets, with different router models, different legal content, and sometimes completely different flows. I needed to think that one design decision ripple across all of those variations. It required a level of attention to detail that most app projects don't demand.",
    },
      {
      type: 'qa',
      question: 'What was your day to day like?',
      answer:
        "I worked across the entire product, improving existing flows and taking features through different stages of the design process. I was part of the research process, helping decide what to test and building the prototypes we took into user sessions. I wrote copy, had hands on the design system, and was very close to the dev team daily. In a product this technical that proximity wasn't optional, it was how the work actually got done. What I remember most are the enormous flow maps and all the decision trees we had to maintain to cover every use case.",
    },
     {
      type: 'qa',
      question: "How do you design an app that depends on a physical device behaving reliably?",
      answer:
        "It's genuinely hard, especially when it comes to testing with real users. You have physical devices like routers and extenders that communicate with the app and vice versa. There is a lot that could go wrong and I needed to anticipate more use cases than you can imagine and have fallbacks for pretty much everything.",
    },
    {
      type: 'qa',
      question: 'How did you manage all that complexity?',
      answer:
        'Our workflow was methodic. Figma branches, design system governance, and Transifex for translation strings so we could design in English and trust the platform to distribute the rest. Every line of text had a string attached that we needed to keep in check. Two refinement sessions per week with developers and product managers kept everyone aligned and were crucial to spot problems early, flag edge cases, and readjust flows before handoff.',
    },
        {
      type: 'qa',
      question: 'Some features involved communicating very technical concepts. How did you handle that?',
      answer:
        "First you need to understand them yourself, and sometimes that was truly a challenge. Being close to the dev team on a daily basis was crucial for that. And then comes the harder part: taking something complex and making it feel safe and obvious to someone who just wants their Wi-Fi to work. Concepts like MAC address randomisation, for example, require the user to go into their phone settings and turn off a security feature. Explaining what that is and why it's safe to do on a home network in a usable and beautiful way was genuinely hard. You need a very balanced and simple communication between text and visuals and then test with users.",
    },
    {
      type: 'qa',
      question: 'What was it like being part of an in-house product team after years of consultancy?',
      answer:
        'Different in the best way. The product environment changes how you design. You optimise less for the handoff and more for the product. Everyone is on the same page, working toward the same goals, making informed decisions based on real data. You grow the product, not just launch it. That felt like my natural environment. A lot of people over the years told me I was built for product.',
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
