export interface AssessmentQuestion {
  id: string;
  dimension: string;
  question: string;
  options: {
    text: string;
    score: number;
  }[];
}

export interface Dimension {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const dimensions: Dimension[] = [
  {
    id: "leadership",
    name: "Leadership & Vision",
    description: "Executive commitment, strategic clarity, and organizational buy-in for AI adoption",
    icon: "compass"
  },
  {
    id: "technical",
    name: "Technical Infrastructure",
    description: "IT systems, cloud capabilities, and integration readiness for AI tools",
    icon: "server"
  },
  {
    id: "data",
    name: "Data Readiness",
    description: "Data quality, accessibility, governance, and analytics maturity",
    icon: "database"
  },
  {
    id: "workforce",
    name: "Workforce & Culture",
    description: "Employee skills, change readiness, and organizational culture for AI",
    icon: "users"
  },
  {
    id: "processes",
    name: "Processes & Governance",
    description: "Workflows, policies, and governance structures to support AI deployment",
    icon: "settings"
  }
];

export const questions: AssessmentQuestion[] = [
  {
    id: "l1",
    dimension: "leadership",
    question: "How clearly has your organization defined its AI strategy and goals?",
    options: [
      { text: "No AI strategy exists", score: 1 },
      { text: "Some informal discussions, but no formal strategy", score: 2 },
      { text: "Basic strategy documented, limited communication", score: 3 },
      { text: "Clear strategy with defined goals and timelines", score: 4 },
      { text: "Comprehensive strategy aligned with business objectives, well-communicated", score: 5 }
    ]
  },
  {
    id: "l2",
    dimension: "leadership",
    question: "What level of executive sponsorship exists for AI initiatives?",
    options: [
      { text: "No executive involvement or interest", score: 1 },
      { text: "Limited interest but no active sponsorship", score: 2 },
      { text: "One executive champion with moderate influence", score: 3 },
      { text: "Strong C-suite support with dedicated budget", score: 4 },
      { text: "CEO-led initiative with board-level commitment and substantial investment", score: 5 }
    ]
  },
  {
    id: "l3",
    dimension: "leadership",
    question: "How does leadership view the role of AI in your organization's future?",
    options: [
      { text: "AI is seen as a threat or distraction", score: 1 },
      { text: "Neutral or uncertain about AI's relevance", score: 2 },
      { text: "AI is recognized as potentially useful for specific tasks", score: 3 },
      { text: "AI is viewed as a strategic priority for competitive advantage", score: 4 },
      { text: "AI is central to the organization's vision and transformation roadmap", score: 5 }
    ]
  },
  {
    id: "t1",
    dimension: "technical",
    question: "What is the current state of your cloud infrastructure?",
    options: [
      { text: "Entirely on-premises with no cloud adoption", score: 1 },
      { text: "Limited cloud usage, primarily for storage or email", score: 2 },
      { text: "Hybrid environment with some core systems in cloud", score: 3 },
      { text: "Cloud-first strategy with most systems migrated", score: 4 },
      { text: "Fully cloud-native with modern DevOps practices", score: 5 }
    ]
  },
  {
    id: "t2",
    dimension: "technical",
    question: "How mature are your API and integration capabilities?",
    options: [
      { text: "No APIs; systems are siloed and manually connected", score: 1 },
      { text: "Some basic APIs for specific integrations", score: 2 },
      { text: "Growing API ecosystem with documented interfaces", score: 3 },
      { text: "Robust API layer enabling most system integrations", score: 4 },
      { text: "Comprehensive API strategy with governance and self-service capabilities", score: 5 }
    ]
  },
  {
    id: "t3",
    dimension: "technical",
    question: "What is your organization's experience with automation and AI tools?",
    options: [
      { text: "No automation or AI tools currently in use", score: 1 },
      { text: "Basic automation (macros, simple scripts)", score: 2 },
      { text: "RPA or workflow automation in select processes", score: 3 },
      { text: "AI tools deployed in some areas (chatbots, analytics)", score: 4 },
      { text: "Advanced AI capabilities across multiple business functions", score: 5 }
    ]
  },
  {
    id: "d1",
    dimension: "data",
    question: "How would you rate the quality and consistency of your organization's data?",
    options: [
      { text: "Data is fragmented, inconsistent, and unreliable", score: 1 },
      { text: "Some structured data, but significant quality issues", score: 2 },
      { text: "Moderate data quality with ongoing cleanup efforts", score: 3 },
      { text: "Good data quality with established validation processes", score: 4 },
      { text: "High-quality, well-governed data with continuous monitoring", score: 5 }
    ]
  },
  {
    id: "d2",
    dimension: "data",
    question: "How accessible is data for analysis and decision-making?",
    options: [
      { text: "Data is locked in silos; access requires IT support", score: 1 },
      { text: "Limited self-service; most requests go through IT", score: 2 },
      { text: "Some self-service tools for common reports", score: 3 },
      { text: "Data warehouse with broad self-service analytics", score: 4 },
      { text: "Unified data platform with real-time access and advanced analytics", score: 5 }
    ]
  },
  {
    id: "d3",
    dimension: "data",
    question: "What data governance practices are in place?",
    options: [
      { text: "No formal data governance", score: 1 },
      { text: "Ad hoc policies, no dedicated ownership", score: 2 },
      { text: "Basic governance with some data stewards", score: 3 },
      { text: "Comprehensive governance framework with clear ownership", score: 4 },
      { text: "Mature governance with automated compliance and monitoring", score: 5 }
    ]
  },
  {
    id: "w1",
    dimension: "workforce",
    question: "What is the current level of AI literacy among employees?",
    options: [
      { text: "Very limited; most employees don't understand AI", score: 1 },
      { text: "Basic awareness but little practical knowledge", score: 2 },
      { text: "Growing understanding, some employees using AI tools", score: 3 },
      { text: "Good literacy with training programs in place", score: 4 },
      { text: "High AI fluency across the organization with ongoing education", score: 5 }
    ]
  },
  {
    id: "w2",
    dimension: "workforce",
    question: "How would you describe employee attitudes toward AI adoption?",
    options: [
      { text: "Widespread fear or resistance", score: 1 },
      { text: "Skepticism and concerns about job security", score: 2 },
      { text: "Neutral; waiting to see how it unfolds", score: 3 },
      { text: "Generally positive with some champions emerging", score: 4 },
      { text: "Enthusiastic embrace with employees actively seeking AI opportunities", score: 5 }
    ]
  },
  {
    id: "w3",
    dimension: "workforce",
    question: "Does your organization have dedicated AI or data science talent?",
    options: [
      { text: "No AI or data science expertise", score: 1 },
      { text: "Relying on external consultants only", score: 2 },
      { text: "Small team or a few individuals with relevant skills", score: 3 },
      { text: "Established AI/data science team with growing capabilities", score: 4 },
      { text: "Large, mature AI organization with specialized roles and career paths", score: 5 }
    ]
  },
  {
    id: "p1",
    dimension: "processes",
    question: "How well-documented are your core business processes?",
    options: [
      { text: "Processes are tribal knowledge, not documented", score: 1 },
      { text: "Some documentation exists but is outdated", score: 2 },
      { text: "Key processes documented with periodic reviews", score: 3 },
      { text: "Comprehensive documentation with clear ownership", score: 4 },
      { text: "Fully documented, continuously optimized processes", score: 5 }
    ]
  },
  {
    id: "p2",
    dimension: "processes",
    question: "What governance exists for evaluating and deploying new technology?",
    options: [
      { text: "No formal process; decisions are ad hoc", score: 1 },
      { text: "Basic approval process with limited evaluation", score: 2 },
      { text: "Defined evaluation criteria and approval workflow", score: 3 },
      { text: "Robust governance with security, compliance, and ROI reviews", score: 4 },
      { text: "Mature governance with fast-track innovation programs and clear accountability", score: 5 }
    ]
  },
  {
    id: "p3",
    dimension: "processes",
    question: "How does your organization approach experimentation and innovation?",
    options: [
      { text: "Risk-averse; new ideas rarely get tested", score: 1 },
      { text: "Limited experimentation, mostly reactive to market", score: 2 },
      { text: "Some pilots and proofs of concept in select areas", score: 3 },
      { text: "Regular experimentation with learning culture", score: 4 },
      { text: "Innovation is embedded in culture with dedicated resources and processes", score: 5 }
    ]
  }
];

export interface ReadinessLevel {
  level: string;
  range: [number, number];
  description: string;
  color: string;
}

export const readinessLevels: ReadinessLevel[] = [
  {
    level: "Foundational",
    range: [1, 2],
    description: "Your organization is at the early stages of AI readiness. Focus on building awareness, establishing leadership buy-in, and addressing foundational data and infrastructure gaps.",
    color: "#ef4444"
  },
  {
    level: "Developing",
    range: [2, 3],
    description: "You have some building blocks in place but need to strengthen capabilities across multiple dimensions. Prioritize quick wins while building longer-term foundations.",
    color: "#f97316"
  },
  {
    level: "Advancing",
    range: [3, 4],
    description: "Your organization has solid foundations and is ready to scale AI initiatives. Focus on expanding successful pilots and building organizational capabilities.",
    color: "#eab308"
  },
  {
    level: "Leading",
    range: [4, 5],
    description: "You are well-positioned to be an AI leader. Continue advancing capabilities, share learnings across the organization, and explore cutting-edge applications.",
    color: "#22c55e"
  }
];

export function getRecommendations(dimensionId: string, score: number): string[] {
  const recommendations: Record<string, Record<string, string[]>> = {
    leadership: {
      low: [
        "Schedule an executive briefing on AI opportunities and risks",
        "Identify a potential executive sponsor for AI initiatives",
        "Review competitor AI adoption to build urgency"
      ],
      medium: [
        "Develop a formal AI strategy with clear objectives and timelines",
        "Allocate dedicated budget for AI experimentation",
        "Establish regular AI updates for the leadership team"
      ],
      high: [
        "Create an AI Center of Excellence to scale best practices",
        "Integrate AI goals into strategic planning cycles",
        "Consider board-level AI governance"
      ]
    },
    technical: {
      low: [
        "Assess current infrastructure limitations for AI deployment",
        "Develop a cloud migration roadmap",
        "Identify quick-win integration opportunities"
      ],
      medium: [
        "Invest in API development and integration platforms",
        "Pilot AI tools in low-risk, high-value areas",
        "Build internal technical capabilities for AI deployment"
      ],
      high: [
        "Establish MLOps practices for AI model management",
        "Create reusable AI infrastructure components",
        "Explore advanced AI capabilities (multi-agent systems, custom models)"
      ]
    },
    data: {
      low: [
        "Conduct a data quality audit across key systems",
        "Identify critical data sources for initial AI use cases",
        "Begin basic data cleanup and standardization"
      ],
      medium: [
        "Implement data governance framework with clear ownership",
        "Invest in data integration and warehousing",
        "Develop self-service analytics capabilities"
      ],
      high: [
        "Establish real-time data pipelines for AI applications",
        "Implement advanced data quality monitoring",
        "Explore synthetic data for training and testing"
      ]
    },
    workforce: {
      low: [
        "Launch AI awareness training for all employees",
        "Address job security concerns through clear communication",
        "Identify AI champions within business units"
      ],
      medium: [
        "Develop role-specific AI training programs",
        "Create safe spaces for AI experimentation",
        "Hire or develop AI specialist capabilities"
      ],
      high: [
        "Establish AI career paths and advanced training",
        "Create internal AI communities of practice",
        "Develop AI ethics training and guidelines"
      ]
    },
    processes: {
      low: [
        "Document top 10 highest-volume business processes",
        "Identify processes suitable for AI automation",
        "Establish basic technology governance"
      ],
      medium: [
        "Implement formal AI evaluation and deployment processes",
        "Create pilot programs with clear success metrics",
        "Develop change management capabilities"
      ],
      high: [
        "Establish continuous process optimization with AI insights",
        "Create fast-track innovation programs for AI",
        "Build mature AI risk management frameworks"
      ]
    }
  };

  const level = score <= 2 ? 'low' : score <= 3.5 ? 'medium' : 'high';
  return recommendations[dimensionId]?.[level] || [];
}
