export interface Chapter {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  content: string;
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
      
      <div class="bg-muted/30 p-6 rounded-xl border border-border my-6">
        <h4 class="font-heading font-semibold mb-2">About the Author</h4>
        <p class="mb-0"><strong>Rayo Marji</strong> is the CTO of Arootah, where he leads the intersection of technology and peak performance coaching. This book distills his experience in building AI systems that empower leaders to scale their impact.</p>
      </div>

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
      <p>Work is changing. It used to be that if you wanted to scale your output, you had to hire more people. Now, you can scale your output by adding "digital workers" to your team. At Arootah, we call this the "Performance Multiplier Effect."</p>

      <h4>The Big Shift: Tools vs. Interns</h4>
      <div class="callout">
        <strong>Think of it this way:</strong> <br/>
        A <strong>Tool</strong> is like a hammer. It sits there until you pick it up and swing it.<br/>
        An <strong>Agent</strong> is like a carpenter. You tell them "build a shelf," and they figure out which tools to use to get it done.
      </div>
      <p>Most people today use AI like a hammer—they type a question into ChatGPT and get an answer. That's great, but it requires you to be there, doing the typing. The real magic happens when you treat AI like a digital intern who can go off and do a task for you.</p>

      <h4>Types of AI Helpers</h4>
      <p>To lead effectively, you need to know who you're hiring. The AI landscape has three main categories:</p>
      <ul>
        <li><strong>The Creator (Generative AI):</strong> Writes emails, drafts reports, creates images. They are your creative department.</li>
        <li><strong>The Forecaster (Predictive AI):</strong> Looks at data and guesses what might happen next. They are your analysts.</li>
        <li><strong>The Doer (AI Agents):</strong> Takes a goal ("Plan my trip to London") and does the research, checks flights, and drafts the itinerary. They are your executive assistants.</li>
      </ul>

      <h4>Developing AI Literacy</h4>
      <p>You don't need to learn Python. You don't need to know how a Neural Network weights its parameters. But you <em>do</em> need "AI Literacy." This means understanding:</p>
      <ol>
        <li><strong>Capability:</strong> What can AI reasonably do right now? (e.g., summarize a 50-page PDF? Yes. Write a Pulitzer-winning novel? Not yet.)</li>
        <li><strong>Limitations:</strong> Where does it hallucinate or fail?</li>
        <li><strong>Delegation:</strong> How do I frame a request so the AI understands the context?</li>
      </ol>
      <p>As a leader, your job is to build this literacy not just for yourself, but for your organization.</p>
    `,
    topics: [
      "Tools vs. Agents: The Hammer vs. The Carpenter",
      "The evolution: Chatbots → Assistants → Digital Workers",
      "Types of AI: Creators, Forecasters, and Doers",
      "Why this matters for your productivity",
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

      <h4>The "Delegate-to-Agent" Mindset</h4>
      <p>This is the hardest shift for leaders. We are used to micromanaging software. We click buttons. We drag files. With agents, you have to let go.</p>
      <p>Instead of clicking "Reply," you tell an agent "Draft replies to all these emails, but only send the ones to my team. Save the client ones as drafts for me to review."</p>

      <h4>When to Hire a Digital Worker</h4>
      <p>Don't use an agent for everything. Use them for the stuff that drains your energy:</p>
      <ul>
        <li><strong>Repetitive Stuff:</strong> "Copy data from this email to that spreadsheet every day."</li>
        <li><strong>Research:</strong> "Read these 50 news articles and tell me if anything affects our company."</li>
        <li><strong>Monitoring:</strong> "Watch our competitor's website and let me know if they change their pricing."</li>
      </ul>
    `,
    topics: [
      "What is an AI Agent? (The Digital Intern analogy)",
      "Key Skills: Goals, Reasoning, Tools, Memory",
      "When to use Agents: The Drudge Work Filter",
      "Building your first 'Hire'",
      "Moving from 'Doing' to 'Managing'"
    ],
    keywords: ["digital-workers", "automation", "delegation", "productivity"],
    status: "completed"
  },
  {
    id: "chapter-3",
    title: "Chapter 3",
    subtitle: "Design Your AI Agent Workforce",
    description: "Identify which AI agents you need, define their roles, and build your personal AI team.",
    content: `
      <h3>Auditing Your Workflow</h3>
      <p>Before you build agents, you must know what to delegate. Start by auditing your weekly workflow. Look for tasks that are high-volume, rules-based, or research-heavy.</p>

      <h4>Defining Agent Roles</h4>
      <p>Think of your agents as specialized employees. You wouldn't hire a "General Person"; you'd hire a "Researcher" or a "Scheduler". Defining clear roles prevents confusion and improves performance.</p>
      
      <div class="grid grid-cols-2 gap-4 my-4">
        <div class="p-4 border rounded bg-muted/20">
          <strong>Research Agent</strong><br>
          "Read these 10 reports and give me a 1-page summary." Best for: Competitive analysis, news monitoring.
        </div>
        <div class="p-4 border rounded bg-muted/20">
          <strong>Scheduling Agent</strong><br>
          "Find a time that works for everyone and send the invites." Best for: Calendar tetris, travel logistics.
        </div>
        <div class="p-4 border rounded bg-muted/20">
          <strong>Analysis Agent</strong><br>
          "Look at this spreadsheet and tell me which product is selling best." Best for: Financials, KPI tracking.
        </div>
        <div class="p-4 border rounded bg-muted/20">
          <strong>Communication Agent</strong><br>
          "Draft a reply to these emails and summarize my meetings." Best for: Inbox zero, meeting minutes.
        </div>
      </div>

      <h4>Specialization vs. Generalization</h4>
      <p>It is tempting to try and build one "Super Brain" that does everything. Don't. It will get confused. It is far better to have five specialized agents that do one thing perfectly than one agent that does five things mediocrely.</p>
    `,
    topics: [
      "Auditing your workflow for agent opportunities",
      "Agent role definition",
      "Specialization vs. generalization",
      "Building your first AI agents",
      "Agent personality and interaction style"
    ],
    keywords: ["agent-roles", "workflow-audit", "specialization", "agent-building", "boundaries", "training"],
    status: "completed"
  },
  {
    id: "chapter-4",
    title: "Chapter 4",
    subtitle: "Master AI Agent Org Charts",
    description: "Create organizational structures for your AI agents just like a human team.",
    content: `
      <h3>Designing the Hierarchy</h3>
      <p>As you scale your agent workforce, you need structure. An "AI Org Chart" defines how agents report to you and to each other. Just like Arootah advises for human teams, your digital team needs clear reporting lines.</p>
      
      <h4>The Chief AI Agent (The Orchestrator)</h4>
      <p>At the top of your hierarchy sits the Orchestrator—or Chief AI Agent. This agent's job is to understand your high-level intent and delegate tasks to specialist agents. You talk to the Chief, and the Chief talks to the team.</p>
      
      <p><strong>Example Workflow:</strong></p>
      <ol>
        <li><strong>You:</strong> "Plan a launch event for Q3."</li>
        <li><strong>Chief Agent:</strong> Breaks this down.
            <ul>
                <li>Tells <em>Research Agent</em> to find venues.</li>
                <li>Tells <em>Finance Agent</em> to calculate budget.</li>
                <li>Tells <em>Scheduling Agent</em> to find dates.</li>
            </ul>
        </li>
        <li><strong>Chief Agent:</strong> Compiles their answers and presents you with 3 options.</li>
      </ol>

      <h4>Delegation Frameworks</h4>
      <p>How do agents hand off work? You need protocols.
      <br/>
      <strong>Sequential:</strong> Agent A does work, passes to Agent B.<br/>
      <strong>Parallel:</strong> Agent A and Agent B work at the same time, Agent C combines their work.<br/>
      <strong>Routing:</strong> The Chief Agent decides if a task goes to Agent A or Agent B based on the topic.
      </p>
    `,
    topics: [
      "Introduction to AI agent org charts",
      "Designing your AI agent hierarchy",
      "The Chief AI Agent / Orchestrator",
      "Delegation frameworks",
      "Agent-to-agent communication",
      "Vertical vs. horizontal structures"
    ],
    keywords: ["org-charts", "hierarchy", "delegation", "coordination", "workflows", "orchestration"],
    status: "completed"
  },
  {
    id: "chapter-5",
    title: "Chapter 5",
    subtitle: "AI Agent Delegation & Management",
    description: "Apply proven delegation principles to AI agents, monitor performance, and optimize.",
    content: `
      <h3>Managing Your Digital Staff</h3>
      <p>Managing an AI agent is surprisingly similar to managing a junior human employee. If you give vague instructions, you get vague results.</p>
      
      <h4>The Arootah Delegation Principles (AI Edition)</h4>
      <ul>
        <li><strong>Clear Instructions:</strong> Define the "Definition of Done." What exactly does the output look like? Format? Length? Tone?</li>
        <li><strong>Success Criteria:</strong> How will the agent know if it succeeded? Give it examples of "good" work.</li>
        <li><strong>Constraints:</strong> What is it NOT allowed to do? (e.g., "Do not email clients directly without my approval.")</li>
      </ul>

      <h4>KPIs for Bots</h4>
      <p>Yes, your agents need KPIs.
      <br/>
      <em>Accuracy:</em> How often do I have to correct its work?<br/>
      <em>Speed:</em> How fast does it turn around a request?<br/>
      <em>Autonomy:</em> How many clarifying questions does it ask?
      </p>
      
      <h4>Feedback Loops</h4>
      <p>When an agent fails, don't just fix the work yourself. Fix the <em>instructions</em> (the prompt). Treat every error as a bug in your delegation system. Tell the agent, "That was wrong because X. Next time, do Y." They learn instantly if you update their system prompt.</p>
    `,
    topics: [
      "Applying delegation principles to AI",
      "Clear instructions and success criteria",
      "Agent KPIs and tracking",
      "Feedback loops and correction",
      "Accountability systems"
    ],
    keywords: ["delegation", "management", "KPIs", "monitoring", "feedback", "accountability"],
    status: "completed"
  },
  {
    id: "chapter-6",
    title: "Chapter 6",
    subtitle: "AI Agents for Time Mastery",
    description: "Deploy AI agents to handle scheduling, communications, and reclaim your time.",
    content: `
      <h3>Reclaiming Your Most Valuable Asset</h3>
      <p>Time is the one resource you can't buy more of—unless you have agents. This chapter focuses on the practical "Time-Buying" agents.</p>

      <h4>The Scheduling Agent</h4>
      <p><strong>The Problem:</strong> "When are you free?" emails that go back and forth 10 times.<br/>
      <strong>The Agent Solution:</strong> An agent that has access to your calendar and your preferences. It negotiates times with other humans (or their agents) and only bothers you when the meeting is set.</p>

      <h4>The Inbox Triage Agent</h4>
      <p><strong>The Problem:</strong> 200 unread emails, 190 of which are noise.<br/>
      <strong>The Agent Solution:</strong> An agent that scans every incoming email. It labels them: "Urgent," "Read Later," "Spam," or "Draft Reply." It can draft responses to simple questions ("Where is the office?") automatically.</p>

      <h4>The Meeting Prep Agent</h4>
      <p>Never walk into a meeting unprepared again. Your agent can scan the attendees' LinkedIn profiles, read the last 3 emails you exchanged with them, and prepare a "cheat sheet" for you 10 minutes before the call.</p>
      
      <div class="callout">
        <strong>Case Study:</strong> How one Executive saved 20 hours/week by automating scheduling and email triage.
      </div>
    `,
    topics: [
      "Scheduling agent: Calendar optimization",
      "Email agent: Triage and drafting",
      "Task management agent",
      "Meeting agent: Prep and notes",
      "Case study: Saving 20 hours/week"
    ],
    keywords: ["scheduling", "email", "time-management", "automation", "SAOM"],
    status: "completed"
  },
  {
    id: "chapter-7",
    title: "Chapter 7",
    subtitle: "AI Agents for Decision Intelligence",
    description: "Use AI agents to analyze scenarios, challenge assumptions, and support better decisions.",
    content: `
      <h3>Data-Driven Decisions on Autopilot</h3>
      <p>Leaders are paid to make decisions. But bad decisions usually happen because of (a) lack of data, or (b) cognitive bias. Agents help with both.</p>
      
      <h4>The Research & Analysis Agent</h4>
      <p>Instead of guessing market trends, have an agent monitor 50 competitor websites every day. Have it summarize their pricing changes in a weekly report. You now have perfect situational awareness without the effort.</p>

      <h4>The "Devil's Advocate" Agent</h4>
      <p>We all have confirmation bias. We love ideas that agree with us. Build a "Critic Agent" whose only job is to poke holes in your plan.
      <br/>
      <strong>You:</strong> "I think we should launch in Asia."
      <br/>
      <strong>Critic Agent:</strong> "Here are 5 reasons why that might fail, based on current regulatory trends and competitor density."
      </p>
      
      <h4>Scenario Planning</h4>
      <p>Use agents to run "What If" simulations. "Agent, assume our revenue drops 20%. Adjust the budget spreadsheet to show me where we'd need to cut."</p>
    `,
    topics: [
      "Analysis agent: Data processing",
      "Research agent: Competitive intelligence",
      "Scenario planning agent",
      "Devil's advocate agent: Challenging assumptions",
      "Agent-supported decision frameworks"
    ],
    keywords: ["decisions", "analysis", "scenarios", "insights", "intelligence"],
    status: "completed"
  },
  {
    id: "chapter-8",
    title: "Chapter 8",
    subtitle: "Strategic Planning & Execution",
    description: "Deploy agents to track goals, monitor progress, and drive initiatives forward.",
    content: `
      <h3>Turning Strategy into Action</h3>
      <p>Strategy often fails in execution. People get busy and forget the big goals. Agents don't forget.</p>

      <h4>The Goal-Tracking Agent</h4>
      <p>Connect an agent to your project management software. Its job isn't to <em>do</em> the work, but to <em>nag</em> (politely) about it.
      <br/>
      "Hey Rayo, the Q3 objective is at risk. We are 2 weeks behind schedule on the website launch. Do you want to schedule a sync with the team?"</p>

      <h4>The Strategic Research Agent</h4>
      <p>Strategy requires looking outside the building. Set up an agent to constantly scan for "Strategic Threats." New technology? New regulation? New competitor? It alerts you only when something strategic shifts.</p>
      
      <h4>Performance Analytics Agent</h4>
      <p>Automate your dashboards. Don't spend Friday manually updating Excel. Have an agent pull the data from Salesforce/Stripe/Google Analytics and generate the "Monday Morning Scorecard" for you automatically.</p>
    `,
    topics: [
      "Goal-tracking agent",
      "Strategic research agent",
      "Performance analytics agent",
      "Project management agent",
      "Agent-driven strategic reviews"
    ],
    keywords: ["strategy", "goals", "analytics", "forecasting", "execution"],
    status: "completed"
  },
  {
    id: "chapter-9",
    title: "Chapter 9",
    subtitle: "Collaborative Human-AI Ecosystem",
    description: "Design seamless collaboration between humans and AI agents.",
    content: `
      <h3>Humans and Machines, Working Together</h3>
      <p>The future isn't AI replacing humans. It's Humans + AI replacing Humans alone. But how do they talk to each other?</p>

      <h4>Handoff Protocols</h4>
      <p>When does the agent stop and the human start?
      <br/>
      <strong>The "80% Rule":</strong> Let the agent do the first 80% of the work (drafting, researching, outlining). The human does the final 20% (polishing, deciding, approving). This optimizes for human "judgment" rather than human "grunt work."</p>

      <h4>Team Integration</h4>
      <p>How do you introduce an agent to your human team?
      <br/>
      Don't hide it. Give it a name. Give it an email address. "Hey team, 'Atlas' is our new scheduling bot. Cc him if you need a meeting booked." Treat it as a utility player that supports everyone.</p>

      <h4>Escalation</h4>
      <p>Agents need to know when they are out of their depth. Programming "humility" is key. "I cannot find that answer, would you like me to flag this for a human specialist?" is a perfect agent response.</p>
    `,
    topics: [
      "Human-agent collaboration models",
      "Communication protocols",
      "Agent transparency",
      "Escalation procedures",
      "Hybrid workflows"
    ],
    keywords: ["collaboration", "protocols", "transparency", "escalation", "hybrid-teams"],
    status: "completed"
  },
  {
    id: "chapter-10",
    title: "Chapter 10",
    subtitle: "Leading Organizations in the Agent Era",
    description: "Navigate organizational adoption, design enterprise architectures, and manage change.",
    content: `
      <h3>Scaling Up: The Enterprise Agent Strategy</h3>
      <p>You've built your personal agents. Now, how do you scale this to a 100 or 1000 person company?</p>

      <h4>Departmental Agents</h4>
      <p>Every department should have its own "Agent Team."
      <br/>
      <strong>HR Agents:</strong> Answer benefits questions, screen resumes, schedule interviews.<br/>
      <strong>Sales Agents:</strong> Qualify leads, automate follow-ups, prep account executives.<br/>
      <strong>Finance Agents:</strong> Audit expenses, process invoices, forecast cash flow.
      </p>

      <h4>Change Management</h4>
      <p>People will be afraid. "Is this bot taking my job?"
      <br/>
      <strong>Leadership Message:</strong> "We are not automating <em>jobs</em>. We are automating <em>tasks</em>. We want you to spend less time copying data and more time talking to customers."
      <br/>
      Show them how agents make their lives easier, not harder.</p>

      <h4>Governance</h4>
      <p>Who is responsible if a bot messes up? You need a "Responsible AI" policy. Humans must always remain accountable for the output of their agents.</p>
    `,
    topics: [
      "Enterprise AI agent org charts",
      "Organizational agent roles (HR, Sales, Ops)",
      "Change management and culture",
      "Addressing workforce concerns",
      "Case study: Company-wide transformation"
    ],
    keywords: ["enterprise", "scaling", "change-management", "culture", "governance"],
    status: "completed"
  },
  {
    id: "chapter-11",
    title: "Chapter 11",
    subtitle: "Ethics, Governance & Responsibility",
    description: "Establish ethical guidelines, security protocols, and frameworks for responsible deployment.",
    content: `
      <h3>Keeping It Safe and Ethical</h3>
      <p>With great power comes great responsibility. Unleashing autonomous agents on your data requires guardrails.</p>

      <h4>Data Privacy</h4>
      <p>Rule #1: Know where your data is going. Are you using a public model that trains on your data? Or a private instance? Never put sensitive PII (Personally Identifiable Information) or trade secrets into a public, unsecured agent.</p>

      <h4>Bias and Fairness</h4>
      <p>Agents learn from data. If your historical hiring data is biased, your "Recruiter Agent" will be biased. You must audit your agents for fairness regularly.</p>

      <h4>Transparency</h4>
      <p>The "Bot Disclosure" rule: If a human is talking to a bot, they should know it. Don't trick customers into thinking an agent is a human. It erodes trust.</p>

      <h4>The Kill Switch</h4>
      <p>Always have a way to shut it down instantly. If an agent starts emailing the wrong people, you need a big red "Stop" button.</p>
    `,
    topics: [
      "Agent governance frameworks",
      "Data privacy and security",
      "Ethical considerations",
      "Transparency and disclosure",
      "Fail-safes and kill switches"
    ],
    keywords: ["ethics", "governance", "security", "privacy", "compliance"],
    status: "completed"
  },
  {
    id: "chapter-12",
    title: "Chapter 12",
    subtitle: "Future-Proofing with Advanced Systems",
    description: "Prepare for the evolution of AI agents, multi-agent systems, and AGI.",
    content: `
      <h3>Where We Are Going</h3>
      <p>We are just at the beginning. Today's agents are like the first iPhones. Clunky, but revolutionary. What's coming next?</p>

      <h4>Multi-Agent Swarms</h4>
      <p>Soon, agents will talk to other agents outside your company. Your "Buying Agent" will negotiate directly with a supplier's "Selling Agent" to get the best price for office supplies, without either human involved.</p>

      <h4>AGI (Artificial General Intelligence)</h4>
      <p>As models get smarter, agents will handle more ambiguity. They won't just follow plans; they will <em>create</em> plans.</p>

      <h4>The Human Edge</h4>
      <p>In a world of infinite AI labor, what becomes scarce?
      <br/>
      <strong>Empathy. Creativity. Leadership. Strategy.</strong>
      <br/>
      The leaders who thrive won't be the ones who compete with machines. They will be the ones who conduct the orchestra.</p>

      <div class="callout">
        <strong>Final Thought:</strong> The future belongs to the "Centaurs"—half human, half AI. Build your other half today.
      </div>
    `,
    topics: [
      "Evolution of agent capabilities",
      "Multi-agent coordination",
      "Swarm intelligence",
      "The future workplace",
      "Maintaining the human edge"
    ],
    keywords: ["future-proofing", "multi-agent", "swarm", "AGI", "evolution"],
    status: "completed"
  }
];
