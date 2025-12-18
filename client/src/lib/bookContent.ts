export interface Chapter {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  content: string; // We will use this to simulate the book content
  topics: string[];
  keywords: string[];
  status: "completed" | "in-progress" | "locked";
}

export const bookContent: Chapter[] = [
  {
    id: "overview",
    title: "Book Overview",
    description: "A practical guide for leaders to get real work done with AI.",
    content: `
      <h2>The Leader's Guide to AI Teams</h2>
      <p class="lead">A practical playbook for leaders and professionals to build a digital workforce that actually helps you get things done.</p>
      
      <p>This book isn't about code or complex algorithms. It's about a simple shift: moving from using AI as a <em>tool</em> (like a super-smart calculator) to using AI as a <em>team member</em> (like a capable digital intern).</p>
      
      <p>We'll show you how to build your own "AI workforce" to handle research, scheduling, and analysis, giving you back hours every day to focus on leading.</p>

      <h3>What We'll Cover</h3>
      <ul>
        <li><strong>The Basics:</strong> Understanding what AI can actually do for you today.</li>
        <li><strong>From Tools to Teammates:</strong> How to stop typing prompts and start delegating tasks.</li>
        <li><strong>Your First AI Hires:</strong> Building simple agents for research and scheduling.</li>
        <li><strong>Managing Your Digital Team:</strong> How to give good instructions and check their work.</li>
        <li><strong>Productivity Wins:</strong> Practical ways to save 20+ hours a week.</li>
        <li><strong>Better Decisions:</strong> Using AI to check your blind spots.</li>
        <li><strong>Working Together:</strong> How humans and AI work best side-by-side.</li>
      </ul>
    `,
    topics: ["Overview", "Core Themes", "Strategy"],
    keywords: ["playbook", "AI workforce", "productivity"],
    status: "completed"
  },
  {
    id: "chapter-1",
    title: "Chapter 1",
    subtitle: "AI Fundamentals for Leaders",
    description: "The simple truth about the AI landscape: from chatbots to digital workers.",
    content: `
      <h3>The New Way of Working</h3>
      <p>Work is changing. It used to be that if you wanted to scale your output, you had to hire more people. Now, you can scale your output by adding "digital workers" to your team.</p>

      <h4>The Big Shift: Tools vs. Interns</h4>
      <div class="callout">
        <strong>Think of it this way:</strong> <br/>
        A <strong>Tool</strong> is like a hammer. It sits there until you pick it up and swing it.<br/>
        An <strong>Agent</strong> is like a carpenter. You tell them "build a shelf," and they figure out which tools to use to get it done.
      </div>
      <p>Most people today use AI like a hammer—they type a question into ChatGPT and get an answer. That's great, but it requires you to be there, doing the typing. The real magic happens when you treat AI like a digital intern who can go off and do a task for you.</p>

      <h4>Types of AI Helpers</h4>
      <ul>
        <li><strong>The Creator (Generative AI):</strong> Writes emails, drafts reports, creates images.</li>
        <li><strong>The Forecaster (Predictive AI):</strong> Looks at data and guesses what might happen next.</li>
        <li><strong>The Doer (AI Agents):</strong> Takes a goal ("Plan my trip to London") and does the research, checks flights, and drafts the itinerary.</li>
      </ul>

      <p>You don't need to know how the engine works to drive the car. Similarly, you don't need to know code to lead an AI team. You just need to know how to delegate.</p>
    `,
    topics: [
      "Tools vs. Agents: The Hammer vs. The Carpenter",
      "The evolution: Chatbots → Assistants → Digital Workers",
      "Types of AI: Creators, Forecasters, and Doers",
      "Why this matters for your productivity",
      "Common myths (No, it won't replace you)",
      "The 'Super-Intern' mindset"
    ],
    keywords: ["AI fundamentals", "mindset", "agents", "delegation", "basics"],
    status: "completed"
  },
  {
    id: "chapter-2",
    title: "Chapter 2",
    subtitle: "From Chatbots to Digital Workers",
    description: "Moving beyond simple chats to AI that can take action.",
    content: `
      <h3>Meet Your New Digital Team</h3>
      <p>So, what makes an "AI Agent" different from the ChatGPT window you're used to? It's the difference between asking for advice and asking for a result.</p>

      <h4>What Can an Agent Do?</h4>
      <p>Imagine you have a really smart remote assistant. You can't see them, but you can email them instructions.</p>
      <ul>
        <li><strong>They have Goals:</strong> You say "Find me the best software for X," not just "List software."</li>
        <li><strong>They can Reason:</strong> They can think, "Hmm, this option looks too expensive, I'll look for a cheaper one first."</li>
        <li><strong>They use Tools:</strong> They can browse the web, read PDFs, or use a calculator.</li>
        <li><strong>They Remember:</strong> They know you prefer aisle seats and morning meetings.</li>
      </ul>

      <h4>When to Hire a Digital Worker</h4>
      <p>Don't use an agent for everything. Use them for the stuff that drains your energy:</p>
      <ul>
        <li><strong>Repetitive Stuff:</strong> "Copy data from this email to that spreadsheet every day."</li>
        <li><strong>Research:</strong> "Read these 50 news articles and tell me if anything affects our company."</li>
        <li><strong>Monitoring:</strong> "Watch our competitor's website and let me know if they change their pricing."</li>
      </ul>

      <div class="chart-placeholder">[Visual: Simple diagram showing a user giving a goal to an Agent, and the Agent doing the work]</div>
    `,
    topics: [
      "What is an AI Agent? (The Digital Intern analogy)",
      "Key Skills: Goals, Reasoning, Tools, Memory",
      "Chatbots vs. Copilots vs. Agents",
      "When to use Agents: The Drudge Work Filter",
      "Building your first 'Hire'",
      "Moving from 'Doing' to 'Managing'"
    ],
    keywords: ["digital-workers", "automation", "delegation", "productivity"],
    status: "in-progress"
  },
  {
    id: "chapter-3",
    title: "Chapter 3",
    subtitle: "Building Your First AI Team",
    description: "Identifying the roles you can hand off to your new digital workforce.",
    content: `
      <h3>Who Do You Need on Your Team?</h3>
      <p>Before you start building, you need a hiring plan. Look at your calendar. Where does your time go? Those are the roles we want to fill with AI.</p>

      <h4>Common First Hires</h4>
      <p>Think of these as specialized roles you can spin up instantly.</p>
      
      <div class="grid grid-cols-2 gap-4 my-4">
        <div class="p-4 border rounded bg-muted/20">
          <strong>The Researcher</strong><br>
          "Read these 10 reports and give me a 1-page summary."
        </div>
        <div class="p-4 border rounded bg-muted/20">
          <strong>The Scheduler</strong><br>
          "Find a time that works for everyone and send the invites."
        </div>
        <div class="p-4 border rounded bg-muted/20">
          <strong>The Analyst</strong><br>
          "Look at this spreadsheet and tell me which product is selling best."
        </div>
        <div class="p-4 border rounded bg-muted/20">
          <strong>The Scribe</strong><br>
          "Draft a reply to these emails and summarize my meetings."
        </div>
      </div>
      
      <p>Start with one. Don't try to hire the whole team at once. Master the Researcher first, then move to the Scheduler.</p>
    `,
    topics: [
      "Auditing your week: Where does the time go?",
      "Defining the roles: Researcher, Scheduler, Analyst",
      "Specialists are better than Generalists",
      "Your first AI hire: The Low-Hanging Fruit",
      "Giving them a personality (Manners matter!)",
      "Case study: A CEO's first week with an AI team"
    ],
    keywords: ["hiring-plan", "workflow-audit", "specialists", "first-steps", "roles"],
    status: "locked"
  },
  {
    id: "chapter-4",
    title: "Chapter 4",
    subtitle: "Managing Your Digital Staff",
    description: "How to organize your AI agents so they report to you effectively.",
    content: `
      <h3>Drawing the Org Chart</h3>
      <p>Once you have a few agents, you need to organize them. You don't want 10 different bots messaging you all day. You need a structure.</p>
      
      <h4>The Chief of Staff Agent</h4>
      <p>Imagine having one main assistant who manages all the others. You tell the Chief of Staff, "Plan the marketing launch," and they tell the Research Agent to get data and the Writer Agent to draft copy.</p>

      <p><em>(Content for this chapter is under development...)</em></p>
    `,
    topics: [
      "Introduction to AI Org Charts",
      "The Chief of Staff Model",
      "How to delegate effectively",
      "Agents talking to Agents",
      "Keeping the human in the loop",
      "Real-world examples: The Solopreneur vs. The Team"
    ],
    keywords: ["org-charts", "management", "delegation", "chief-of-staff", "workflows"],
    status: "locked"
  }
];
