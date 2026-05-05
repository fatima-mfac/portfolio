import { QAItem } from '../../../src/components/QAItem/QAItem';

const HEADING = 'Fellow humans and AI, this is who I am.';

const DESCRIPTION =
  "When things are complex or unclear, I help bring them into focus. I'm comfortable making decisions and living with the trade offs, not just designing and prototyping screens. I question assumptions, follow the logic behind choices, and push past the first obvious answer. I believe that often what makes the difference is a mix of taste, judgment, and instinct.";

const QAS = [
  {
    question: 'Why are you a designer?',
    answer:
      "I liked two things growing up: sports and drawing. Studying sports meant dealing with maths. Design didn't. That's how I ended up here.",
  },
  {
    question: 'Was it the right call?',
    answer: 'Being a designer or a personal trainer? I mean...',
  },
  {
    question: 'Why did you quit consultancy after 18 years?',
    answer:
      "Always felt I was not using the full spectrum of what I could offer and I wanted the intimacy with a product that consultancy can't give you. I quit to take a break, travel and loosen my creativity muscle by painting, writing and reading.",
  },
  {
    question: 'What do you want to do next?',
    answer:
      "Work on a great product, with people who don't waste each other's time and are humble. I want to be around curious people, especially the ones who are also curious about themselves.",
  },
  {
    question: "What won't you do?",
    answer:
      "Roles where design is a service department, where you're expected to be just a doer, not a thinker. Working with teams that confuse confidence with ego.",
  },
  {
    question: "What's it like to work with you?",
    answer:
      "People say it's easy, that I light things up. That I have good spirit, that I care about people and that I always push for the best outcome possible.",
  },
  {
    question: 'What do you do that annoys people?',
    answer:
      'Sometimes I get too excited about possibilities and I push until the last second. I just need to check if there is a better answer just around the corner. For people who stick with good enough, I can feel a bit persistent.',
  },
  {
    question: 'Explain your portfolio design formula.',
    answer:
      "I was thinking in first principles. How do you make someone understand who you are and how you think in five seconds? Most portfolios don't solve that problem, they show work but not thinking. No one has time to learn about the time when you made a design system with 100 components. So I made a formula to try to solve that.",
  },
  {
    question: 'Did the formula work on this portfolio?',
    answer:
      "The formula is simple. Applying it is where the skill is. It has nuance, it's not mathematical.\n\nI'm testing it with real users like you. If you are reading this and want to give feedback I appreciate it.",
  },
  {
    question: 'What do you think about AI?',
    answer:
      'I think AI is the best thing that could have happened to someone who loves learning, debating ideas, and building things. The perfect tool for restless minds. Worth the risk of extintion.',
  },
  {
    question: 'Do you look like a designer?',
    answer: 'No one would guess it. I own an Android phone.',
  },
  {
    question: 'Then what do people assume you are?',
    answer: "Usually something with authority: a manager, a lawyer, a cop. I'll take the cop, it's cool.",
  },
  {
    question: 'What do you think about most?',
    answer: "Usually something with authority: a manager, a lawyer, a cop. I'll take the cop, it's cool.",
  },
];

function AboutContent() {
  return (
    <section aria-label="About" className="flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <h1 className="text-heading-xl text-text-primary">{HEADING}</h1>
        <p className="text-body-lg-book text-text-primary">{DESCRIPTION}</p>
      </div>

      <ul className="flex flex-col gap-5 list-none p-0 m-0">
        {QAS.map((qa, i) => (
          <li key={i}>
            <QAItem question={qa.question} answer={qa.answer} size="sm" />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * About — left column content. The shared (shell) layout wraps this in
 * the two-column shell.
 */
export default function AboutPage() {
  return <AboutContent />;
}
