export interface ChapterDiagram {
  id: string;
  title: string;
  definition: string;
  caption?: string;
  afterHeading?: string;
}

export interface ChapterDiagramSet {
  chapterId: string;
  diagrams: ChapterDiagram[];
}

export const chapterDiagrams: ChapterDiagramSet[] = [
  {
    chapterId: "chapter-1",
    diagrams: [
      {
        id: "ai-landscape",
        title: "Figure 1.1: The AI Landscape",
        afterHeading: "understanding-the-ai-landscape",
        definition: `flowchart TB
    subgraph AI["Artificial Intelligence"]
        direction TB
        subgraph GenAI["Generative AI<br/>(The Creator)"]
            G1[Text Generation]
            G2[Image Creation]
            G3[Code Writing]
        end
        subgraph PredAI["Predictive AI<br/>(The Forecaster)"]
            P1[Data Analysis]
            P2[Trend Prediction]
            P3[Risk Assessment]
        end
        subgraph Agents["AI Agents<br/>(The Doer)"]
            A1[Goal-Oriented]
            A2[Autonomous]
            A3[Tool-Using]
        end
    end
    
    GenAI --> |Enables| Agents
    PredAI --> |Informs| Agents`,
        caption: "Three types of AI and how they work together to power AI agents"
      },
      {
        id: "tool-vs-agent",
        title: "Figure 1.2: Tool vs. Agent Mindset",
        afterHeading: "from-tools-to-teammates",
        definition: `flowchart LR
    subgraph Tool["Traditional Tool Usage"]
        direction TB
        T1[You have a task] --> T2[You pick up the tool]
        T2 --> T3[You do the work]
        T3 --> T4[You get the result]
    end
    
    subgraph Agent["Agent Delegation"]
        direction TB
        A1[You have a goal] --> A2[You delegate to agent]
        A2 --> A3[Agent figures out how]
        A3 --> A4[Agent delivers result]
    end
    
    Tool -.->|"Shift in<br/>Mindset"| Agent`,
        caption: "The key mental shift: from doing the work yourself to delegating outcomes"
      }
    ]
  },
  {
    chapterId: "chapter-2",
    diagrams: [
      {
        id: "agent-capabilities",
        title: "Figure 2.1: The Four Pillars of AI Agents",
        afterHeading: "the-anatomy-of-an-ai-agent",
        definition: `flowchart TB
    Agent[AI Agent] --> Goals
    Agent --> Reasoning
    Agent --> Tools
    Agent --> Memory
    
    subgraph Goals["Goals"]
        G1[Outcome-focused]
        G2[Success criteria]
    end
    
    subgraph Reasoning["Reasoning"]
        R1[Decision making]
        R2[Problem solving]
    end
    
    subgraph Tools["Tools"]
        T1[Web browsing]
        T2[File access]
        T3[API calls]
    end
    
    subgraph Memory["Memory"]
        M1[Context retention]
        M2[Preference learning]
    end`,
        caption: "The four core capabilities that make AI agents effective digital workers"
      },
      {
        id: "delegation-filter",
        title: "Figure 2.2: The Delegation Filter",
        afterHeading: "what-to-delegate",
        definition: `flowchart TD
    Task[New Task] --> Q1{Repetitive?}
    Q1 -->|Yes| Delegate[✓ Delegate to Agent]
    Q1 -->|No| Q2{Research-heavy?}
    Q2 -->|Yes| Delegate
    Q2 -->|No| Q3{Monitoring needed?}
    Q3 -->|Yes| Delegate
    Q3 -->|No| Q4{Requires judgment?}
    Q4 -->|Yes| Human[Keep for Human]
    Q4 -->|No| Q5{High stakes?}
    Q5 -->|Yes| Human
    Q5 -->|No| Delegate
    
    style Delegate fill:#22c55e,color:#fff
    style Human fill:#6366f1,color:#fff`,
        caption: "Decision tree for identifying tasks suitable for AI agent delegation"
      }
    ]
  },
  {
    chapterId: "chapter-3",
    diagrams: [
      {
        id: "agent-roles",
        title: "Figure 3.1: Specialized Agent Roles",
        afterHeading: "the-specialist-model",
        definition: `flowchart TB
    Leader[You - The Leader] --> Research
    Leader --> Scheduling
    Leader --> Analysis
    Leader --> Communication
    
    subgraph Research["Research Agent"]
        R1[Competitive intel]
        R2[Market research]
        R3[News monitoring]
    end
    
    subgraph Scheduling["Scheduling Agent"]
        S1[Calendar management]
        S2[Meeting coordination]
        S3[Travel planning]
    end
    
    subgraph Analysis["Analysis Agent"]
        A1[Data processing]
        A2[Report generation]
        A3[KPI tracking]
    end
    
    subgraph Communication["Communication Agent"]
        C1[Email drafting]
        C2[Meeting summaries]
        C3[Status updates]
    end`,
        caption: "Four primary agent roles that form the foundation of your AI team"
      },
      {
        id: "specialization-matrix",
        title: "Figure 3.2: Specialization vs. Generalization",
        afterHeading: "when-to-specialize",
        definition: `quadrantChart
    title Agent Specialization Matrix
    x-axis Low Complexity --> High Complexity
    y-axis Low Volume --> High Volume
    quadrant-1 Specialist Agent
    quadrant-2 Multi-Agent Team
    quadrant-3 Manual Process
    quadrant-4 Generalist Agent
    
    Email Triage: [0.3, 0.8]
    Strategic Analysis: [0.85, 0.25]
    Meeting Scheduling: [0.25, 0.7]
    Research Projects: [0.7, 0.5]
    Daily Reports: [0.4, 0.75]
    Complex Decisions: [0.9, 0.15]`,
        caption: "How to decide between specialized agents and multi-purpose solutions"
      }
    ]
  },
  {
    chapterId: "chapter-4",
    diagrams: [
      {
        id: "ai-org-chart",
        title: "Figure 4.1: The AI Agent Org Chart",
        afterHeading: "the-ai-agent-org-chart",
        definition: `flowchart TB
    You[You - Executive] --> Chief[Chief AI Agent<br/>Orchestrator]
    
    Chief --> Research[Research<br/>Agent]
    Chief --> Finance[Finance<br/>Agent]
    Chief --> Scheduler[Scheduling<br/>Agent]
    Chief --> Comms[Communication<br/>Agent]
    
    Research --> R1[Market Intel]
    Research --> R2[Competitor Watch]
    
    Finance --> F1[Budget Analysis]
    Finance --> F2[Expense Audit]
    
    Scheduler --> S1[Calendar Mgmt]
    Scheduler --> S2[Meeting Prep]
    
    Comms --> C1[Email Drafts]
    Comms --> C2[Status Reports]`,
        caption: "Hierarchical structure with a Chief Agent coordinating specialist agents"
      },
      {
        id: "workflow-patterns",
        title: "Figure 4.2: Agent Workflow Patterns",
        afterHeading: "workflow-patterns",
        definition: `flowchart LR
    subgraph Sequential["Sequential"]
        direction LR
        SA[Agent A] --> SB[Agent B] --> SC[Agent C]
    end
    
    subgraph Parallel["Parallel"]
        direction TB
        PA[Agent A] --> PC[Combiner]
        PB[Agent B] --> PC
    end
    
    subgraph Routing["Routing"]
        direction TB
        Router{Chief Agent} --> RA[Agent A]
        Router --> RB[Agent B]
        Router --> RC[Agent C]
    end`,
        caption: "Three patterns for coordinating work between multiple AI agents"
      }
    ]
  },
  {
    chapterId: "chapter-5",
    diagrams: [
      {
        id: "delegation-framework",
        title: "Figure 5.1: The Arootah AI Delegation Framework",
        afterHeading: "the-arootah-ai-delegation-framework",
        definition: `flowchart TD
    Task[Task to Delegate] --> Instructions
    
    subgraph Instructions["Clear Instructions"]
        I1[Define output format]
        I2[Specify length/tone]
        I3[Provide examples]
    end
    
    Instructions --> Success
    
    subgraph Success["Success Criteria"]
        S1[What does 'done' look like?]
        S2[Quality benchmarks]
        S3[Acceptance tests]
    end
    
    Success --> Constraints
    
    subgraph Constraints["Constraints"]
        C1[What NOT to do]
        C2[Approval requirements]
        C3[Escalation triggers]
    end
    
    Constraints --> Execute[Agent Executes]
    Execute --> Review[Review & Feedback]
    Review -->|Improve| Instructions`,
        caption: "The complete framework for effective AI agent delegation"
      },
      {
        id: "agent-kpis",
        title: "Figure 5.2: Agent Performance Metrics",
        afterHeading: "measuring-agent-performance",
        definition: `flowchart LR
    subgraph Metrics["Agent KPIs"]
        direction TB
        Accuracy[Accuracy<br/>How often correct?]
        Speed[Speed<br/>Turnaround time?]
        Autonomy[Autonomy<br/>Questions asked?]
    end
    
    Accuracy --> Score[Performance<br/>Score]
    Speed --> Score
    Autonomy --> Score
    
    Score --> Improve{Needs<br/>Improvement?}
    Improve -->|Yes| Update[Update Prompts]
    Improve -->|No| Maintain[Maintain & Monitor]
    
    Update --> Accuracy`,
        caption: "Key metrics for tracking and improving AI agent performance"
      }
    ]
  },
  {
    chapterId: "chapter-6",
    diagrams: [
      {
        id: "time-buying-agents",
        title: "Figure 6.1: Time-Buying Agent System",
        afterHeading: "time-buying-agents",
        definition: `flowchart TB
    subgraph Morning["Morning Automation"]
        Inbox[Inbox Triage Agent] --> Priority[Prioritized Email Queue]
        Calendar[Calendar Agent] --> Prep[Meeting Prep Briefs]
    end
    
    subgraph Ongoing["Ongoing Automation"]
        Scheduler[Scheduling Agent] --> Booked[Auto-Scheduled Meetings]
        Monitor[Monitoring Agent] --> Alerts[Exception Alerts Only]
    end
    
    subgraph Evening["End of Day"]
        Summary[Summary Agent] --> Digest[Daily Digest Report]
        Plan[Planning Agent] --> Tomorrow[Tomorrow's Priorities]
    end
    
    Morning --> You[Your Focus Time]
    Ongoing --> You
    You --> Evening`,
        caption: "How time-buying agents protect and multiply your productive hours"
      },
      {
        id: "email-triage-flow",
        title: "Figure 6.2: Email Triage Workflow",
        afterHeading: "email-and-calendar-automation",
        definition: `flowchart TD
    Email[Incoming Email] --> Agent[Triage Agent]
    
    Agent --> Classify{Classify}
    
    Classify --> Urgent[🔴 Urgent<br/>Notify immediately]
    Classify --> Important[🟡 Important<br/>Read today]
    Classify --> Later[🟢 Read Later<br/>Batch for review]
    Classify --> Spam[⚫ Archive<br/>Skip inbox]
    
    Agent --> Draft{Simple Query?}
    Draft -->|Yes| AutoDraft[Auto-draft reply]
    Draft -->|No| Flag[Flag for you]
    
    AutoDraft --> Queue[Drafts queue for approval]`,
        caption: "Automated email triage saves hours while ensuring nothing important is missed"
      }
    ]
  },
  {
    chapterId: "chapter-7",
    diagrams: [
      {
        id: "decision-support",
        title: "Figure 7.1: AI-Enhanced Decision Making",
        afterHeading: "ai-enhanced-decision-making",
        definition: `flowchart LR
    Decision[Strategic Decision] --> Research[Research Agent<br/>Gather Data]
    Research --> Analysis[Analysis Agent<br/>Process Data]
    Analysis --> Critic[Devil's Advocate<br/>Challenge Assumptions]
    Critic --> Options[Present Options<br/>with Pros/Cons]
    Options --> You[You Decide]
    
    You --> Execute[Execute Decision]
    Execute --> Monitor[Monitor Agent<br/>Track Outcomes]
    Monitor --> Learn[Feed Back<br/>to System]`,
        caption: "How AI agents augment every stage of the decision-making process"
      },
      {
        id: "scenario-planning",
        title: "Figure 7.2: Scenario Planning with AI",
        afterHeading: "scenario-planning-with-ai",
        definition: `flowchart TB
    Question[Strategic Question] --> Agent[Scenario Agent]
    
    Agent --> Best[Best Case<br/>Scenario]
    Agent --> Base[Base Case<br/>Scenario]  
    Agent --> Worst[Worst Case<br/>Scenario]
    
    Best --> Impact1[Impact Analysis]
    Base --> Impact2[Impact Analysis]
    Worst --> Impact3[Impact Analysis]
    
    Impact1 --> Compare[Compare &<br/>Decide]
    Impact2 --> Compare
    Impact3 --> Compare
    
    Compare --> Prepare[Preparation<br/>Plan]`,
        caption: "Using AI to rapidly model multiple scenarios before making decisions"
      }
    ]
  },
  {
    chapterId: "chapter-8",
    diagrams: [
      {
        id: "goal-tracking",
        title: "Figure 8.1: AI-Powered Goal Tracking System",
        afterHeading: "ai-powered-goal-tracking",
        definition: `flowchart TB
    Goals[Strategic Goals] --> Agent[Goal Tracking Agent]
    
    Agent --> Monitor[Monitor Progress]
    Agent --> Alert[Generate Alerts]
    Agent --> Report[Weekly Reports]
    
    Monitor --> Status{On Track?}
    Status -->|Yes| Continue[Continue Monitoring]
    Status -->|No| Escalate[Escalate to Leader]
    
    Escalate --> Recommend[Suggest Corrective<br/>Actions]
    
    Report --> Dashboard[Executive<br/>Dashboard]`,
        caption: "Automated goal tracking ensures strategic objectives stay on course"
      },
      {
        id: "analytics-pipeline",
        title: "Figure 8.2: Performance Analytics Pipeline",
        afterHeading: "automated-business-intelligence",
        definition: `flowchart LR
    subgraph Sources["Data Sources"]
        S1[Salesforce]
        S2[Stripe]
        S3[Analytics]
        S4[Project Tools]
    end
    
    Sources --> Agent[Analytics Agent]
    
    Agent --> Process[Process & Analyze]
    
    Process --> Output
    
    subgraph Output["Automated Outputs"]
        O1[Monday Scorecard]
        O2[Trend Alerts]
        O3[Custom Reports]
    end`,
        caption: "Automated data collection and reporting from multiple business systems"
      }
    ]
  },
  {
    chapterId: "chapter-9",
    diagrams: [
      {
        id: "human-ai-collaboration",
        title: "Figure 9.1: The 80/20 Human-AI Model",
        afterHeading: "the-8020-rule-for-ai-collaboration",
        definition: `flowchart LR
    Task[Task] --> Split{Split Work}
    
    Split --> AI["AI Agent (80%)<br/>━━━━━━━━━━"]
    Split --> Human["Human (20%)<br/>━━"]
    
    subgraph AIWork["Agent Handles"]
        A1[Research]
        A2[Drafting]
        A3[Data processing]
        A4[Formatting]
    end
    
    subgraph HumanWork["Human Handles"]
        H1[Final decisions]
        H2[Relationship nuance]
        H3[Creative judgment]
        H4[Approval]
    end
    
    AI --> AIWork
    Human --> HumanWork
    
    AIWork --> Merge[Combined<br/>Output]
    HumanWork --> Merge`,
        caption: "Optimal division of labor between AI agents and human judgment"
      },
      {
        id: "escalation-protocol",
        title: "Figure 9.2: Agent Escalation Protocol",
        afterHeading: "when-to-escalate",
        definition: `flowchart TD
    Agent[Agent Working] --> Check{Confidence<br/>Check}
    
    Check -->|High| Continue[Continue Autonomously]
    Check -->|Medium| Flag[Flag for Review]
    Check -->|Low| Escalate[Escalate Immediately]
    
    Flag --> Human{Human Reviews}
    Escalate --> Human
    
    Human -->|Approve| Execute[Agent Executes]
    Human -->|Modify| Revise[Agent Revises]
    Human -->|Reject| Stop[Agent Stops]
    
    Revise --> Check`,
        caption: "When and how AI agents should escalate decisions to humans"
      }
    ]
  },
  {
    chapterId: "chapter-10",
    diagrams: [
      {
        id: "enterprise-scaling",
        title: "Figure 10.1: Enterprise AI Agent Architecture",
        afterHeading: "enterprise-ai-agent-architecture",
        definition: `flowchart TB
    CEO[CEO] --> ExecTeam[Executive AI Team]
    
    ExecTeam --> HR[HR Agents]
    ExecTeam --> Sales[Sales Agents]
    ExecTeam --> Finance[Finance Agents]
    ExecTeam --> Ops[Operations Agents]
    
    subgraph HRTeam["HR Department"]
        HR --> HR1[Recruiting Agent]
        HR --> HR2[Benefits Agent]
        HR --> HR3[Onboarding Agent]
    end
    
    subgraph SalesTeam["Sales Department"]
        Sales --> S1[Lead Qualification]
        Sales --> S2[Follow-up Agent]
        Sales --> S3[Proposal Agent]
    end
    
    subgraph FinTeam["Finance Department"]
        Finance --> F1[Expense Audit]
        Finance --> F2[Invoice Processing]
        Finance --> F3[Forecasting Agent]
    end
    
    subgraph OpsTeam["Operations"]
        Ops --> O1[Vendor Management]
        Ops --> O2[Inventory Agent]
        Ops --> O3[Quality Agent]
    end`,
        caption: "Scaling AI agents across an enterprise organization"
      },
      {
        id: "governance-framework",
        title: "Figure 10.2: AI Governance Framework",
        afterHeading: "governance-and-risk-management",
        definition: `flowchart TB
    subgraph Policy["Policy Layer"]
        P1[Acceptable Use Policy]
        P2[Data Governance]
        P3[Ethics Guidelines]
    end
    
    subgraph Process["Process Layer"]
        PR1[Approval Workflow]
        PR2[Risk Assessment]
        PR3[Audit Trail]
    end
    
    subgraph Technical["Technical Layer"]
        T1[Access Controls]
        T2[Monitoring]
        T3[Logging]
    end
    
    Policy --> Process
    Process --> Technical
    
    Technical --> Agents[AI Agents<br/>Operating Safely]`,
        caption: "Three-layer governance framework for responsible AI deployment"
      }
    ]
  },
  {
    chapterId: "overview",
    diagrams: [
      {
        id: "book-journey",
        title: "Your AI Leadership Journey",
        definition: `flowchart LR
    subgraph Phase1["Foundation<br/>Chapters 1-3"]
        C1[Know Your AI]
        C2[Context is King]
        C3[Right Mind for Task]
    end
    
    subgraph Phase2["Building<br/>Chapters 4-6"]
        C4[Audit Automate Amplify]
        C5[Master Transition]
        C6[Aligned Decisions]
    end
    
    subgraph Phase3["Mastery<br/>Chapters 7-10"]
        C7[Clone Best Self]
        C8[Collaborate]
        C9[Architect Future]
        C10[Price of Power]
    end
    
    Phase1 --> Phase2
    Phase2 --> Phase3`,
        caption: "The three-phase journey to AI leadership mastery"
      }
    ]
  }
];

export function getDiagramsForChapter(chapterId: string): ChapterDiagram[] {
  const chapterSet = chapterDiagrams.find(cd => cd.chapterId === chapterId);
  return chapterSet?.diagrams || [];
}
