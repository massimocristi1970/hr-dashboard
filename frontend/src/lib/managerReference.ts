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

export interface ManagerReferenceSource {
  id: string;
  label: string;
  provider: 'Acas' | 'GOV.UK' | 'Legislation.gov.uk' | 'ICO';
  url: string;
}

export interface ManagerReferenceEnhancement {
  managerChecklist: string[];
  commonScenarios: string[];
  recordsToKeep: string[];
  riskNotes: string[];
  sourceSummary: string[];
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

export const managerReferenceSourceLibrary: Record<string, ManagerReferenceSource> = {
  acasCodeDisciplineGrievance: {
    id: 'acasCodeDisciplineGrievance',
    label: 'Acas Code of Practice on disciplinary and grievance procedures',
    provider: 'Acas',
    url: 'https://www.acas.org.uk/acas-code-of-practice-on-disciplinary-and-grievance-procedures',
  },
  acasDisciplinaryProcedure: {
    id: 'acasDisciplinaryProcedure',
    label: 'Acas disciplinary procedure guidance',
    provider: 'Acas',
    url: 'https://www.acas.org.uk/disciplinary-procedure-step-by-step',
  },
  acasGrievanceProcedure: {
    id: 'acasGrievanceProcedure',
    label: 'Acas formal grievance procedure guidance',
    provider: 'Acas',
    url: 'https://www.acas.org.uk/grievance-procedure-step-by-step',
  },
  acasFlexibleWorking: {
    id: 'acasFlexibleWorking',
    label: 'Acas flexible working guidance',
    provider: 'Acas',
    url: 'https://www.acas.org.uk/flexible-working',
  },
  acasFlexibleWorkingCode: {
    id: 'acasFlexibleWorkingCode',
    label: 'Acas Code of Practice on requests for flexible working',
    provider: 'Acas',
    url: 'https://www.acas.org.uk/acas-code-of-practice-on-flexible-working-requests',
  },
  acasReasonableAdjustments: {
    id: 'acasReasonableAdjustments',
    label: 'Acas reasonable adjustments at work guidance',
    provider: 'Acas',
    url: 'https://www.acas.org.uk/reasonable-adjustments',
  },
  acasRedundancy: {
    id: 'acasRedundancy',
    label: 'Acas redundancy guidance',
    provider: 'Acas',
    url: 'https://www.acas.org.uk/redundancy',
  },
  govRightToWorkGuide: {
    id: 'govRightToWorkGuide',
    label: "Employer's guide to right to work checks",
    provider: 'GOV.UK',
    url: 'https://www.gov.uk/government/publications/right-to-work-checks-employers-guide',
  },
  govRightToWorkCheckTool: {
    id: 'govRightToWorkCheckTool',
    label: "Checking a job applicant's right to work",
    provider: 'GOV.UK',
    url: 'https://www.gov.uk/check-job-applicant-right-to-work',
  },
  govMaternityEmployerGuide: {
    id: 'govMaternityEmployerGuide',
    label: 'Statutory Maternity Pay and Leave: employer guide',
    provider: 'GOV.UK',
    url: 'https://www.gov.uk/employers-maternity-pay-leave',
  },
  govNeonatalEmployerGuide: {
    id: 'govNeonatalEmployerGuide',
    label: 'Statutory Neonatal Care Pay and Leave: employer guide',
    provider: 'GOV.UK',
    url: 'https://www.gov.uk/employers-neonatal-care-pay-leave',
  },
  govRedundancyRights: {
    id: 'govRedundancyRights',
    label: 'Redundancy: your rights',
    provider: 'GOV.UK',
    url: 'https://www.gov.uk/redundancy-your-rights',
  },
  legislationEmploymentRightsAct: {
    id: 'legislationEmploymentRightsAct',
    label: 'Employment Rights Act 1996',
    provider: 'Legislation.gov.uk',
    url: 'https://www.legislation.gov.uk/ukpga/1996/18/contents',
  },
  legislationEqualityAct: {
    id: 'legislationEqualityAct',
    label: 'Equality Act 2010',
    provider: 'Legislation.gov.uk',
    url: 'https://www.legislation.gov.uk/ukpga/2010/15/contents',
  },
  icoEmploymentRecords: {
    id: 'icoEmploymentRecords',
    label: 'ICO employment records guidance',
    provider: 'ICO',
    url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/employment-practices-and-data-protection-keeping-employment-records/',
  },
  icoWorkersHealth: {
    id: 'icoWorkersHealth',
    label: 'ICO workers’ health information guidance',
    provider: 'ICO',
    url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/information-about-workers-health/',
  },
  icoRecruitmentSelection: {
    id: 'icoRecruitmentSelection',
    label: 'ICO recruitment and selection guidance',
    provider: 'ICO',
    url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/recruitment-and-selection/',
  },
};

export const managerReferenceGuideSources: Record<string, string[]> = {
  'written-statement-of-employment-particulars': ['legislationEmploymentRightsAct'],
  'probation-periods-and-extensions': ['acasDisciplinaryProcedure', 'legislationEmploymentRightsAct'],
  'right-to-work-checks': ['govRightToWorkGuide', 'govRightToWorkCheckTool'],
  'references-and-recruitment-checks': ['icoRecruitmentSelection', 'govRightToWorkGuide'],
  'sickness-absence-and-fit-notes': ['icoWorkersHealth', 'acasReasonableAdjustments'],
  'holiday-entitlement-and-carry-over': ['legislationEmploymentRightsAct'],
  'flexible-working-requests': ['acasFlexibleWorking', 'acasFlexibleWorkingCode', 'legislationEmploymentRightsAct'],
  'working-from-home-and-remote-management': ['acasFlexibleWorking', 'icoEmploymentRecords'],
  'grievance-process': ['acasCodeDisciplineGrievance', 'acasGrievanceProcedure'],
  'disciplinary-process': ['acasCodeDisciplineGrievance', 'acasDisciplinaryProcedure'],
  'capability-and-performance-management': ['acasDisciplinaryProcedure', 'acasCodeDisciplineGrievance'],
  'equality-discrimination-and-reasonable-adjustments': ['acasReasonableAdjustments', 'legislationEqualityAct'],
  'sexual-harassment-prevention': ['legislationEqualityAct', 'acasGrievanceProcedure'],
  'family-friendly-rights': ['govMaternityEmployerGuide', 'legislationEmploymentRightsAct'],
  'neonatal-care-leave': ['govNeonatalEmployerGuide', 'legislationEmploymentRightsAct'],
  'data-protection-in-hr': ['icoEmploymentRecords', 'icoWorkersHealth'],
  'monitoring-at-work': ['icoWorkersHealth', 'icoEmploymentRecords'],
  'whistleblowing': ['legislationEmploymentRightsAct'],
  'training-repayment-agreements': ['legislationEmploymentRightsAct'],
  'notice-and-exit-steps': ['legislationEmploymentRightsAct'],
  'redundancy-basics': ['acasRedundancy', 'govRedundancyRights', 'legislationEmploymentRightsAct'],
  'references-after-employment': ['icoEmploymentRecords', 'acasDisciplinaryProcedure'],
};

export const managerReferenceGuideEnhancements: Record<string, ManagerReferenceEnhancement> = {
  'written-statement-of-employment-particulars': {
    managerChecklist: [
      'Confirm pay, hours, holiday, reporting line, place of work, and notice before the start date.',
      'Check the offer, contract, and any onboarding emails all say the same thing.',
      'Escalate any non-standard term before the employee starts relying on it.',
    ],
    commonScenarios: [
      'A starter says the verbal offer included hybrid working that is missing from the contract.',
      'A manager wants to change the hours after an offer has already been accepted.',
    ],
    recordsToKeep: ['Final offer wording', 'Issued contract or statement', 'Any agreed variation confirmed in writing'],
    riskNotes: [
      'Conflicting promises are hard to unwind once the employee has started.',
      'Loose wording around hours or location can trigger early employee relations issues.',
    ],
    sourceSummary: [
      'The Employment Rights Act sets the legal framework for written particulars and notice-related terms.',
    ],
  },
  'probation-periods-and-extensions': {
    managerChecklist: [
      'Schedule check-ins early instead of waiting for the final week.',
      'Set clear objectives, support actions, and a date for the final review.',
      'If extending, confirm the reason, extension length, and success criteria in writing.',
    ],
    commonScenarios: [
      'Performance concerns are real but the manager has not documented them during the first months.',
      'Absence or disability-related issues are affecting the assessment and fairness needs checking.',
    ],
    recordsToKeep: ['Probation objectives', 'Review notes', 'Extension or confirmation letter'],
    riskNotes: [
      'Late surprises make even probation decisions feel unfair and badly managed.',
      'Probation should not be used to sidestep discrimination, sickness, or whistleblowing concerns.',
    ],
    sourceSummary: [
      'Acas guidance supports fair process and reasonable investigation where concerns are serious.',
      'The Employment Rights Act remains relevant where notice, contractual rights, or dismissal issues arise.',
    ],
  },
  'right-to-work-checks': {
    managerChecklist: [
      'Make sure the correct right to work check route is used before day one.',
      'Check whether follow-up reminders are needed for time-limited permission.',
      'Store evidence only through the approved HR process.',
    ],
    commonScenarios: [
      'A candidate wants to start immediately but the Home Office share code is not yet available.',
      'A visa expiry reminder is approaching and the line manager is unsure whether work can continue.',
    ],
    recordsToKeep: ['Check outcome', 'Date of check', 'Copy or reference to the verified evidence'],
    riskNotes: [
      'Inconsistent checking can create both compliance risk and discrimination risk.',
      'Letting someone start before the check is complete can remove the statutory excuse.',
    ],
    sourceSummary: [
      'GOV.UK guidance explains the permitted check methods and when follow-up checks are needed.',
    ],
  },
  'references-and-recruitment-checks': {
    managerChecklist: [
      'Use the role-based recruitment checklist instead of ad hoc checks.',
      'Check concerns with HR before changing an offer or making adverse assumptions.',
      'Keep any reference or screening result tightly controlled.',
    ],
    commonScenarios: [
      'A reference contains ambiguous criticism and the hiring manager wants to withdraw the offer immediately.',
      'A manager wants an extra check for one candidate because they seem higher risk.',
    ],
    recordsToKeep: ['Recruitment approval trail', 'Reference outcome notes', 'Offer decision rationale'],
    riskNotes: [
      'Unstructured checks can drift into unfair or discriminatory decision-making.',
      'Recruitment data often contains sensitive information and should not be circulated casually.',
    ],
    sourceSummary: [
      'ICO guidance helps with fair collection and use of applicant information during recruitment.',
    ],
  },
  'sickness-absence-and-fit-notes': {
    managerChecklist: [
      'Record the absence, expected contact pattern, and any fit note recommendation promptly.',
      'Hold a return to work conversation after appropriate absences.',
      'Consider adjustments or occupational health if the pattern becomes longer-term or repeated.',
    ],
    commonScenarios: [
      'An employee submits a fit note saying they may be fit for work with temporary changes.',
      'There are repeated Monday absences but there may also be stress or disability factors.',
    ],
    recordsToKeep: ['Absence record', 'Fit note details', 'Return to work notes', 'Support actions agreed'],
    riskNotes: [
      'Treating every absence as a conduct issue can quickly become unsafe and unfair.',
      'Health information is sensitive and should be stored and shared carefully.',
    ],
    sourceSummary: [
      'ICO guidance is especially helpful where managers hold or discuss health information.',
      'Acas adjustment guidance is useful when attendance concerns overlap with disability support.',
    ],
  },
  'holiday-entitlement-and-carry-over': {
    managerChecklist: [
      'Check the recorded entitlement before answering any year-end question.',
      'Review whether sickness or family leave affects carry-over rights.',
      'Make sure employees have had a real opportunity to take holiday.',
    ],
    commonScenarios: [
      'An employee says they could not take leave because of a long sickness absence.',
      'A manager wants to refuse carry-over based on team custom rather than policy.',
    ],
    recordsToKeep: ['Leave balance view', 'Carry-over decision note', 'Communications about year-end leave'],
    riskNotes: [
      'Carry-over decisions can become inconsistent if local manager practice replaces policy.',
      'Holiday disputes often arise when team capacity planning has been left too late.',
    ],
    sourceSummary: [
      'The Employment Rights Act and related holiday rights framework are the legal starting point for entitlement decisions.',
    ],
  },
  'flexible-working-requests': {
    managerChecklist: [
      'Meet the employee, understand the request, and explore workable alternatives.',
      'Use evidence on coverage, workload, customer demand, and fairness before deciding.',
      'Document the decision, reasons, and any trial period clearly.',
    ],
    commonScenarios: [
      'An employee asks to compress hours because of caring responsibilities.',
      'Several team members ask for the same remote-working pattern and coverage becomes the issue.',
    ],
    recordsToKeep: ['Request form', 'Meeting notes', 'Operational assessment', 'Decision and review note'],
    riskNotes: [
      'Quick refusals based on manager preference create avoidable risk.',
      'Flexible working requests often overlap with discrimination, disability, or family-related issues.',
    ],
    sourceSummary: [
      'Acas practical guidance and the Acas Code help managers structure a reasonable response process.',
    ],
  },
  'working-from-home-and-remote-management': {
    managerChecklist: [
      'Set expectations for outputs, communication, data handling, and availability.',
      'Check in regularly on wellbeing, equipment, and blockers rather than relying on visibility.',
      'Review whether the arrangement still works for the role and team.',
    ],
    commonScenarios: [
      'A manager wants to monitor online status because they feel unsure whether work is happening.',
      'A remote arrangement is working for performance but team coverage rules are unclear.',
    ],
    recordsToKeep: ['Remote working agreement', 'Review notes', 'Any agreed equipment or support actions'],
    riskNotes: [
      'Poorly explained monitoring can damage trust and create privacy issues.',
      'Remote work concerns are often really performance, support, or communication issues in disguise.',
    ],
    sourceSummary: [
      'Acas guidance helps with flexible arrangements and fair conversations.',
      'ICO guidance matters where records, monitoring, or device use become part of management decisions.',
    ],
  },
  'grievance-process': {
    managerChecklist: [
      'Acknowledge the grievance and decide who can handle it impartially.',
      'Separate investigation, hearing, and outcome stages as far as possible.',
      'Confirm the outcome and any next steps in writing.',
    ],
    commonScenarios: [
      'An employee raises bullying concerns but also says they do not want a formal process yet.',
      'The grievance is against the employee’s own line manager, so another manager or HR must lead.',
    ],
    recordsToKeep: ['Grievance statement', 'Meeting notes', 'Evidence reviewed', 'Outcome and appeal record'],
    riskNotes: [
      'Trying to resolve a serious grievance informally without structure can make things worse.',
      'Retaliation or poor confidentiality handling can become a bigger issue than the original complaint.',
    ],
    sourceSummary: [
      'The Acas Code and Acas grievance guidance set the benchmark for a fair and documented process.',
    ],
  },
  'disciplinary-process': {
    managerChecklist: [
      'Clarify the allegation and whether an investigation is needed before any hearing.',
      'Keep the investigator and decision-maker separate where possible.',
      'Explain the allegation, evidence, possible outcomes, and right to be accompanied.',
    ],
    commonScenarios: [
      'A conduct issue looks serious, but key facts are still disputed.',
      'A manager wants to move straight to a warning without a full investigation.',
    ],
    recordsToKeep: ['Investigation notes', 'Invite letter', 'Hearing notes', 'Outcome and appeal record'],
    riskNotes: [
      'Predetermined outcomes undermine fairness quickly.',
      'Performance, sickness, and misconduct issues should not be mixed together casually.',
    ],
    sourceSummary: [
      'The Acas Code and disciplinary guidance are the main practical source for a fair employer process.',
    ],
  },
  'capability-and-performance-management': {
    managerChecklist: [
      'State the gap between expected and actual performance with examples.',
      'Agree support, timescales, and review points that are realistic for the role.',
      'Check whether health, training, workload, or unclear priorities are contributing factors.',
    ],
    commonScenarios: [
      'A high performer in one area is missing deadlines elsewhere and expectations are inconsistent.',
      'A capability process may be needed but the employee has raised stress or health concerns.',
    ],
    recordsToKeep: ['Performance objectives', 'Review notes', 'Support or training actions', 'Formal outcome letters'],
    riskNotes: [
      'Vague labels like poor attitude do not give the employee a fair chance to improve.',
      'Performance processes often become risky when the root issue is actually health or role design.',
    ],
    sourceSummary: [
      'Acas process guidance helps where capability concerns move into a formal framework.',
    ],
  },
  'equality-discrimination-and-reasonable-adjustments': {
    managerChecklist: [
      'Pause before applying a policy and ask whether it creates a barrier in this case.',
      'Discuss possible adjustments practically and keep the conversation collaborative.',
      'Review whether trial adjustments are working and record the outcome.',
    ],
    commonScenarios: [
      'An employee needs changes to hours or equipment because of a health condition.',
      'A neutral team rule is affecting one employee more heavily because of disability or religion.',
    ],
    recordsToKeep: ['Adjustment discussion notes', 'Advice received', 'Decision rationale', 'Review dates'],
    riskNotes: [
      'Treating everyone identically is not always legally safe where adjustments are needed.',
      'Managers often create risk by delaying difficult conversations instead of exploring workable changes.',
    ],
    sourceSummary: [
      'Acas guidance is useful for manager conversations and adjustment handling.',
      'The Equality Act is the legal anchor for discrimination and reasonable adjustment duties.',
    ],
  },
  'sexual-harassment-prevention': {
    managerChecklist: [
      'Act on concerning behaviour early and set clear team standards.',
      'Listen carefully to reports and route them to HR or the formal process quickly.',
      'Consider immediate protective steps if safety, intimidation, or retaliation is a concern.',
    ],
    commonScenarios: [
      'A team member says a colleague has been sending inappropriate messages out of hours.',
      'A manager witnesses behaviour that has not yet been formally reported.',
    ],
    recordsToKeep: ['Initial concern note', 'Protective actions taken', 'Investigation referral', 'Support measures'],
    riskNotes: [
      'Calling it banter or waiting for a formal complaint can materially increase harm and risk.',
      'Third-party or client conduct still needs active management where work is affected.',
    ],
    sourceSummary: [
      'The Equality Act is the core legal source.',
      'Acas grievance guidance helps structure the employer response and reporting route.',
    ],
  },
  'family-friendly-rights': {
    managerChecklist: [
      'Signpost the employee to the correct family leave route and involve HR early.',
      'Plan cover, contact preferences, and return arrangements without pressure.',
      'Check any overlap with pay, holiday, redundancy, or sickness issues.',
    ],
    commonScenarios: [
      'A manager is asked about maternity or paternity timing but payroll confirmation is still needed.',
      'An employee wants clarity on keep-in-touch arrangements before going on leave.',
    ],
    recordsToKeep: ['Leave notification', 'Cover plan', 'Contact agreement', 'Return planning notes'],
    riskNotes: [
      'Casual comments about commitment or progression can create serious detriment risk.',
      'Family leave cases often cross into holiday, flexible working, or redundancy questions.',
    ],
    sourceSummary: [
      'GOV.UK employer guides are the best practical source for statutory pay and process detail.',
      'The Employment Rights Act remains the core legal framework behind many family-related protections.',
    ],
  },
  'neonatal-care-leave': {
    managerChecklist: [
      'Treat the issue as urgent and route it through HR or payroll without delay.',
      'Agree compassionate contact arrangements and immediate cover.',
      'Check whether other family or sickness rights are also engaged.',
    ],
    commonScenarios: [
      'A parent is already on another family leave arrangement when neonatal care becomes relevant.',
      'The team wants to support quickly but no one is sure which leave category applies.',
    ],
    recordsToKeep: ['Initial notification', 'Leave and pay handoff note', 'Support actions agreed'],
    riskNotes: [
      'Managers should not improvise pay answers in a highly sensitive situation.',
      'Using annual leave as the default answer may be wrong and can feel deeply unsupportive.',
    ],
    sourceSummary: [
      'GOV.UK provides the most practical employer-facing guide for neonatal leave and pay arrangements.',
    ],
  },
  'data-protection-in-hr': {
    managerChecklist: [
      'Use approved storage and sharing routes for employee records.',
      'Ask whether the recipient really needs the information before sending it.',
      'Flag suspected breaches or unusual requests immediately.',
    ],
    commonScenarios: [
      'A manager wants to send sickness or disciplinary material to a wider group for context.',
      'An employee asks what information is held about them or how long it is kept.',
    ],
    recordsToKeep: ['Access decisions', 'Sharing rationale', 'Incident logs', 'Retention actions where relevant'],
    riskNotes: [
      'Health, disciplinary, and grievance records are especially easy to overshare.',
      'Managers create avoidable risk when they keep private copies outside HR systems.',
    ],
    sourceSummary: [
      'ICO employment and worker-health guidance is the strongest practical source for everyday manager handling of HR data.',
    ],
  },
  'monitoring-at-work': {
    managerChecklist: [
      'Define the business issue before proposing monitoring.',
      'Check whether there is a less intrusive way to solve the problem.',
      'Get approval and communicate the approach clearly before using it.',
    ],
    commonScenarios: [
      'A manager wants to track logins or online status because productivity feels lower remotely.',
      'Email or system records may need to be reviewed during an investigation.',
    ],
    recordsToKeep: ['Business reason note', 'Approval trail', 'Communication to employees', 'Investigation scope if relevant'],
    riskNotes: [
      'Monitoring often feels like a quick fix but can create privacy and trust issues fast.',
      'Using monitoring selectively against one employee without a clear basis can become unfair and risky.',
    ],
    sourceSummary: [
      'ICO guidance is the key practical source where manager decisions overlap with privacy and worker data.',
    ],
  },
  'whistleblowing': {
    managerChecklist: [
      'Record the concern factually and route it through the protected disclosure process quickly.',
      'Limit knowledge of the report to the people handling it.',
      'Watch for any sign of retaliation after the disclosure is made.',
    ],
    commonScenarios: [
      'An employee reports suspected fraud or legal non-compliance but says they fear being identified.',
      'A manager receives a concern that sounds part personal complaint and part public-interest issue.',
    ],
    recordsToKeep: ['Disclosure note', 'Escalation path used', 'Protective actions', 'Follow-up decisions'],
    riskNotes: [
      'Misclassifying a protected disclosure as a routine complaint can create serious legal risk.',
      'Retaliation concerns often arise after the initial disclosure rather than on day one.',
    ],
    sourceSummary: [
      'The Employment Rights Act is the main legal source for protected disclosure protections.',
    ],
  },
  'training-repayment-agreements': {
    managerChecklist: [
      'Agree the repayment terms before the training starts, not after the invoice arrives.',
      'Check whether the training is optional and whether the clause is proportionate.',
      'Make sure payroll and HR hold the signed agreement.',
    ],
    commonScenarios: [
      'An employee resigns shortly after expensive external training and the manager wants to recover the cost.',
      'A professional qualification is mandatory for the role and repayment may not be straightforward.',
    ],
    recordsToKeep: ['Training approval', 'Signed repayment agreement', 'Cost evidence', 'Payroll instruction if used'],
    riskNotes: [
      'Verbal agreements are weak and hard to rely on later.',
      'Managers often assume every training cost is recoverable when the contractual position is not clear.',
    ],
    sourceSummary: [
      'The Employment Rights Act is relevant where deductions from wages or contractual enforcement are in play.',
    ],
  },
  'notice-and-exit-steps': {
    managerChecklist: [
      'Confirm the resignation or notice details in writing and check the contractual notice period.',
      'Plan handover, access, holiday balance, and final dates with HR.',
      'Keep treatment professional throughout the notice period even where emotions are running high.',
    ],
    commonScenarios: [
      'An employee resigns verbally and the manager is unsure what the confirmed end date should be.',
      'There is a request for garden leave or immediate removal from systems.',
    ],
    recordsToKeep: ['Resignation confirmation', 'Notice calculation', 'Exit checklist', 'Handover notes'],
    riskNotes: [
      'Informal end-date changes create avoidable disputes about pay, holiday, and notice.',
      'Managers can create risk by treating notice as punishment instead of a managed exit process.',
    ],
    sourceSummary: [
      'The Employment Rights Act is the key source where notice rights and contractual exit issues are being checked.',
    ],
  },
  'redundancy-basics': {
    managerChecklist: [
      'Pause early and involve HR before speaking to affected employees about outcomes.',
      'Clarify the business rationale, pool, alternatives, and consultation route.',
      'Document why redundancy, rather than performance or conduct management, is the real issue.',
    ],
    commonScenarios: [
      'A restructure may remove a role but there are possible alternative vacancies.',
      'A manager says a role is redundant when the concern is actually underperformance.',
    ],
    recordsToKeep: ['Business case', 'Consultation plan', 'Selection rationale', 'Alternative role review'],
    riskNotes: [
      'Early wording from managers can prejudice the whole process if outcomes sound predetermined.',
      'Pooling, consultation, and family-leave protections make redundancy higher risk than many managers expect.',
    ],
    sourceSummary: [
      'Acas gives the clearest practical process guidance for employers.',
      'GOV.UK helps with rights and payments, while the Employment Rights Act remains the legal foundation.',
    ],
  },
  'references-after-employment': {
    managerChecklist: [
      'Use the agreed reference route or standard wording.',
      'Check dates, job title, and any approved wording before replying.',
      'Escalate anything outside the normal factual reference approach.',
    ],
    commonScenarios: [
      'A future employer asks for a detailed conduct view rather than a basic factual reference.',
      'There is a live dispute or settlement agreement and the wording may be sensitive.',
    ],
    recordsToKeep: ['Reference request', 'Reference sent', 'Approval or escalation note'],
    riskNotes: [
      'Managers create risk when they give personal opinions on company letterhead.',
      'Live allegations or unresolved disputes should not be described as proven fact.',
    ],
    sourceSummary: [
      'ICO guidance helps with fair handling and retention of employment records used in references.',
    ],
  },
};

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
