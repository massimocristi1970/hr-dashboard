export interface ManagerReferenceGuide {
  id: string;
  title: string;
  section: string;
  sectionLabel: string;
  whenToUse: string;
  whatThisIs: string;
  keyLegalPoints: string[];
  managerShouldDo: string[];
  managerShouldNotDo: string[];
  whenToEscalate: string[];
  relatedForms: string[];
  tags: string[];
  lastReviewed: string;
}

export interface ManagerReferenceSection {
  id: string;
  label: string;
  description: string;
}

export interface ManagerReferencePriority {
  title: string;
  reason: string;
}

export const managerReferenceSections: ManagerReferenceSection[] = [
  {
    id: 'starting-employment',
    label: 'Section A - Starting Employment',
    description: 'Offer letters, contracts, written statements, probation, right to work, and pre-employment checks.',
  },
  {
    id: 'day-to-day-management',
    label: 'Section B - Day-to-Day Management',
    description: 'Attendance, sickness, annual leave, flexible working, and remote management.',
  },
  {
    id: 'employee-relations',
    label: 'Section C - Employee Relations',
    description: 'Grievances, disciplinary matters, investigations, and performance support.',
  },
  {
    id: 'equality-and-wellbeing',
    label: 'Section D - Equality and Wellbeing',
    description: 'Equality, reasonable adjustments, mental health, and harassment prevention.',
  },
  {
    id: 'family-rights',
    label: 'Section E - Family Rights',
    description: 'Maternity, paternity, shared parental leave, and neonatal care leave.',
  },
  {
    id: 'compliance',
    label: 'Section F - Compliance',
    description: 'Data protection, monitoring, safeguarding reports, and protected disclosures.',
  },
  {
    id: 'leaving-employment',
    label: 'Section G - Leaving Employment',
    description: 'Notice, exits, references, and redundancy basics.',
  },
];

export const managerReferencePriorities: ManagerReferencePriority[] = [
  {
    title: 'Neonatal Care Leave and Pay',
    reason: 'High-priority family leave area that managers may not know how to route consistently.',
  },
  {
    title: 'Sexual Harassment Prevention',
    reason: 'Managers need practical steps on prevention, early action, and escalation duties.',
  },
  {
    title: 'Right to Work Checks',
    reason: 'Errors create compliance risk before or during employment.',
  },
  {
    title: 'Recruitment Guidance',
    reason: 'Helps managers keep offers, checks, and interview decisions fair and documented.',
  },
  {
    title: 'Probation Guidance',
    reason: 'Supports consistent extension, review, and confirmation decisions.',
  },
  {
    title: 'Reasonable Adjustments',
    reason: 'Managers need a usable route for disability-related conversations and changes.',
  },
  {
    title: 'Redundancy Guide',
    reason: 'High-risk process with consultation and selection obligations.',
  },
  {
    title: 'Investigation Guidance',
    reason: 'Often needed before disciplinary or grievance outcomes are reached.',
  },
  {
    title: 'Occupational Health Guidance',
    reason: 'Useful when capability, attendance, or adjustments decisions depend on medical input.',
  },
  {
    title: 'Data Protection in HR',
    reason: 'Managers regularly handle sensitive employee information without formal HR training.',
  },
];

export const managerReferenceBuildOrder = [
  {
    phase: 'Phase 1',
    items: ['Employment law index', 'Absence guide', 'Disciplinary guide', 'Grievance guide', 'Flexible working guide'],
  },
  {
    phase: 'Phase 2',
    items: ['Probation guide', 'Reasonable adjustments', 'Data protection', 'Right to work', 'Redundancy guide'],
  },
  {
    phase: 'Phase 3',
    items: ['FAQ', 'Tags', 'Search'],
  },
];

export const managerReferenceGuides: ManagerReferenceGuide[] = [
  {
    id: 'written-statement-of-employment-particulars',
    title: 'Written Statement of Employment Particulars',
    section: 'starting-employment',
    sectionLabel: 'Section A - Starting Employment',
    whenToUse: 'Use when confirming terms for a new starter or when an employee asks what should have been provided at the start of employment.',
    whatThisIs: 'A manager-facing summary of the core written terms that should be issued at the start of employment, including pay, hours, holiday, notice, and key policies.',
    keyLegalPoints: [
      'Employees and workers should receive required particulars from day one.',
      'The statement should match the actual working arrangement and contract terms.',
      'Changes to core terms should be documented promptly and shared clearly.',
    ],
    managerShouldDo: [
      'Check offer terms, contract wording, and practical working arrangements line up before start date.',
      'Raise any proposed change to hours, location, pay, or reporting line with HR before confirming it verbally.',
      'Keep a dated record of the version issued to the employee.',
    ],
    managerShouldNotDo: [
      'Do not rely on informal email promises that conflict with the contract pack.',
      'Do not tell a starter that paperwork can be fixed later if key terms are still unclear.',
      'Do not change core terms without HR input and written confirmation.',
    ],
    whenToEscalate: [
      'The employee disputes their agreed terms or start conditions.',
      'The role has unusual hours, variable pay, hybrid arrangements, or enhanced benefits not in standard templates.',
      'A correction is needed after employment has already started.',
    ],
    relatedForms: ['Offer letter', 'Contract of employment', 'Starter checklist'],
    tags: ['contracts', 'written statement', 'offer letter', 'terms', 'starter'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'probation-periods-and-extensions',
    title: 'Probation Periods and Extensions',
    section: 'starting-employment',
    sectionLabel: 'Section A - Starting Employment',
    whenToUse: 'Use when onboarding a new starter, reviewing progress during probation, or deciding whether to confirm, extend, or end employment.',
    whatThisIs: 'Guidance for managing probation fairly, documenting expectations, and avoiding surprise outcomes at the end of the period.',
    keyLegalPoints: [
      'Probation rules should be set out clearly in the contract or probation guidance.',
      'Managers should still act fairly, consistently, and without discrimination during probation.',
      'An extension should be justified, time-bound, and confirmed in writing.',
    ],
    managerShouldDo: [
      'Set measurable expectations early and review them regularly.',
      'Document support, feedback, and any concerns before the probation end date.',
      'Confirm extension reasons, objectives, and review dates in writing.',
    ],
    managerShouldNotDo: [
      'Do not wait until the final week to raise concerns for the first time.',
      'Do not extend probation indefinitely or without a clear reason.',
      'Do not overlook absence, disability, or family-related factors that may affect performance.',
    ],
    whenToEscalate: [
      'There may be discrimination, disability, sickness, pregnancy, or whistleblowing concerns.',
      'Dismissal during probation is being considered.',
      'The contract is silent or unclear on extension rights.',
    ],
    relatedForms: ['Probation review notes', 'Extension letter', 'Confirmation letter'],
    tags: ['probation', 'new starter', 'extension', 'performance', 'review'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'right-to-work-checks',
    title: 'Right to Work Checks',
    section: 'starting-employment',
    sectionLabel: 'Section A - Starting Employment',
    whenToUse: 'Use before employment starts, when a visa expiry date is approaching, or when HR asks for a follow-up check.',
    whatThisIs: 'A practical reference on ensuring valid right to work checks are completed and recorded before employment continues.',
    keyLegalPoints: [
      'Checks should be completed before employment starts and repeated where time-limited permission applies.',
      'The correct check method matters, whether manual, digital, or online share code based.',
      'Records should be retained in line with the employer process.',
    ],
    managerShouldDo: [
      'Make sure the check happens before day one and is logged properly.',
      'Flag expiring permissions early so follow-up checks can be scheduled.',
      'Treat all candidates consistently to avoid discriminatory assumptions.',
    ],
    managerShouldNotDo: [
      'Do not let someone start before the required check is complete.',
      'Do not ask only non-UK sounding candidates for extra evidence.',
      'Do not store copies casually outside approved HR systems.',
    ],
    whenToEscalate: [
      'A document looks inconsistent or there is uncertainty about the correct check route.',
      'Permission to work is time-limited or restricted.',
      'The employee cannot provide evidence before start date.',
    ],
    relatedForms: ['Starter checklist', 'Visa follow-up reminder', 'Recruitment checks record'],
    tags: ['right to work', 'visa', 'starter', 'recruitment', 'checks'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'references-and-recruitment-checks',
    title: 'References and Recruitment Checks',
    section: 'starting-employment',
    sectionLabel: 'Section A - Starting Employment',
    whenToUse: 'Use when preparing an offer, deciding what checks are proportionate, or responding to issues raised by a reference.',
    whatThisIs: 'Guidance on using references and background checks consistently, fairly, and only where they are relevant to the role.',
    keyLegalPoints: [
      'Checks should be proportionate to the role and applied consistently.',
      'Decisions should not be based on irrelevant or discriminatory information.',
      'Any adverse issue identified should be reviewed fairly before withdrawing an offer.',
    ],
    managerShouldDo: [
      'Use the approved recruitment checklist for the role.',
      'Record why a particular check is needed and whether the candidate has been told.',
      'Discuss concerns with HR before changing an offer decision.',
    ],
    managerShouldNotDo: [
      'Do not request unnecessary personal information from previous employers.',
      'Do not make snap judgments on informal comments or incomplete references.',
      'Do not share reference content more widely than necessary.',
    ],
    whenToEscalate: [
      'A reference raises safeguarding, misconduct, or fraud concerns.',
      'There is a proposal to withdraw an offer.',
      'The role may require DBS or regulated activity checks.',
    ],
    relatedForms: ['Recruitment checklist', 'Reference request template', 'Offer approval record'],
    tags: ['references', 'recruitment', 'checks', 'offer', 'dbs'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'sickness-absence-and-fit-notes',
    title: 'Sickness Absence and Fit Notes',
    section: 'day-to-day-management',
    sectionLabel: 'Section B - Day-to-Day Management',
    whenToUse: 'Use when an employee reports sick, submits a fit note, has repeated short-term absence, or is preparing to return to work.',
    whatThisIs: 'A manager guide to recording sickness correctly, handling fit notes, and balancing attendance support with fair treatment.',
    keyLegalPoints: [
      'Managers should follow reporting rules consistently and keep attendance records accurate.',
      'Fit notes may recommend adjustments rather than simple absence only.',
      'Disability, pregnancy, and other protected factors can affect how absence should be managed.',
    ],
    managerShouldDo: [
      'Record the dates, reason given, and any fit note details promptly.',
      'Hold return to work conversations after relevant absences.',
      'Consider support, reasonable adjustments, or occupational health input where needed.',
    ],
    managerShouldNotDo: [
      'Do not challenge medical information aggressively or ask for unnecessary detail.',
      'Do not trigger capability or disciplinary steps automatically without context.',
      'Do not ignore patterns of absence that need support or escalation.',
    ],
    whenToEscalate: [
      'Absence becomes long-term, recurrent, or linked to disability, pregnancy, or mental health.',
      'A fit note recommends changes the team may struggle to provide.',
      'There is disagreement about sick pay, evidence, or attendance action.',
    ],
    relatedForms: ['Sickness reporting form', 'Return to work form', 'Occupational health referral'],
    tags: ['sickness', 'absence', 'fit note', 'return to work', 'attendance'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'holiday-entitlement-and-carry-over',
    title: 'Holiday Entitlement and Carry-Over',
    section: 'day-to-day-management',
    sectionLabel: 'Section B - Day-to-Day Management',
    whenToUse: 'Use when approving annual leave, checking entitlement, handling carry-over questions, or reviewing leave before year end.',
    whatThisIs: 'A simple guide to annual leave entitlement, booking decisions, and when carry-over may be allowed or required.',
    keyLegalPoints: [
      'Holiday entitlement should be calculated consistently and reflected accurately in the system.',
      'Carry-over may apply in defined circumstances such as sickness or statutory family leave, subject to policy rules.',
      'Managers should ensure employees have a real opportunity to take leave.',
    ],
    managerShouldDo: [
      'Review operational impact fairly and respond to requests promptly.',
      'Encourage employees to spread leave and avoid year-end bottlenecks.',
      'Check with HR before refusing leave where sickness or family leave overlaps.',
    ],
    managerShouldNotDo: [
      'Do not invent local rules that differ from the company policy.',
      'Do not pressure employees to work while on annual leave.',
      'Do not remove entitlement or carry-over without checking the legal and policy position.',
    ],
    whenToEscalate: [
      'There is a dispute over entitlement, bank holidays, or carry-over.',
      'The employee could not take leave because of sickness or statutory leave.',
      'A large carry-over request may create fairness or payroll issues.',
    ],
    relatedForms: ['Annual leave request', 'Carry-over approval note', 'Holiday year-end reminder'],
    tags: ['holiday', 'annual leave', 'carry over', 'entitlement', 'leave'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'flexible-working-requests',
    title: 'Flexible Working Requests',
    section: 'day-to-day-management',
    sectionLabel: 'Section B - Day-to-Day Management',
    whenToUse: 'Use when an employee requests a change to hours, days, location, or working pattern.',
    whatThisIs: 'A manager reference on receiving, assessing, and responding to flexible working requests in a structured and evidence-based way.',
    keyLegalPoints: [
      'Requests should be handled reasonably and within the employer response timeframe.',
      'Managers should consider the request on its merits and base decisions on real operational reasons.',
      'Related equality or family issues may require extra care beyond the flexible working process alone.',
    ],
    managerShouldDo: [
      'Meet with the employee to understand the request and possible alternatives.',
      'Assess impact using evidence on service, workload, coverage, and fairness.',
      'Document the decision and any trial period clearly.',
    ],
    managerShouldNotDo: [
      'Do not reject a request because it feels inconvenient without evidence.',
      'Do not compare one case casually with another without checking the facts.',
      'Do not let assumptions about caring roles or commitment influence the decision.',
    ],
    whenToEscalate: [
      'There may be discrimination, disability, religion, or family-related issues.',
      'A refusal is likely and the rationale is finely balanced.',
      'Multiple team requests create a wider structure or resourcing problem.',
    ],
    relatedForms: ['Flexible working request form', 'Meeting notes', 'Trial period review'],
    tags: ['flexible working', 'hours', 'hybrid', 'location', 'caring'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'working-from-home-and-remote-management',
    title: 'Working From Home and Remote Management',
    section: 'day-to-day-management',
    sectionLabel: 'Section B - Day-to-Day Management',
    whenToUse: 'Use when agreeing remote working arrangements, setting expectations, or managing concerns about availability, performance, or wellbeing.',
    whatThisIs: 'Guidance on setting clear expectations for remote work while respecting privacy, wellbeing, and consistency.',
    keyLegalPoints: [
      'Remote arrangements should be documented and aligned with policy.',
      'Managers still owe duties around wellbeing, equality, and safe systems of work.',
      'Monitoring and homeworking decisions should be proportionate and transparent.',
    ],
    managerShouldDo: [
      'Set clear expectations on outputs, availability, communication, and equipment.',
      'Check in regularly on workload, wellbeing, and practical barriers.',
      'Keep remote arrangements under review if team needs change.',
    ],
    managerShouldNotDo: [
      'Do not assume visibility equals performance.',
      'Do not introduce ad hoc surveillance to manage remote staff.',
      'Do not ignore health and safety or data handling expectations just because work happens at home.',
    ],
    whenToEscalate: [
      'There are concerns about data protection, monitoring, or home workstation safety.',
      'A remote working request overlaps with disability or family-related adjustments.',
      'Performance concerns are building and may need a formal plan.',
    ],
    relatedForms: ['Homeworking agreement', 'DSE checklist', 'Remote working review note'],
    tags: ['working from home', 'remote', 'hybrid', 'monitoring', 'wellbeing'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'grievance-process',
    title: 'Grievance Process',
    section: 'employee-relations',
    sectionLabel: 'Section C - Employee Relations',
    whenToUse: 'Use when an employee raises a formal concern about treatment, decisions, conduct, or working relationships.',
    whatThisIs: 'A manager guide to receiving grievances seriously, protecting confidentiality, and ensuring a fair process.',
    keyLegalPoints: [
      'Grievances should be addressed without unreasonable delay.',
      'The process should be fair, documented, and as impartial as possible.',
      'The employee may have the right to be accompanied at formal meetings.',
    ],
    managerShouldDo: [
      'Acknowledge the concern and route it into the formal process where needed.',
      'Separate fact finding from conclusions and outcomes.',
      'Keep records of meetings, evidence reviewed, and decisions made.',
    ],
    managerShouldNotDo: [
      'Do not dismiss concerns as personality clashes without review.',
      'Do not investigate a grievance if you are too involved to be impartial.',
      'Do not retaliate or allow retaliation after a complaint is raised.',
    ],
    whenToEscalate: [
      'The grievance involves discrimination, harassment, whistleblowing, or senior leaders.',
      'The complaint overlaps with sickness absence or mental health concerns.',
      'Suspension, formal investigation, or major relationship breakdown is being considered.',
    ],
    relatedForms: ['Grievance form', 'Investigation notes', 'Outcome letter'],
    tags: ['grievance', 'complaint', 'employee relations', 'investigation', 'appeal'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'disciplinary-process',
    title: 'Disciplinary Process',
    section: 'employee-relations',
    sectionLabel: 'Section C - Employee Relations',
    whenToUse: 'Use when there is possible misconduct, a policy breach, or repeated behaviour concerns that may require formal action.',
    whatThisIs: 'A structured guide to investigations, hearings, and fair disciplinary decision-making.',
    keyLegalPoints: [
      'A reasonable investigation should normally happen before disciplinary findings are made.',
      'Employees should know the allegations, evidence, and possible outcomes before a hearing.',
      'Sanctions should be proportionate and consistent with policy and precedent.',
    ],
    managerShouldDo: [
      'Pause and confirm whether the issue is misconduct, capability, or a conduct issue linked to health or support needs.',
      'Use an investigator where appropriate and keep notes of evidence reviewed.',
      'Check previous outcomes for consistency before deciding a sanction.',
    ],
    managerShouldNotDo: [
      'Do not predetermine the outcome before the hearing.',
      'Do not use a disciplinary route for issues that are really performance or sickness related.',
      'Do not share allegations widely beyond those handling the process.',
    ],
    whenToEscalate: [
      'Dismissal, final warning, or suspension is being considered.',
      'The issue involves protected disclosures, discrimination, or criminal allegations.',
      'There is uncertainty about who should investigate or chair.',
    ],
    relatedForms: ['Investigation plan', 'Disciplinary invite letter', 'Outcome letter'],
    tags: ['disciplinary', 'misconduct', 'investigation', 'hearing', 'warning'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'capability-and-performance-management',
    title: 'Capability and Performance Management',
    section: 'employee-relations',
    sectionLabel: 'Section C - Employee Relations',
    whenToUse: 'Use when an employee is struggling to meet expected standards, targets, or role requirements over time.',
    whatThisIs: 'Guidance on managing underperformance through clear standards, support, review periods, and fair escalation.',
    keyLegalPoints: [
      'Managers should explain concerns clearly and give a reasonable chance to improve.',
      'Support, training, and any underlying health or adjustment needs should be considered.',
      'Formal capability action should follow policy and be evidenced.',
    ],
    managerShouldDo: [
      'Set out specific examples, expectations, and review dates.',
      'Offer practical support such as coaching, training, or workload changes where appropriate.',
      'Document progress and whether targets are realistic and role-relevant.',
    ],
    managerShouldNotDo: [
      'Do not rely on vague statements like attitude or fit without examples.',
      'Do not ignore signs that health, disability, or personal circumstances may be relevant.',
      'Do not jump from informal feedback straight to dismissal.',
    ],
    whenToEscalate: [
      'Performance issues may be linked to sickness, disability, or mental health.',
      'Formal warnings or dismissal are being considered.',
      'The role expectations or objectives themselves may be unclear or disputed.',
    ],
    relatedForms: ['Performance improvement plan', 'Review notes', 'Capability outcome letter'],
    tags: ['performance', 'capability', 'pip', 'underperformance', 'targets'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'equality-discrimination-and-reasonable-adjustments',
    title: 'Equality, Discrimination and Reasonable Adjustments',
    section: 'equality-and-wellbeing',
    sectionLabel: 'Section D - Equality and Wellbeing',
    whenToUse: 'Use when decisions may affect someone with a protected characteristic or when an employee may need changes to remove workplace barriers.',
    whatThisIs: 'A practical reference on spotting equality risks early and making manager decisions more inclusive and evidence based.',
    keyLegalPoints: [
      'Managers should avoid direct and indirect discrimination, harassment, and victimisation.',
      'Reasonable adjustments may be required where disability places someone at a substantial disadvantage.',
      'Consistency matters, but equal treatment does not always mean identical treatment.',
    ],
    managerShouldDo: [
      'Pause to assess whether a policy, practice, or workspace creates a barrier.',
      'Discuss possible adjustments with the employee and HR in a constructive way.',
      'Record what was considered, agreed, trialled, or declined and why.',
    ],
    managerShouldNotDo: [
      'Do not ask intrusive medical questions without a clear reason.',
      'Do not refuse changes just because no one else has them.',
      'Do not disclose sensitive health or equality information casually.',
    ],
    whenToEscalate: [
      'There is a disability-related issue, a complaint of discrimination, or a tribunal risk.',
      'The proposed adjustment has material cost, safety, or resourcing impact.',
      'A manager is unsure whether a policy should be applied differently in a specific case.',
    ],
    relatedForms: ['Adjustment request note', 'Occupational health referral', 'Equality risk review'],
    tags: ['equality', 'discrimination', 'reasonable adjustments', 'disability', 'harassment'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'sexual-harassment-prevention',
    title: 'Sexual Harassment Prevention',
    section: 'equality-and-wellbeing',
    sectionLabel: 'Section D - Equality and Wellbeing',
    whenToUse: 'Use when setting team standards, responding to inappropriate behaviour, or supporting someone who reports sexual harassment.',
    whatThisIs: 'Manager guidance on prevention, early intervention, reporting, and escalation where unwanted conduct of a sexual nature is raised or observed.',
    keyLegalPoints: [
      'Employers should take active steps to prevent harassment, not only respond after complaints.',
      'Managers should treat reports seriously, sensitively, and without retaliation.',
      'The same standards apply to in-person, remote, social, and messaging conduct linked to work.',
    ],
    managerShouldDo: [
      'Reinforce expected behaviour and challenge inappropriate comments early.',
      'Create a safe route for concerns and listen without judgment.',
      'Escalate promptly so the business can investigate and support the people affected.',
    ],
    managerShouldNotDo: [
      'Do not minimise concerns as banter or misunderstandings without review.',
      'Do not ask the reporter to resolve it informally if they do not want to.',
      'Do not discuss allegations with people who do not need to know.',
    ],
    whenToEscalate: [
      'Any report of sexual harassment, assault, coercion, or retaliation is raised.',
      'The alleged conduct involves a manager, senior leader, client, or third party.',
      'Protective steps may be needed immediately.',
    ],
    relatedForms: ['Incident report', 'Investigation notes', 'Support plan'],
    tags: ['sexual harassment', 'harassment', 'bullying', 'conduct', 'safeguarding'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'family-friendly-rights',
    title: 'Family-Friendly Rights',
    section: 'family-rights',
    sectionLabel: 'Section E - Family Rights',
    whenToUse: 'Use when an employee asks about maternity, paternity, adoption, shared parental, parental, or other family-related leave and pay.',
    whatThisIs: 'A high-level manager guide for handling family-related conversations consistently and routing the detail through HR and payroll processes.',
    keyLegalPoints: [
      'Family-related rights should be handled carefully and without detriment.',
      'Timing, eligibility, and notice requirements vary by leave type.',
      'Managers should avoid assumptions about availability, commitment, or future plans.',
    ],
    managerShouldDo: [
      'Signpost the employee to the right policy and involve HR early.',
      'Plan cover and handover sensitively and in good time.',
      'Keep in touch arrangements and return plans documented clearly.',
    ],
    managerShouldNotDo: [
      'Do not pressure the employee about when they will return.',
      'Do not make decisions on progression or workload based on assumptions about family commitments.',
      'Do not give payroll or entitlement answers unless confirmed by the policy or HR.',
    ],
    whenToEscalate: [
      'There is a dispute about eligibility, pay, return rights, or detriment.',
      'The situation overlaps with sickness, redundancy, or performance concerns.',
      'The employee raises concerns about unfair treatment linked to pregnancy or family leave.',
    ],
    relatedForms: ['Family leave notification form', 'Keep in touch plan', 'Return to work planning note'],
    tags: ['family rights', 'maternity', 'paternity', 'shared parental', 'parental leave'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'neonatal-care-leave',
    title: 'Neonatal Care Leave',
    section: 'family-rights',
    sectionLabel: 'Section E - Family Rights',
    whenToUse: 'Use when a baby requires neonatal care and the employee asks about additional time away from work or support.',
    whatThisIs: 'A manager-facing prompt guide to support urgent conversations compassionately and route them through the correct leave process.',
    keyLegalPoints: [
      'Neonatal care related rights should be handled promptly and sensitively.',
      'Eligibility, notice, and pay details may depend on the specific statutory and policy framework in force.',
      'Managers should avoid creating barriers for parents already in a stressful situation.',
    ],
    managerShouldDo: [
      'Acknowledge the situation empathetically and involve HR quickly.',
      'Record agreed leave, contact preferences, and any immediate support actions.',
      'Check whether other family, sickness, or compassionate leave policies are also relevant.',
    ],
    managerShouldNotDo: [
      'Do not ask the employee to navigate the process alone during a crisis.',
      'Do not assume they should use annual leave instead.',
      'Do not share personal or medical details widely within the team.',
    ],
    whenToEscalate: [
      'Any neonatal care leave or pay query is raised.',
      'There is overlap with maternity, paternity, adoption, or shared parental arrangements.',
      'Payroll or entitlement details need confirmation.',
    ],
    relatedForms: ['Family leave notification form', 'Payroll handoff note', 'Manager support plan'],
    tags: ['neonatal care', 'family rights', 'parental leave', 'maternity', 'paternity'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'data-protection-in-hr',
    title: 'Data Protection in HR',
    section: 'compliance',
    sectionLabel: 'Section F - Compliance',
    whenToUse: 'Use when handling employee files, sickness data, investigations, references, or any document containing personal or special category data.',
    whatThisIs: 'A practical guide to collecting, storing, sharing, and retaining employee information appropriately.',
    keyLegalPoints: [
      'HR data should only be used for a legitimate purpose and shared on a need-to-know basis.',
      'Sensitive data, including health and disciplinary material, requires extra care.',
      'Managers should follow the approved system, retention, and access controls.',
    ],
    managerShouldDo: [
      'Store records in approved HR systems and controlled folders only.',
      'Limit circulation of sensitive material to the people handling the matter.',
      'Check before sending data externally or using personal email or messaging apps.',
    ],
    managerShouldNotDo: [
      'Do not keep shadow HR files on personal devices.',
      'Do not forward sensitive attachments casually for awareness.',
      'Do not retain information longer than the process requires.',
    ],
    whenToEscalate: [
      'There is a suspected data breach or misdirected email.',
      'An access request, deletion request, or subject access request is received.',
      'The manager needs to share data with a third party or overseas recipient.',
    ],
    relatedForms: ['Data incident report', 'Subject access request workflow', 'Retention checklist'],
    tags: ['data protection', 'gdpr', 'employee data', 'privacy', 'special category'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'monitoring-at-work',
    title: 'Monitoring at Work',
    section: 'compliance',
    sectionLabel: 'Section F - Compliance',
    whenToUse: 'Use when considering checks on attendance, system use, email, calls, location, or productivity.',
    whatThisIs: 'A guide to keeping workplace monitoring proportionate, transparent, and tied to a clear business purpose.',
    keyLegalPoints: [
      'Monitoring should have a legitimate reason and be proportionate to that aim.',
      'Employees should normally know what monitoring happens and why.',
      'Monitoring decisions can create privacy, trust, and equality risks if poorly handled.',
    ],
    managerShouldDo: [
      'Clarify the business issue first and consider less intrusive options.',
      'Check the policy and seek approval before introducing or expanding monitoring.',
      'Explain expectations and any monitoring practice clearly to affected employees.',
    ],
    managerShouldNotDo: [
      'Do not monitor people secretly unless authorised under a tightly controlled process.',
      'Do not use monitoring because of general mistrust of remote or flexible workers.',
      'Do not collect more data than the issue requires.',
    ],
    whenToEscalate: [
      'Any new or increased monitoring is being proposed.',
      'The monitoring could affect special category data, union activity, or off-hours behaviour.',
      'The results may be used in a disciplinary or capability process.',
    ],
    relatedForms: ['Monitoring proposal note', 'Privacy impact prompt', 'Investigation approval record'],
    tags: ['monitoring', 'privacy', 'remote working', 'surveillance', 'data protection'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'whistleblowing',
    title: 'Whistleblowing',
    section: 'compliance',
    sectionLabel: 'Section F - Compliance',
    whenToUse: 'Use when someone raises a serious concern about wrongdoing, legal breaches, risk, fraud, or public interest issues.',
    whatThisIs: 'Manager guidance on recognising protected disclosures and getting them into the correct confidential process quickly.',
    keyLegalPoints: [
      'Some disclosures may attract legal protection and should not lead to retaliation.',
      'Managers should focus on routing the concern safely rather than testing the full legal position themselves.',
      'Confidentiality should be preserved as far as possible.',
    ],
    managerShouldDo: [
      'Listen carefully and thank the person for raising the concern.',
      'Record the issue factually and escalate it through the whistleblowing route.',
      'Protect the reporter from disadvantage or unnecessary exposure.',
    ],
    managerShouldNotDo: [
      'Do not treat the issue as a personal complaint if it may involve wider wrongdoing.',
      'Do not promise secrecy you cannot guarantee, but do explain limited sharing.',
      'Do not reveal the reporter’s identity casually.',
    ],
    whenToEscalate: [
      'Any allegation of legal breach, fraud, safety risk, cover-up, or serious misconduct is raised.',
      'The issue concerns senior leaders or financial controls.',
      'Retaliation concerns are reported.',
    ],
    relatedForms: ['Protected disclosure record', 'Investigation referral', 'Reporter support plan'],
    tags: ['whistleblowing', 'protected disclosure', 'fraud', 'safeguarding', 'retaliation'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'training-repayment-agreements',
    title: 'Training Repayment Agreements',
    section: 'compliance',
    sectionLabel: 'Section F - Compliance',
    whenToUse: 'Use when approving funded training that may include a repayment clause if the employee leaves within a set period.',
    whatThisIs: 'A guide to using training repayment clauses carefully so they are clear, proportionate, and documented in advance.',
    keyLegalPoints: [
      'Repayment terms should be transparent and agreed before the cost is incurred.',
      'The clause should be proportionate and align with the employer’s contract terms and payroll process.',
      'Managers should avoid surprise deductions or informal side agreements.',
    ],
    managerShouldDo: [
      'Confirm approval, cost, repayment trigger, and tapering terms in writing before enrolment.',
      'Check whether the training is mandatory or optional before proposing repayment.',
      'Keep a copy of the signed agreement and approval trail.',
    ],
    managerShouldNotDo: [
      'Do not promise repayment terms verbally only.',
      'Do not assume all training costs are automatically recoverable.',
      'Do not arrange payroll deductions without confirming the contractual basis.',
    ],
    whenToEscalate: [
      'A deduction from pay is being proposed.',
      'The employee disputes the repayment term or leaves before training is completed.',
      'The training is linked to a professional qualification or regulatory requirement.',
    ],
    relatedForms: ['Training approval form', 'Repayment agreement', 'Payroll deduction request'],
    tags: ['training', 'repayment', 'deduction', 'agreement', 'development'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'notice-and-exit-steps',
    title: 'Notice and Exit Steps',
    section: 'leaving-employment',
    sectionLabel: 'Section G - Leaving Employment',
    whenToUse: 'Use when an employee resigns, is given notice, or the team is preparing for an agreed exit.',
    whatThisIs: 'A practical checklist for handling notice periods, final steps, handovers, and documentation consistently.',
    keyLegalPoints: [
      'Notice requirements should match the contract and any applicable policy.',
      'Managers should confirm exit dates, leave balance, handover needs, and system access in a controlled way.',
      'Special care may be needed if the exit overlaps with sickness, family leave, or disciplinary action.',
    ],
    managerShouldDo: [
      'Confirm the resignation or notice details in writing.',
      'Work with HR on final dates, garden leave, handover, and equipment return.',
      'Maintain professional treatment throughout the notice period.',
    ],
    managerShouldNotDo: [
      'Do not alter the end date informally without checking the contract.',
      'Do not block access suddenly unless there is a clear business reason and approval.',
      'Do not ignore outstanding holiday, expenses, or documentation tasks.',
    ],
    whenToEscalate: [
      'There is disagreement about notice length, resignation wording, or the end date.',
      'The employee is off sick, on family leave, or in a live process during notice.',
      'Restrictive covenants, garden leave, or immediate removal from systems is being considered.',
    ],
    relatedForms: ['Resignation acknowledgement', 'Exit checklist', 'Handover plan'],
    tags: ['notice', 'resignation', 'exit', 'handover', 'garden leave'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'redundancy-basics',
    title: 'Redundancy Basics',
    section: 'leaving-employment',
    sectionLabel: 'Section G - Leaving Employment',
    whenToUse: 'Use when roles may no longer be needed, structures are changing, or cost-saving proposals may affect posts.',
    whatThisIs: 'A high-level manager reference to recognise redundancy risk early and involve HR before any proposal is communicated.',
    keyLegalPoints: [
      'Redundancy is about reduced need for employees to do work of a particular kind, not simple dissatisfaction with performance.',
      'Consultation, fair selection, and consideration of alternatives are central.',
      'The legal risk rises quickly if managers announce outcomes before process design is agreed.',
    ],
    managerShouldDo: [
      'Pause early and involve HR before discussing redundancy with employees.',
      'Prepare a business rationale and evidence for the proposed change.',
      'Consider alternatives such as vacancies, restructuring, or reduced overtime.',
    ],
    managerShouldNotDo: [
      'Do not use redundancy as a shortcut for performance or conduct problems.',
      'Do not promise roles are safe or at risk before the process is approved.',
      'Do not create selection criteria casually or retrospectively.',
    ],
    whenToEscalate: [
      'Any possible redundancy situation is identified.',
      'There may be group consultation, pooled selection, or protected leave issues.',
      'Settlement discussions or dismissal outcomes are being considered.',
    ],
    relatedForms: ['Business case template', 'Consultation plan', 'Selection matrix'],
    tags: ['redundancy', 'restructure', 'consultation', 'selection', 'notice'],
    lastReviewed: '28 Mar 2026',
  },
  {
    id: 'references-after-employment',
    title: 'References After Employment',
    section: 'leaving-employment',
    sectionLabel: 'Section G - Leaving Employment',
    whenToUse: 'Use when an external employer requests a reference for a former employee or someone asks what can be said in a reference.',
    whatThisIs: 'Guidance on handling references consistently, limiting risk, and using approved wording.',
    keyLegalPoints: [
      'References should be accurate, fair, and not misleading.',
      'Managers should follow the agreed reference approach rather than improvise.',
      'Sensitive allegations or live disputes should not be included casually.',
    ],
    managerShouldDo: [
      'Use the approved reference route or template.',
      'Check employment dates, role title, and any agreed wording carefully.',
      'Redirect requests that fall outside the standard approach to HR.',
    ],
    managerShouldNotDo: [
      'Do not provide personal character references on company letterhead without approval.',
      'Do not include unproven allegations or opinion presented as fact.',
      'Do not share more information than the employer policy allows.',
    ],
    whenToEscalate: [
      'There is a settlement agreement, live dispute, or safeguarding concern.',
      'The requesting party wants detailed conduct or performance commentary.',
      'The former employee has challenged earlier reference wording.',
    ],
    relatedForms: ['Reference request template', 'Approved standard reference', 'HR escalation note'],
    tags: ['references', 'former employee', 'recruitment', 'exit', 'template'],
    lastReviewed: '28 Mar 2026',
  },
];
