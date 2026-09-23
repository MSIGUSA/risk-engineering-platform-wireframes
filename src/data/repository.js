/**
 * Synthetic wireframe fixtures for the Risk Engineering Platform.
 *
 * Shapes follow the discovery artifact JSON in docs/discovery/artifacts.
 * Every organization, account, site, person, policy and document below is
 * invented for navigation only. Nothing here is customer data, approved
 * wording, an API contract or an EF model.
 */

export const TODAY = '2026-09-22';

/* ------------------------------------------------------------------ *
 * Demonstration user profiles
 * ------------------------------------------------------------------ */

export const USERS = [
  {
    id: 'u-dana', principalId: 'PRIN-0001', name: 'Dana Whitfield', initials: 'DW',
    title: 'Risk Engineer — Property', role: 'engineer', organizationId: 'ORG-MSIG-RE',
    email: 'dana.whitfield@example.invalid', skills: ['Property', 'Fire protection'],
    territory: 'Mid-Atlantic', accountScope: ['ACCT-100', 'ACCT-300'],
  },
  {
    id: 'u-marcus', principalId: 'PRIN-0002', name: 'Marcus Oyelaran', initials: 'MO',
    title: 'Senior Risk Engineer — Casualty', role: 'engineer', organizationId: 'ORG-MSIG-RE',
    email: 'marcus.oyelaran@example.invalid', skills: ['Casualty', 'Ergonomics', 'Fleet'],
    territory: 'Pacific Northwest', accountScope: ['ACCT-200'],
  },
  {
    id: 'u-priya', principalId: 'PRIN-0003', name: 'Priya Raghunathan', initials: 'PR',
    title: 'Risk Engineering Manager', role: 'manager', organizationId: 'ORG-MSIG-RE',
    email: 'priya.raghunathan@example.invalid', skills: [],
    territory: 'National', accountScope: ['ACCT-100', 'ACCT-200', 'ACCT-300'],
  },
  {
    id: 'u-tom', principalId: 'PRIN-0004', name: 'Tom Brennan', initials: 'TB',
    title: 'Service Coordinator', role: 'coordinator', organizationId: 'ORG-MSIG-RE',
    email: 'tom.brennan@example.invalid', skills: [],
    territory: 'National', accountScope: ['ACCT-100', 'ACCT-200', 'ACCT-300'],
  },
  {
    id: 'u-ellen', principalId: 'PRIN-0005', name: 'Ellen Vasquez', initials: 'EV',
    title: 'Property Underwriter', role: 'underwriter', organizationId: 'ORG-MSIG-RE',
    email: 'ellen.vasquez@example.invalid', skills: [],
    territory: 'East', accountScope: ['ACCT-100', 'ACCT-300'],
  },
  {
    id: 'u-hannah', principalId: 'PRIN-0006', name: 'Hannah Ipswich', initials: 'HI',
    title: 'Fire Impairment Coordinator', role: 'impairment_team', organizationId: 'ORG-MSIG-RE',
    email: 'hannah.ipswich@example.invalid', skills: ['Sprinkler systems'],
    territory: 'National', accountScope: ['ACCT-100', 'ACCT-200', 'ACCT-300'],
  },
  {
    id: 'u-devin', principalId: 'PRIN-0007', name: 'Devin Cross', initials: 'DC',
    title: 'Platform Operations Lead', role: 'operations', organizationId: 'ORG-MSIG-RE',
    email: 'devin.cross@example.invalid', skills: [],
    territory: 'National', accountScope: [],
  },
  {
    id: 'u-rosa', principalId: 'PRIN-0008', name: 'Rosa Delgado', initials: 'RD',
    title: 'Platform Access Administrator', role: 'access_admin', organizationId: 'ORG-MSIG-RE',
    email: 'rosa.delgado@example.invalid', skills: [],
    territory: 'National', accountScope: [],
  },
  {
    id: 'u-grant', principalId: 'PRIN-0009', name: 'Grant Sollers', initials: 'GS',
    title: 'Vendor Surveyor — Meridian Loss Control', role: 'vendor', organizationId: 'ORG-MERIDIAN',
    email: 'grant.sollers@example.invalid', skills: ['Property'],
    territory: 'Mid-Atlantic', accountScope: [],
  },
  {
    id: 'u-alicia', principalId: 'PRIN-0010', name: 'Alicia Moreno', initials: 'AM',
    title: 'EHS Director — Harbor Manufacturing Group', role: 'customer_admin', organizationId: 'ORG-HARBOR',
    email: 'alicia.moreno@example.invalid', skills: [],
    territory: '—', accountScope: ['ACCT-100'],
  },
  {
    id: 'u-nate', principalId: 'PRIN-0011', name: 'Nate Kim', initials: 'NK',
    title: 'Plant Safety Lead — Riverside Plant', role: 'customer_contributor', organizationId: 'ORG-HARBOR',
    email: 'nate.kim@example.invalid', skills: [],
    territory: '—', accountScope: ['ACCT-100'],
  },
  {
    id: 'u-sofia', principalId: 'PRIN-0012', name: 'Sofia Lindqvist', initials: 'SL',
    title: 'Risk Analyst — Cascade Cold Chain', role: 'customer_viewer', organizationId: 'ORG-CASCADE',
    email: 'sofia.lindqvist@example.invalid', skills: [],
    territory: '—', accountScope: ['ACCT-200'],
  },
];

/* ------------------------------------------------------------------ *
 * Organizations, accounts, entities, sites, policies, contacts
 * ------------------------------------------------------------------ */

export const ORGANIZATIONS = [
  { id: 'ORG-MSIG-RE', kind: 'Workforce', name: 'MSIG USA Risk Engineering', status: 'Active', externalReference: 'HR-ORG-4410' },
  { id: 'ORG-HARBOR', kind: 'Customer', name: 'Harbor Manufacturing Group', status: 'Active', externalReference: 'CRM-ORG-88120' },
  { id: 'ORG-CASCADE', kind: 'Customer', name: 'Cascade Cold Chain', status: 'Active', externalReference: 'CRM-ORG-88433' },
  { id: 'ORG-NORTHGATE', kind: 'Customer', name: 'Northgate Retail Partners', status: 'Active', externalReference: 'CRM-ORG-88907' },
  { id: 'ORG-MERIDIAN', kind: 'Vendor', name: 'Meridian Loss Control Services', status: 'Active', externalReference: 'VEND-2203' },
];

export const ACCOUNTS = [
  {
    id: 'ACCT-100', name: 'Harbor Manufacturing Group', organizationId: 'ORG-HARBOR',
    sourceSystem: 'Account 360', externalId: 'A360-100288', coverageStatus: 'Active',
    producer: 'Kestrel Risk Partners', producerId: 'PROD-5541',
    sicDescription: 'Fabricated metal products', lastRefreshedAt: '2026-09-21T06:12:00Z',
    serviceTier: 'Managed — annual plan', openRecommendations: 4,
  },
  {
    id: 'ACCT-200', name: 'Cascade Cold Chain', organizationId: 'ORG-CASCADE',
    sourceSystem: 'Account 360', externalId: 'A360-100944', coverageStatus: 'Active',
    producer: 'Sound Commercial Brokers', producerId: 'PROD-6620',
    sicDescription: 'Refrigerated warehousing', lastRefreshedAt: '2026-09-20T06:10:00Z',
    serviceTier: 'Managed — annual plan', openRecommendations: 2,
  },
  {
    id: 'ACCT-300', name: 'Northgate Retail Partners', organizationId: 'ORG-NORTHGATE',
    sourceSystem: 'Account 360', externalId: 'A360-101377', coverageStatus: 'Non-renewed',
    producer: 'Kestrel Risk Partners', producerId: 'PROD-5541',
    sicDescription: 'Retail distribution', lastRefreshedAt: '2026-08-30T06:08:00Z',
    serviceTier: 'Transactional', openRecommendations: 1,
  },
];

export const ENTITIES = [
  { id: 'DBA-10', accountId: 'ACCT-100', name: 'Harbor Components LLC', relationship: 'Operating entity' },
  { id: 'DBA-11', accountId: 'ACCT-100', name: 'Harbor Coatings Inc.', relationship: 'Operating entity' },
  { id: 'DBA-20', accountId: 'ACCT-200', name: 'Cascade Distribution Services', relationship: 'Operating entity' },
  { id: 'DBA-30', accountId: 'ACCT-300', name: 'Northgate Logistics', relationship: 'Operating entity' },
];

export const SITES = [
  {
    id: 'SITE-01', accountId: 'ACCT-100', entityId: 'DBA-10', name: 'Riverside Plant',
    address: '1400 Riverside Access Rd, Camden, NJ 08104', timeZone: 'America/New_York',
    status: 'Active', policyRefs: ['POL-PROP-4417', 'POL-WC-2291'], lastVisited: '2024-09-19',
    construction: 'Non-combustible, 1980s', sprinklered: 'Partial', squareFeet: 214000,
  },
  {
    id: 'SITE-02', accountId: 'ACCT-100', entityId: 'DBA-10', name: 'Eastport Warehouse',
    address: '88 Eastport Way, Baltimore, MD 21224', timeZone: 'America/New_York',
    status: 'Active', policyRefs: ['POL-PROP-4417'], lastVisited: '2023-06-14',
    construction: 'Masonry, 1996', sprinklered: 'Yes', squareFeet: 140500,
  },
  {
    id: 'SITE-03', accountId: 'ACCT-100', entityId: 'DBA-11', name: 'Harbor Coatings Line 4',
    address: '77 Foundry St, Chester, PA 19013', timeZone: 'America/New_York',
    status: 'Active', policyRefs: ['POL-PROP-4417', 'POL-GL-5510'], lastVisited: '2025-11-05',
    construction: 'Mixed, 1972', sprinklered: 'Yes', squareFeet: 96000,
  },
  {
    id: 'SITE-04', accountId: 'ACCT-200', entityId: 'DBA-20', name: 'Tacoma Cold Store',
    address: '2205 Port Industrial Way, Tacoma, WA 98421', timeZone: 'America/Los_Angeles',
    status: 'Active', policyRefs: ['POL-PROP-8102'], lastVisited: '2025-04-22',
    construction: 'Insulated metal panel, 2011', sprinklered: 'Yes (ESFR)', squareFeet: 310000,
  },
  {
    id: 'SITE-05', accountId: 'ACCT-200', entityId: 'DBA-20', name: 'Spokane Cross-Dock',
    address: '610 Rail Yard Ave, Spokane, WA 99202', timeZone: 'America/Los_Angeles',
    status: 'Active', policyRefs: ['POL-PROP-8102'], lastVisited: 'Never',
    construction: 'Pre-engineered metal, 2019', sprinklered: 'No', squareFeet: 78000,
  },
  {
    id: 'SITE-06', accountId: 'ACCT-300', entityId: 'DBA-30', name: 'Northgate DC 7',
    address: '9 Commerce Loop, Columbus, OH 43219', timeZone: 'America/New_York',
    status: 'Active', policyRefs: ['POL-GL-5510'], lastVisited: '2026-03-02',
    construction: 'Tilt-up concrete, 2004', sprinklered: 'Yes', squareFeet: 402000,
  },
];

export const POLICIES = [
  { id: 'POL-PROP-4417', accountId: 'ACCT-100', line: 'Property', effective: '2026-01-01', expiration: '2027-01-01', status: 'In force', source: 'UWWB sample' },
  { id: 'POL-WC-2291', accountId: 'ACCT-100', line: 'Workers Compensation', effective: '2026-01-01', expiration: '2027-01-01', status: 'In force', source: 'UWWB sample' },
  { id: 'POL-GL-5510', accountId: 'ACCT-100', line: 'General Liability', effective: '2026-04-01', expiration: '2027-04-01', status: 'In force', source: 'UWWB sample' },
  { id: 'POL-PROP-8102', accountId: 'ACCT-200', line: 'Property', effective: '2026-07-01', expiration: '2027-07-01', status: 'In force', source: 'UWWB sample' },
];

export const CONTACTS = [
  { id: 'CONTACT-01', accountId: 'ACCT-100', siteId: 'SITE-01', name: 'Nate Kim', role: 'Site contact', email: 'nate.kim@example.invalid', phone: '(856) 555-0142', isApplicationUser: true },
  { id: 'CONTACT-02', accountId: 'ACCT-100', siteId: null, name: 'Alicia Moreno', role: 'EHS Director', email: 'alicia.moreno@example.invalid', phone: '(856) 555-0177', isApplicationUser: true },
  { id: 'CONTACT-03', accountId: 'ACCT-100', siteId: 'SITE-03', name: 'Bill Okafor', role: 'Maintenance supervisor', email: 'bill.okafor@example.invalid', phone: '(610) 555-0198', isApplicationUser: false },
  { id: 'CONTACT-04', accountId: 'ACCT-200', siteId: 'SITE-04', name: 'Sofia Lindqvist', role: 'Risk analyst', email: 'sofia.lindqvist@example.invalid', phone: '(253) 555-0121', isApplicationUser: true },
  { id: 'CONTACT-05', accountId: 'ACCT-300', siteId: 'SITE-06', name: 'Renee Dubois', role: 'DC manager', email: 'renee.dubois@example.invalid', phone: '(614) 555-0166', isApplicationUser: false },
];

/* ------------------------------------------------------------------ *
 * Catalog — input forms, output templates, recommendation wording (F22)
 * ------------------------------------------------------------------ */

export const TEMPLATES = [
  {
    id: 'property-standard', kind: 'InputForm', name: 'Property standard survey', owner: 'RE form owner — Property',
    status: 'Published', currentVersion: 3, businessApproved: true, wordingApproved: true,
    applicability: ['Property'], publicationMode: 'Reviewed configuration; no general designer',
    versions: [
      { version: 3, status: 'Published', publishedAt: '2026-06-01', publishedBy: 'u-priya', hash: 'e3b0c442…a495', changeSummary: 'Added repeating building values and fire pump comment rule.' },
      { version: 2, status: 'Retired', publishedAt: '2025-03-14', publishedBy: 'u-priya', hash: '9f86d081…0a08', changeSummary: 'Split protection section from utilities.' },
      { version: 1, status: 'Retired', publishedAt: '2024-01-08', publishedBy: 'u-priya', hash: '2c26b46b…f6d1', changeSummary: 'Initial published version.' },
    ],
    testFixtures: ['No versus blank', 'Repeat buildings', 'Required comments'],
  },
  {
    id: 'ergonomics', kind: 'InputForm', name: 'Ergonomics supplement', owner: 'RE form owner — Casualty',
    status: 'Published', currentVersion: 1, businessApproved: true, wordingApproved: true,
    applicability: ['Workers Compensation'], publicationMode: 'Reviewed configuration; no general designer',
    versions: [{ version: 1, status: 'Published', publishedAt: '2025-09-02', publishedBy: 'u-priya', hash: '486ea462…31bd', changeSummary: 'Initial published version.' }],
    testFixtures: ['Required comments'],
  },
  {
    id: 'cold-storage-protection', kind: 'InputForm', name: 'Cold storage protection supplement', owner: 'RE form owner — Property',
    status: 'Draft', currentVersion: 1, businessApproved: false, wordingApproved: false,
    applicability: ['Property'], publicationMode: 'Reviewed configuration; no general designer',
    versions: [{ version: 1, status: 'Draft', publishedAt: null, publishedBy: null, hash: '—', changeSummary: 'Awaiting business approval of ESFR questions.' }],
    testFixtures: [],
  },
  {
    id: 'internal-survey-report', kind: 'OutputTemplate', name: 'Internal survey report', owner: 'RE reporting owner',
    status: 'Published', currentVersion: 2, businessApproved: true, wordingApproved: true,
    applicability: ['Internal'], publicationMode: 'Reviewed configuration',
    versions: [
      { version: 2, status: 'Published', publishedAt: '2026-02-10', publishedBy: 'u-priya', hash: '7d865e95…4e2c', changeSummary: 'Conditional output rule for fire pump No.' },
      { version: 1, status: 'Retired', publishedAt: '2024-02-11', publishedBy: 'u-priya', hash: '5feceb66…b917', changeSummary: 'Initial published version.' },
    ],
    testFixtures: ['No versus blank'],
  },
  {
    id: 'customer-confirmation-letter', kind: 'OutputTemplate', name: 'Customer confirmation letter', owner: 'RE reporting owner',
    status: 'Published', currentVersion: 1, businessApproved: true, wordingApproved: true,
    applicability: ['Customer'], publicationMode: 'Reviewed configuration',
    versions: [{ version: 1, status: 'Published', publishedAt: '2025-05-20', publishedBy: 'u-priya', hash: '6b86b273…5a3d', changeSummary: 'Initial published version.' }],
    testFixtures: [],
  },
  {
    id: 'housekeeping-review', kind: 'RecommendationWording', name: 'Material-handling housekeeping review', owner: 'RE technical owner',
    status: 'Published', currentVersion: 1, businessApproved: true, wordingApproved: true,
    applicability: ['Property', 'General Liability'], publicationMode: 'Governed wording',
    versions: [{ version: 1, status: 'Published', publishedAt: '2025-01-15', publishedBy: 'u-priya', hash: '4e0740…9d31', changeSummary: 'Initial published wording.' }],
    testFixtures: [],
  },
  {
    id: 'sprinkler-obstruction', kind: 'RecommendationWording', name: 'Sprinkler obstruction clearance', owner: 'RE technical owner',
    status: 'Published', currentVersion: 2, businessApproved: true, wordingApproved: true,
    applicability: ['Property'], publicationMode: 'Governed wording',
    versions: [
      { version: 2, status: 'Published', publishedAt: '2026-03-30', publishedBy: 'u-priya', hash: 'ef2d127…c0a1', changeSummary: 'Clarified clearance measurement wording.' },
      { version: 1, status: 'Retired', publishedAt: '2024-03-30', publishedBy: 'u-priya', hash: 'b1fdb9d…7712', changeSummary: 'Initial published wording.' },
    ],
    testFixtures: [],
  },
  {
    id: 'forklift-inspection', kind: 'RecommendationWording', name: 'Powered industrial truck inspection', owner: 'RE technical owner',
    status: 'Draft', currentVersion: 1, businessApproved: false, wordingApproved: false,
    applicability: ['Workers Compensation'], publicationMode: 'Governed wording',
    versions: [{ version: 1, status: 'Draft', publishedAt: null, publishedBy: null, hash: '—', changeSummary: 'Customer-facing wording approval outstanding.' }],
    testFixtures: [],
  },
];

/* ------------------------------------------------------------------ *
 * Requests, package revisions, surveys
 * ------------------------------------------------------------------ */

export const REQUESTS = [
  {
    id: 'REQ-1042', accountId: 'ACCT-100', siteIds: ['SITE-01'], customerOrganizationId: 'ORG-HARBOR',
    origin: 'Underwriter', requesterId: 'u-ellen', serviceType: 'Property survey', priority: 'Standard',
    purpose: 'Assess property protection and material-handling exposures ahead of renewal.',
    background: 'Prior visit 2024-09-19. Loading area reconfigured since the last survey.',
    state: 'InProgress', requestedDate: '2026-10-02', committedDate: '2026-10-02',
    createdAt: '2026-09-08', assigneeId: 'u-dana', accountableOwnerId: 'u-priya',
    packageRevision: 1, surveyId: 'SUR-1042', visitId: 'VISIT-01', rowVersion: '0x0000000000017A11',
  },
  {
    id: 'REQ-1043', accountId: 'ACCT-100', siteIds: ['SITE-02'], customerOrganizationId: 'ORG-HARBOR',
    origin: 'Underwriter', requesterId: 'u-ellen', serviceType: 'Property survey', priority: 'Expedite',
    purpose: 'New storage arrangement reported at Eastport; confirm protection adequacy.',
    background: 'Coverage refreshed 2026-09-21 from UWWB sample.',
    state: 'Submitted', requestedDate: '2026-10-09', committedDate: null,
    createdAt: '2026-09-18', assigneeId: null, accountableOwnerId: null,
    packageRevision: 1, surveyId: null, visitId: null, rowVersion: '0x0000000000017A2F',
  },
  {
    id: 'REQ-1044', accountId: 'ACCT-200', siteIds: ['SITE-04'], customerOrganizationId: 'ORG-CASCADE',
    origin: 'ServicePlan', requesterId: 'u-tom', serviceType: 'Property survey', priority: 'Standard',
    purpose: 'Annual service plan visit for the Tacoma cold store.',
    background: 'Linked to plan PLAN-2026-CASCADE objective OBJ-20.',
    state: 'Assigned', requestedDate: '2026-10-16', committedDate: '2026-10-16',
    createdAt: '2026-09-12', assigneeId: 'u-marcus', accountableOwnerId: 'u-priya',
    packageRevision: 2, surveyId: 'SUR-1044', visitId: 'VISIT-02', rowVersion: '0x0000000000017A44',
  },
  {
    id: 'REQ-1045', accountId: 'ACCT-100', siteIds: ['SITE-03'], customerOrganizationId: 'ORG-HARBOR',
    origin: 'Engineer', requesterId: 'u-dana', serviceType: 'Property survey', priority: 'Standard',
    purpose: 'Follow-up on coatings line protection changes.',
    background: 'Engineer-initiated with self-assignment.',
    state: 'InReview', requestedDate: '2026-09-25', committedDate: '2026-09-25',
    createdAt: '2026-08-14', assigneeId: 'u-dana', accountableOwnerId: 'u-priya',
    packageRevision: 1, surveyId: 'SUR-1045', visitId: 'VISIT-03', rowVersion: '0x0000000000017A55',
  },
  {
    id: 'REQ-1046', accountId: 'ACCT-300', siteIds: ['SITE-06'], customerOrganizationId: 'ORG-NORTHGATE',
    origin: 'Underwriter', requesterId: 'u-ellen', serviceType: 'General liability survey', priority: 'Standard',
    purpose: 'Distribution centre liability exposure review.',
    background: 'Account subsequently non-renewed; released work retained.',
    state: 'Released', requestedDate: '2026-03-06', committedDate: '2026-03-06',
    createdAt: '2026-02-10', assigneeId: 'u-dana', accountableOwnerId: 'u-priya',
    packageRevision: 1, surveyId: 'SUR-1046', visitId: 'VISIT-04', rowVersion: '0x0000000000017A61',
  },
  {
    id: 'REQ-1047', accountId: 'ACCT-200', siteIds: ['SITE-05'], customerOrganizationId: 'ORG-CASCADE',
    origin: 'Manager', requesterId: 'u-priya', serviceType: 'Property survey', priority: 'Standard',
    purpose: 'First survey of the Spokane cross-dock.',
    background: 'Site never visited. Scope still being composed.',
    state: 'Draft', requestedDate: '2026-11-06', committedDate: null,
    createdAt: '2026-09-20', assigneeId: null, accountableOwnerId: null,
    packageRevision: 1, surveyId: null, visitId: null, rowVersion: '0x0000000000017A70',
  },
  {
    id: 'REQ-1048', accountId: 'ACCT-100', siteIds: ['SITE-01'], customerOrganizationId: 'ORG-HARBOR',
    origin: 'Coordinator', requesterId: 'u-tom', serviceType: 'Vendor property survey', priority: 'Standard',
    purpose: 'Vendor-performed boiler and pressure vessel walkthrough.',
    background: 'Assigned to Meridian Loss Control; internal consultant retains review.',
    state: 'VendorSubmitted', requestedDate: '2026-09-30', committedDate: '2026-09-30',
    createdAt: '2026-08-28', assigneeId: 'u-grant', accountableOwnerId: 'u-dana',
    packageRevision: 1, surveyId: 'SUR-1048', visitId: null, rowVersion: '0x0000000000017A83',
  },
  {
    id: 'REQ-0988', accountId: 'ACCT-100', siteIds: ['SITE-01'], customerOrganizationId: 'ORG-HARBOR',
    origin: 'Underwriter', requesterId: 'u-ellen', serviceType: 'Property survey', priority: 'Standard',
    purpose: 'Prior-year property survey for the Riverside plant.',
    background: 'Historical source available for carry-forward.',
    state: 'Closed', requestedDate: '2024-09-19', committedDate: '2024-09-19',
    createdAt: '2024-08-01', assigneeId: 'u-dana', accountableOwnerId: 'u-priya',
    packageRevision: 1, surveyId: 'SUR-0988', visitId: null, rowVersion: '0x0000000000012C04',
  },
];

export const PACKAGE_REVISIONS = {
  'REQ-1042': [
    {
      revision: 1, state: 'Pinned', createdAt: '2026-09-08', createdBy: 'u-ellen', reason: 'Initial submission', hash: 'a3f1…9c02',
      components: [
        { id: 'PKG-1042-A', type: 'PrimaryTemplate', templateId: 'property-standard', templateVersion: 3, siteId: 'SITE-01', order: 1 },
        { id: 'PKG-1042-B', type: 'SupplementalTemplate', templateId: 'ergonomics', templateVersion: 1, siteId: 'SITE-01', order: 2 },
        { id: 'PKG-1042-C', type: 'RequestQuestionSet', templateId: null, templateVersion: null, siteId: 'SITE-01', order: 3 },
      ],
      additionalQuestions: [
        { id: 'Q-1042-01', text: 'What changed in the loading area since the last visit?', type: 'longText', respondent: 'Engineer', audience: 'Internal', required: true },
        { id: 'Q-1042-02', text: 'Confirm current shift pattern for the fabrication area.', type: 'shortText', respondent: 'Customer', audience: 'Shared', required: false },
      ],
    },
  ],
  'REQ-1044': [
    {
      revision: 2, state: 'Pinned', createdAt: '2026-09-15', createdBy: 'u-tom', reason: 'Added cold-storage questions after coordinator review', hash: 'bb71…4410',
      components: [
        { id: 'PKG-1044-A', type: 'PrimaryTemplate', templateId: 'property-standard', templateVersion: 3, siteId: 'SITE-04', order: 1 },
        { id: 'PKG-1044-B', type: 'RequestQuestionSet', templateId: null, templateVersion: null, siteId: 'SITE-04', order: 2 },
      ],
      additionalQuestions: [
        { id: 'Q-1044-01', text: 'Record ESFR design density observed at the racking.', type: 'shortText', respondent: 'Engineer', audience: 'Internal', required: true },
      ],
    },
    {
      revision: 1, state: 'Superseded', createdAt: '2026-09-12', createdBy: 'u-tom', reason: 'Initial submission', hash: '19ca…7f83',
      components: [
        { id: 'PKG-1044-A0', type: 'PrimaryTemplate', templateId: 'property-standard', templateVersion: 3, siteId: 'SITE-04', order: 1 },
      ],
      additionalQuestions: [],
    },
  ],
  'REQ-1045': [
    {
      revision: 1, state: 'Pinned', createdAt: '2026-08-14', createdBy: 'u-dana', reason: 'Initial submission', hash: '5d20…1ab7',
      components: [
        { id: 'PKG-1045-A', type: 'PrimaryTemplate', templateId: 'property-standard', templateVersion: 3, siteId: 'SITE-03', order: 1 },
      ],
      additionalQuestions: [],
    },
  ],
  'REQ-1047': [
    {
      revision: 1, state: 'Draft', createdAt: '2026-09-20', createdBy: 'u-priya', reason: 'Scope in composition', hash: '—',
      components: [
        { id: 'PKG-1047-A', type: 'PrimaryTemplate', templateId: 'property-standard', templateVersion: 3, siteId: 'SITE-05', order: 1 },
      ],
      additionalQuestions: [],
    },
  ],
};

/* Survey instances and response sets (F05). */
export const SURVEYS = {
  'SUR-1042': {
    id: 'SUR-1042', requestId: 'REQ-1042', siteId: 'SITE-01', templateId: 'property-standard', templateVersion: 3,
    packageRevision: 1, state: 'InProgress', respondentId: 'u-dana', audience: 'Internal',
    currentRevision: 2, saveState: 'Saved', lastSavedAt: '2026-09-21T15:42:00Z', submitted: false,
    answers: {
      occupancyDescription: 'Metal fabrication with powder-coat finishing in a separate bay.',
      yearBuilt: '1983',
      firePump: 'No',
      firePumpComment: 'City supply only; no on-site pump. Engineer judgment required on supply adequacy.',
      sprinklerCoverage: 'Partial',
      hotWorkPermit: 'Yes',
      housekeepingRating: 'Needs attention',
      loadingAreaChanges: 'Loading area re-racked in Q2 2026; two aisles narrowed to 8 ft.',
      shiftPattern: '',
    },
    buildings: [
      { id: 'BLDG-1', name: 'Main building', buildingValue: 2500000, contentsValue: 900000, businessInterruptionValue: 600000 },
      { id: 'BLDG-2', name: 'Finishing annex', buildingValue: 740000, contentsValue: 310000, businessInterruptionValue: 180000 },
    ],
    revisions: [
      { revision: 2, state: 'Draft', savedAt: '2026-09-21T15:42:00Z', by: 'u-dana', note: 'Autosaved draft' },
      { revision: 1, state: 'Draft', savedAt: '2026-09-19T11:05:00Z', by: 'u-dana', note: 'Pre-visit preparation' },
    ],
  },
  'SUR-1044': {
    id: 'SUR-1044', requestId: 'REQ-1044', siteId: 'SITE-04', templateId: 'property-standard', templateVersion: 3,
    packageRevision: 2, state: 'NotStarted', respondentId: 'u-marcus', audience: 'Internal',
    currentRevision: 0, saveState: 'NotStarted', lastSavedAt: null, submitted: false,
    answers: {}, buildings: [], revisions: [],
  },
  'SUR-1045': {
    id: 'SUR-1045', requestId: 'REQ-1045', siteId: 'SITE-03', templateId: 'property-standard', templateVersion: 3,
    packageRevision: 1, state: 'Submitted', respondentId: 'u-dana', audience: 'Internal',
    currentRevision: 3, saveState: 'Submitted', lastSavedAt: '2026-09-17T18:20:00Z', submitted: true,
    answers: {
      occupancyDescription: 'Coatings application line with solvent storage in a detached store.',
      yearBuilt: '1972',
      firePump: 'Yes',
      firePumpComment: 'Electric pump tested 2026-07; churn test record reviewed.',
      sprinklerCoverage: 'Full',
      hotWorkPermit: 'Yes',
      housekeepingRating: 'Satisfactory',
      loadingAreaChanges: 'No change since the 2025 visit.',
      shiftPattern: 'Two shifts, Monday to Friday.',
    },
    buildings: [{ id: 'BLDG-1', name: 'Line 4 building', buildingValue: 1850000, contentsValue: 1200000, businessInterruptionValue: 950000 }],
    revisions: [
      { revision: 3, state: 'Submitted', savedAt: '2026-09-17T18:20:00Z', by: 'u-dana', note: 'Resubmitted after corrections' },
      { revision: 2, state: 'Returned', savedAt: '2026-09-16T09:10:00Z', by: 'u-priya', note: 'Returned: solvent store values missing' },
      { revision: 1, state: 'Submitted', savedAt: '2026-09-15T16:55:00Z', by: 'u-dana', note: 'First submission' },
    ],
  },
  'SUR-1046': {
    id: 'SUR-1046', requestId: 'REQ-1046', siteId: 'SITE-06', templateId: 'property-standard', templateVersion: 2,
    packageRevision: 1, state: 'Released', respondentId: 'u-dana', audience: 'Internal',
    currentRevision: 2, saveState: 'Released', lastSavedAt: '2026-03-11T14:02:00Z', submitted: true,
    answers: {
      occupancyDescription: 'Retail distribution with high-piled storage.',
      yearBuilt: '2004', firePump: 'Yes', firePumpComment: 'Diesel pump, weekly churn recorded.',
      sprinklerCoverage: 'Full', hotWorkPermit: 'No', housekeepingRating: 'Good',
      loadingAreaChanges: 'Dock levellers replaced 2025.', shiftPattern: 'Three shifts.',
    },
    buildings: [{ id: 'BLDG-1', name: 'DC 7', buildingValue: 12400000, contentsValue: 8900000, businessInterruptionValue: 3100000 }],
    revisions: [{ revision: 2, state: 'Released', savedAt: '2026-03-11T14:02:00Z', by: 'u-dana', note: 'Approved and released' }],
  },
  'SUR-1048': {
    id: 'SUR-1048', requestId: 'REQ-1048', siteId: 'SITE-01', templateId: 'property-standard', templateVersion: 3,
    packageRevision: 1, state: 'VendorSubmitted', respondentId: 'u-grant', audience: 'Vendor',
    currentRevision: 1, saveState: 'Submitted', lastSavedAt: '2026-09-19T20:30:00Z', submitted: true,
    answers: {
      occupancyDescription: 'Boiler house and compressed air plant.',
      yearBuilt: '1983', firePump: 'No', firePumpComment: 'Not applicable to this scope.',
      sprinklerCoverage: 'Partial', hotWorkPermit: 'Yes', housekeepingRating: 'Satisfactory',
      loadingAreaChanges: 'Out of scope for this vendor visit.', shiftPattern: '',
    },
    buildings: [{ id: 'BLDG-1', name: 'Boiler house', buildingValue: 410000, contentsValue: 260000, businessInterruptionValue: 0 }],
    revisions: [{ revision: 1, state: 'Submitted', savedAt: '2026-09-19T20:30:00Z', by: 'u-grant', note: 'Vendor submission awaiting internal handoff' }],
  },
  'SUR-0988': {
    id: 'SUR-0988', requestId: 'REQ-0988', siteId: 'SITE-01', templateId: 'property-standard', templateVersion: 1,
    packageRevision: 1, state: 'Locked', respondentId: 'u-dana', audience: 'Internal',
    currentRevision: 4, saveState: 'Locked', lastSavedAt: '2024-09-30T13:00:00Z', submitted: true,
    answers: {
      occupancyDescription: 'Metal fabrication; finishing performed off site in 2024.',
      yearBuilt: '1983', firePump: 'No', firePumpComment: 'City supply only.',
      sprinklerCoverage: 'Partial', hotWorkPermit: 'Yes', housekeepingRating: 'Satisfactory',
      loadingAreaChanges: 'Original rack layout.', shiftPattern: 'Two shifts.',
    },
    buildings: [{ id: 'BLDG-1', name: 'Main building', buildingValue: 2250000, contentsValue: 800000, businessInterruptionValue: 540000 }],
    revisions: [{ revision: 4, state: 'Locked', savedAt: '2024-09-30T13:00:00Z', by: 'u-dana', note: 'Released and locked' }],
  },
};

/* Section tree used by the survey workspace (F05 nested navigation). */
export const SURVEY_SECTIONS = [
  {
    id: 'sec-site', title: 'Site and occupancy', fields: [
      { id: 'occupancyDescription', label: 'Occupancy description', type: 'textarea', required: true },
      { id: 'yearBuilt', label: 'Year built', type: 'text', required: false },
      { id: 'shiftPattern', label: 'Shift pattern', type: 'text', required: false, respondent: 'Customer' },
    ],
  },
  {
    id: 'sec-values', title: 'Building values', repeating: true, repeatLabel: 'building', fields: [],
  },
  {
    id: 'sec-protection', title: 'Fire protection', fields: [
      { id: 'firePump', label: 'Fire pump present', type: 'yesno', required: true, commentField: 'firePumpComment', commentRequiredWhen: 'No' },
      { id: 'sprinklerCoverage', label: 'Sprinkler coverage', type: 'select', required: true, options: ['Full', 'Partial', 'None'] },
    ],
  },
  {
    id: 'sec-operations', title: 'Operations and housekeeping', fields: [
      { id: 'hotWorkPermit', label: 'Hot work permit system in use', type: 'yesno', required: true },
      { id: 'housekeepingRating', label: 'Housekeeping', type: 'select', required: true, options: ['Good', 'Satisfactory', 'Needs attention'] },
    ],
  },
  {
    id: 'sec-questions', title: 'Request-specific questions', requestQuestions: true, fields: [],
  },
];

/* ------------------------------------------------------------------ *
 * Work — tasks, assignments, visits
 * ------------------------------------------------------------------ */

export const TASKS = [
  { id: 'TASK-2101', requestId: 'REQ-1042', title: 'Confirm site contact and access requirements', ownerId: 'u-dana', type: 'Preparation', dueDate: '2026-09-23', status: 'Complete', dependencies: [], description: 'Call the site contact, confirm PPE and gate access for the scheduled visit.' },
  { id: 'TASK-2102', requestId: 'REQ-1042', title: 'Complete property survey draft', ownerId: 'u-dana', type: 'Survey', dueDate: '2026-09-29', status: 'InProgress', dependencies: ['TASK-2101'], description: 'Finish the pinned property package including repeating building values.' },
  { id: 'TASK-2103', requestId: 'REQ-1042', title: 'Request loading area photographs from the customer', ownerId: 'u-dana', type: 'Information request', dueDate: '2026-09-26', status: 'Blocked', dependencies: ['TASK-2101'], description: 'Targeted information request INFO-3301 is outstanding with the site contact.' },
  { id: 'TASK-2104', requestId: 'REQ-1044', title: 'Confirm coverage is active before the recurring visit', ownerId: 'u-tom', type: 'Coverage check', dueDate: '2026-09-25', status: 'NotStarted', dependencies: [], description: 'Recurring work must not proceed silently for an inactive account.' },
  { id: 'TASK-2105', requestId: 'REQ-1045', title: 'Manager review of submitted revision 3', ownerId: 'u-priya', type: 'Review', dueDate: '2026-09-24', status: 'InProgress', dependencies: [], description: 'Review response revision 3 and either return with a reason or approve.' },
  { id: 'TASK-2106', requestId: 'REQ-1048', title: 'Internal handoff of the vendor contribution', ownerId: 'u-dana', type: 'Handoff', dueDate: '2026-09-25', status: 'NotStarted', dependencies: [], description: 'Take over review and letter preparation; vendor authorship is retained.' },
  { id: 'TASK-2107', requestId: null, title: 'Refresh the Harbor account service instructions', ownerId: 'u-tom', type: 'Account admin', dueDate: '2026-09-30', status: 'NotStarted', dependencies: [], description: 'RE-only instruction revision after the coordinator change.' },
];

export const ASSIGNMENTS = [
  { id: 'ASG-01', requestId: 'REQ-1042', assigneeId: 'u-dana', assignedById: 'u-priya', assignedAt: '2026-09-09', status: 'Active', reason: 'Property skill and Mid-Atlantic territory' },
  { id: 'ASG-02', requestId: 'REQ-1044', assigneeId: 'u-marcus', assignedById: 'u-priya', assignedAt: '2026-09-13', status: 'Active', reason: 'Pacific Northwest coverage' },
  { id: 'ASG-03', requestId: 'REQ-1045', assigneeId: 'u-dana', assignedById: 'u-dana', assignedAt: '2026-08-14', status: 'Active', reason: 'Engineer-initiated self-assignment' },
  { id: 'ASG-04', requestId: 'REQ-1048', assigneeId: 'u-grant', assignedById: 'u-tom', assignedAt: '2026-08-29', status: 'Active', reason: 'Vendor scope — boiler and pressure vessel' },
  { id: 'ASG-05', requestId: 'REQ-1046', assigneeId: 'u-dana', assignedById: 'u-priya', assignedAt: '2026-02-12', status: 'Closed', reason: 'Completed and released' },
];

export const VISITS = [
  { id: 'VISIT-01', requestId: 'REQ-1042', siteId: 'SITE-01', start: '2026-09-24T09:00', end: '2026-09-24T15:00', timeZone: 'America/New_York', status: 'Scheduled', engineerId: 'u-dana', participants: ['CONTACT-01'] },
  { id: 'VISIT-02', requestId: 'REQ-1044', siteId: 'SITE-04', start: '2026-09-29T08:30', end: '2026-09-29T13:30', timeZone: 'America/Los_Angeles', status: 'Scheduled', engineerId: 'u-marcus', participants: ['CONTACT-04'] },
  { id: 'VISIT-03', requestId: 'REQ-1045', siteId: 'SITE-03', start: '2026-09-11T09:00', end: '2026-09-11T14:00', timeZone: 'America/New_York', status: 'Completed', engineerId: 'u-dana', participants: ['CONTACT-03'] },
  { id: 'VISIT-04', requestId: 'REQ-1046', siteId: 'SITE-06', start: '2026-03-04T10:00', end: '2026-03-04T15:00', timeZone: 'America/New_York', status: 'Completed', engineerId: 'u-dana', participants: ['CONTACT-05'] },
  { id: 'VISIT-05', requestId: 'REQ-1042', siteId: 'SITE-01', start: '2026-09-26T13:00', end: '2026-09-26T16:00', timeZone: 'America/New_York', status: 'Proposed', engineerId: 'u-dana', participants: [] },
];

export const ENGINEER_PROFILES = [
  { principalId: 'u-dana', skills: ['Property', 'Fire protection'], coverage: 'Mid-Atlantic', active: true, openRequests: 3, scheduledVisits: 2, capacityNote: 'At target load' },
  { principalId: 'u-marcus', skills: ['Casualty', 'Ergonomics', 'Fleet'], coverage: 'Pacific Northwest', active: true, openRequests: 1, scheduledVisits: 1, capacityNote: 'Capacity available' },
  { principalId: 'u-grant', skills: ['Property'], coverage: 'Mid-Atlantic (vendor)', active: true, openRequests: 1, scheduledVisits: 0, capacityNote: 'Vendor — assignment bound' },
];

/* ------------------------------------------------------------------ *
 * Recommendations (F07)
 * ------------------------------------------------------------------ */

export const RECOMMENDATIONS = [
  {
    id: 'REC-2026-001', accountId: 'ACCT-100', siteId: 'SITE-01', surveyLinks: ['SUR-0988', 'SUR-1042'],
    templateId: 'housekeeping-review', templateVersion: 1, title: 'Review the material-handling area',
    issuedWording: 'Illustrative governed wording only; not approved risk advice. Re-establish and maintain clear aisle widths in the material-handling area, and remove accumulated combustible packaging at the end of each shift.',
    status: 'Open', severity: 'To be assessed', createdAt: '2024-09-19', dueDate: '2026-10-18',
    ownerId: 'u-dana', issuedRevision: 2, carriedForwardFrom: 'SUR-0988',
    followUp: { dayOffsets: [45, 90], sendPolicy: 'Unapproved; draft only', excludeCompleted: true },
    revisions: [
      { revision: 2, issuedAt: '2026-09-19', by: 'u-dana', reason: 'Re-issued with the 2026 survey', wordingHash: 'c91f…22a7' },
      { revision: 1, issuedAt: '2024-09-30', by: 'u-dana', reason: 'Original issue', wordingHash: 'a012…7e55' },
    ],
    complianceEvents: [
      { at: '2026-09-20', actor: 'u-nate', actorAudience: 'Customer', type: 'CustomerResponse', detail: 'Aisle marking scheduled for the week of 6 October.' },
      { at: '2026-09-21', actor: 'u-dana', actorAudience: 'Internal', type: 'StaffNote', detail: 'Response received; verification pending the site visit.' },
    ],
  },
  {
    id: 'REC-2026-002', accountId: 'ACCT-100', siteId: 'SITE-01', surveyLinks: ['SUR-1048'],
    templateId: 'sprinkler-obstruction', templateVersion: 2, title: 'Clear sprinkler obstruction above the boiler house racking',
    issuedWording: 'Illustrative governed wording only; not approved risk advice. Maintain the required clearance between stored material and sprinkler deflectors above the boiler house racking.',
    status: 'Open', severity: 'To be assessed', createdAt: '2026-09-19', dueDate: '2026-11-03',
    ownerId: 'u-dana', issuedRevision: 1, carriedForwardFrom: null, originalAuthor: 'u-grant',
    followUp: { dayOffsets: [45], sendPolicy: 'Unapproved; draft only', excludeCompleted: true },
    revisions: [{ revision: 1, issuedAt: '2026-09-19', by: 'u-grant', reason: 'Vendor original', wordingHash: 'd7b3…901c' }],
    complianceEvents: [],
  },
  {
    id: 'REC-2026-003', accountId: 'ACCT-100', siteId: 'SITE-03', surveyLinks: ['SUR-1045'],
    templateId: 'housekeeping-review', templateVersion: 1, title: 'Solvent store segregation at Line 4',
    issuedWording: 'Illustrative governed wording only; not approved risk advice. Confirm that the detached solvent store segregation and ventilation arrangements match the documented design.',
    status: 'PendingReview', severity: 'To be assessed', createdAt: '2026-09-15', dueDate: '2026-10-30',
    ownerId: 'u-dana', issuedRevision: 1, carriedForwardFrom: null,
    followUp: { dayOffsets: [45, 90], sendPolicy: 'Unapproved; draft only', excludeCompleted: true },
    revisions: [{ revision: 1, issuedAt: '2026-09-15', by: 'u-dana', reason: 'Draft with submitted revision 3', wordingHash: '4f8a…6612' }],
    complianceEvents: [],
  },
  {
    id: 'REC-2026-004', accountId: 'ACCT-200', siteId: 'SITE-04', surveyLinks: [],
    templateId: 'sprinkler-obstruction', templateVersion: 2, title: 'Rack storage height versus ESFR design',
    issuedWording: 'Illustrative governed wording only; not approved risk advice. Keep the top of storage below the design height assumed by the installed ESFR protection.',
    status: 'Open', severity: 'To be assessed', createdAt: '2025-04-22', dueDate: '2026-09-30',
    ownerId: 'u-marcus', issuedRevision: 1, carriedForwardFrom: null,
    followUp: { dayOffsets: [45, 90], sendPolicy: 'Unapproved; draft only', excludeCompleted: true },
    revisions: [{ revision: 1, issuedAt: '2025-04-30', by: 'u-marcus', reason: 'Original issue', wordingHash: '8812…40aa' }],
    complianceEvents: [{ at: '2026-06-02', actor: 'u-sofia', actorAudience: 'Customer', type: 'CustomerResponse', detail: 'Storage plan under review with the operations team.' }],
  },
  {
    id: 'REC-2026-005', accountId: 'ACCT-200', siteId: 'SITE-04', surveyLinks: [],
    templateId: 'housekeeping-review', templateVersion: 1, title: 'Dock area housekeeping programme',
    issuedWording: 'Illustrative governed wording only; not approved risk advice. Formalise the dock area housekeeping schedule and record completion.',
    status: 'Completed', severity: 'To be assessed', createdAt: '2025-04-22', dueDate: '2026-04-30',
    ownerId: 'u-marcus', issuedRevision: 1, carriedForwardFrom: null, completedAt: '2026-05-14',
    followUp: { dayOffsets: [45], sendPolicy: 'Unapproved; draft only', excludeCompleted: true },
    revisions: [{ revision: 1, issuedAt: '2025-04-30', by: 'u-marcus', reason: 'Original issue', wordingHash: '2af9…11b3' }],
    complianceEvents: [
      { at: '2026-05-02', actor: 'u-sofia', actorAudience: 'Customer', type: 'CustomerResponse', detail: 'Schedule published and posted at both dock offices.' },
      { at: '2026-05-14', actor: 'u-marcus', actorAudience: 'Internal', type: 'StaffVerification', detail: 'Evidence reviewed; staff-controlled closure recorded.' },
    ],
  },
  {
    id: 'REC-2026-006', accountId: 'ACCT-300', siteId: 'SITE-06', surveyLinks: ['SUR-1046'],
    templateId: 'housekeeping-review', templateVersion: 1, title: 'Pallet storage in the dispatch lane',
    issuedWording: 'Illustrative governed wording only; not approved risk advice. Keep the dispatch lane free of stored pallets outside marked areas.',
    status: 'Open', severity: 'To be assessed', createdAt: '2026-03-11', dueDate: '2026-06-11',
    ownerId: 'u-dana', issuedRevision: 1, carriedForwardFrom: null,
    followUp: { dayOffsets: [45, 90], sendPolicy: 'Unapproved; draft only', excludeCompleted: true },
    revisions: [{ revision: 1, issuedAt: '2026-03-11', by: 'u-dana', reason: 'Original issue', wordingHash: '90fe…7db2' }],
    complianceEvents: [],
  },
  {
    id: 'REC-2024-011', accountId: 'ACCT-100', siteId: 'SITE-01', surveyLinks: ['SUR-0988'],
    templateId: 'housekeeping-review', templateVersion: 1, title: 'Battery charging area ventilation',
    issuedWording: 'Illustrative governed wording only; not approved risk advice. Confirm mechanical ventilation at the forklift battery charging area.',
    status: 'Completed', severity: 'To be assessed', createdAt: '2024-09-19', dueDate: '2025-01-15',
    ownerId: 'u-dana', issuedRevision: 1, carriedForwardFrom: null, completedAt: '2025-01-10',
    followUp: { dayOffsets: [45], sendPolicy: 'Unapproved; draft only', excludeCompleted: true },
    revisions: [{ revision: 1, issuedAt: '2024-09-30', by: 'u-dana', reason: 'Original issue', wordingHash: '6c11…bb40' }],
    complianceEvents: [{ at: '2025-01-10', actor: 'u-dana', actorAudience: 'Internal', type: 'StaffVerification', detail: 'Verified at follow-up visit.' }],
  },
];

/* ------------------------------------------------------------------ *
 * Evidence (F06)
 * ------------------------------------------------------------------ */

export const EVIDENCE = [
  {
    id: 'EVID-01', requestId: 'REQ-1042', context: 'RecommendationFinding', recommendationId: 'REC-2026-001',
    fileName: 'loading-area-aisle.jpg', classification: 'REOnly', audience: 'Internal',
    versions: [
      { version: 2, uploadedBy: 'u-dana', uploadedAt: '2026-09-21T15:10:00Z', scanStatus: 'Clean', sizeKb: 842, hash: 'f1e2…90ab', note: 'Replacement after re-shoot' },
      { version: 1, uploadedBy: 'u-dana', uploadedAt: '2026-09-19T12:02:00Z', scanStatus: 'Clean', sizeKb: 799, hash: 'aa31…4c77', note: 'Original' },
    ],
  },
  {
    id: 'EVID-02', requestId: 'REQ-1042', context: 'CustomerMessageAttachment', informationRequestId: 'INFO-3301',
    fileName: 'rack-layout-2026.pdf', classification: 'Shared', audience: 'Shared',
    versions: [{ version: 1, uploadedBy: 'u-nate', uploadedAt: '2026-09-20T17:45:00Z', scanStatus: 'Pending', sizeKb: 1204, hash: '—', note: 'Customer contribution awaiting scan' }],
  },
  {
    id: 'EVID-03', requestId: 'REQ-1045', context: 'ReportAttachment', recommendationId: null,
    fileName: 'line4-protection-plan.pdf', classification: 'Internal', audience: 'Internal',
    versions: [{ version: 1, uploadedBy: 'u-dana', uploadedAt: '2026-09-15T14:30:00Z', scanStatus: 'Clean', sizeKb: 2390, hash: 'bd77…1e05', note: 'Attached to the internal report package' }],
  },
  {
    id: 'EVID-04', requestId: 'REQ-1048', context: 'VendorReport', recommendationId: 'REC-2026-002',
    fileName: 'meridian-boiler-report.pdf', classification: 'Internal', audience: 'Internal',
    versions: [{ version: 1, uploadedBy: 'u-grant', uploadedAt: '2026-09-19T20:28:00Z', scanStatus: 'Clean', sizeKb: 3105, hash: 'c44a…88f1', note: 'Vendor original; authorship retained' }],
  },
  {
    id: 'EVID-05', requestId: 'REQ-1042', context: 'RecommendationFinding', recommendationId: 'REC-2026-001',
    fileName: 'suspicious-sample.zip', classification: 'REOnly', audience: 'Internal',
    versions: [{ version: 1, uploadedBy: 'u-dana', uploadedAt: '2026-09-21T16:00:00Z', scanStatus: 'Rejected', sizeKb: 74, hash: '—', note: 'Sample quarantine state for demonstration' }],
  },
  {
    id: 'EVID-06', requestId: 'REQ-1046', context: 'ReportAttachment', recommendationId: null,
    fileName: 'dc7-site-plan.pdf', classification: 'Customer', audience: 'Customer',
    versions: [{ version: 1, uploadedBy: 'u-dana', uploadedAt: '2026-03-09T10:15:00Z', scanStatus: 'Clean', sizeKb: 1870, hash: 'e0aa…3311', note: 'Released with the customer letter' }],
  },
];

/* ------------------------------------------------------------------ *
 * Review, release, correspondence (F08, F09)
 * ------------------------------------------------------------------ */

export const REVIEW_DECISIONS = [
  { id: 'REV-01', requestId: 'REQ-1045', responseRevision: 1, decision: 'Returned', reviewerId: 'u-priya', at: '2026-09-16', reason: 'Solvent store values were missing from the repeating building section.' },
  { id: 'REV-02', requestId: 'REQ-1046', responseRevision: 2, decision: 'Approved', reviewerId: 'u-priya', at: '2026-03-10', reason: 'Approved for internal and customer release.' },
];

export const RELEASES = [
  {
    id: 'REL-1046-1', requestId: 'REQ-1046', responseRevision: 2, status: 'Published', audience: 'CustomerAndInternal',
    publishedBy: 'u-priya', publishedAt: '2026-03-11T14:02:00Z', snapshotImmutable: true,
    artifacts: [
      { id: 'DOC-1046-INT', type: 'InternalSurveyReport', version: 1, audience: 'Internal', templateId: 'internal-survey-report', templateVersion: 2 },
      { id: 'DOC-1046-LTR', type: 'CustomerConfirmationLetter', version: 1, audience: 'Customer', templateId: 'customer-confirmation-letter', templateVersion: 1 },
    ],
    liveFollowUpAllowed: ['RecommendationStatus', 'MessageEvidence'],
    history: [{ at: '2026-03-11T14:02:00Z', actor: 'u-priya', event: 'Published' }],
  },
  {
    id: 'REL-1045-D', requestId: 'REQ-1045', responseRevision: 3, status: 'Draft', audience: 'UnderwritingInternal',
    publishedBy: null, publishedAt: null, snapshotImmutable: true,
    artifacts: [{ id: 'DOC-1045-INT', type: 'InternalSurveyReport', version: 1, audience: 'Internal', templateId: 'internal-survey-report', templateVersion: 2 }],
    liveFollowUpAllowed: ['RecommendationStatus', 'MessageEvidence'],
    history: [],
  },
];

export const DISTRIBUTIONS = [
  {
    id: 'SEND-1046-01', requestId: 'REQ-1046', releaseId: 'REL-1046-1', status: 'Sent',
    documents: [{ id: 'DOC-1046-LTR', version: 1, type: 'CustomerConfirmationLetter', audience: 'Customer' }],
    recipients: [{ email: 'renee.dubois@example.invalid', audience: 'Customer', role: 'DC manager' }],
    approvedBy: 'u-priya', sentAt: '2026-03-11T15:20:00Z', transport: 'Simulation only', idempotencyKey: 'DEMO-SEND-1046-01',
  },
  {
    id: 'SEND-1045-01', requestId: 'REQ-1045', releaseId: 'REL-1045-D', status: 'Draft',
    documents: [{ id: 'DOC-1045-INT', version: 1, type: 'InternalSurveyReport', audience: 'Internal' }],
    recipients: [{ email: 'ellen.vasquez@example.invalid', audience: 'Internal', role: 'Property underwriter' }],
    approvedBy: null, sentAt: null, transport: 'Simulation only', idempotencyKey: 'DEMO-SEND-1045-01',
  },
];

/* ------------------------------------------------------------------ *
 * Service plans and RE-only instructions (F10, F11)
 * ------------------------------------------------------------------ */

export const SERVICE_PLANS = [
  {
    id: 'PLAN-2026-HARBOR', accountId: 'ACCT-100', year: 2026, coordinatorId: 'u-tom', status: 'Active',
    distributionProfileId: 'DIST-01', customerReleaseId: 'PLANREL-2026-HARBOR-1', contactDirectory: ['CONTACT-01', 'CONTACT-02', 'CONTACT-03'],
    objectives: [
      {
        id: 'OBJ-10', siteId: 'SITE-01', description: 'Review material-handling exposures after the rack reconfiguration', ownerId: 'u-dana',
        actions: [
          { id: 'ACT-10-1', description: 'Complete property survey visit', assignedTo: 'u-dana', targetDate: '2026-10-02', actualDate: null, requestId: 'REQ-1042', visitId: 'VISIT-01', status: 'InProgress' },
          { id: 'ACT-10-2', description: 'Verify housekeeping recommendation completion', assignedTo: 'u-dana', targetDate: '2026-11-15', actualDate: null, requestId: null, visitId: null, status: 'Planned' },
        ],
      },
      {
        id: 'OBJ-11', siteId: 'SITE-03', description: 'Confirm coatings line protection changes', ownerId: 'u-dana',
        actions: [
          { id: 'ACT-11-1', description: 'Complete follow-up survey', assignedTo: 'u-dana', targetDate: '2026-09-25', actualDate: '2026-09-11', requestId: 'REQ-1045', visitId: 'VISIT-03', status: 'Complete' },
        ],
      },
    ],
    revisions: [
      { revision: 2, at: '2026-07-01', by: 'u-tom', note: 'Added the coatings line objective', customerSafe: true },
      { revision: 1, at: '2026-01-15', by: 'u-tom', note: 'Plan created for 2026', customerSafe: true },
    ],
  },
  {
    id: 'PLAN-2026-CASCADE', accountId: 'ACCT-200', year: 2026, coordinatorId: 'u-tom', status: 'Draft',
    distributionProfileId: 'DIST-02', customerReleaseId: null, contactDirectory: ['CONTACT-04'],
    objectives: [
      {
        id: 'OBJ-20', siteId: 'SITE-04', description: 'Annual cold store protection review', ownerId: 'u-marcus',
        actions: [
          { id: 'ACT-20-1', description: 'Complete annual survey visit', assignedTo: 'u-marcus', targetDate: '2026-10-16', actualDate: null, requestId: 'REQ-1044', visitId: 'VISIT-02', status: 'Planned' },
        ],
      },
      {
        id: 'OBJ-21', siteId: 'SITE-05', description: 'First survey of the Spokane cross-dock', ownerId: 'u-marcus',
        actions: [
          { id: 'ACT-21-1', description: 'Compose and submit the survey request', assignedTo: 'u-priya', targetDate: '2026-11-06', actualDate: null, requestId: 'REQ-1047', visitId: null, status: 'Planned' },
        ],
      },
    ],
    revisions: [{ revision: 1, at: '2026-08-20', by: 'u-tom', note: 'Draft plan for 2026', customerSafe: false }],
  },
  {
    id: 'PLAN-2025-HARBOR', accountId: 'ACCT-100', year: 2025, coordinatorId: 'u-tom', status: 'Closed',
    distributionProfileId: 'DIST-01', customerReleaseId: 'PLANREL-2025-HARBOR-1', contactDirectory: ['CONTACT-01'],
    objectives: [
      {
        id: 'OBJ-05', siteId: 'SITE-01', description: 'Battery charging area follow-up', ownerId: 'u-dana',
        actions: [{ id: 'ACT-05-1', description: 'Verify ventilation improvement', assignedTo: 'u-dana', targetDate: '2025-01-15', actualDate: '2025-01-10', requestId: null, visitId: null, status: 'Complete' }],
      },
    ],
    revisions: [{ revision: 1, at: '2025-01-05', by: 'u-tom', note: 'Plan created for 2025', customerSafe: true }],
  },
];

export const INSTRUCTIONS = [
  {
    id: 'INST-01', accountId: 'ACCT-100', siteId: null, classification: 'REOnly', revision: 2,
    coordinatorId: 'u-tom', updatedAt: '2026-07-02',
    text: 'Synthetic internal coordination note: confirm visit logistics with the assigned service coordinator at least five business days ahead. The plant manager prefers morning arrivals and requires an escorted walk of the finishing annex.',
    allowedRoles: ['engineer', 'manager', 'coordinator'],
    excludedAudiences: ['Underwriting', 'Marketing', 'Customer', 'Vendor'],
    revisions: [
      { revision: 2, at: '2026-07-02', by: 'u-tom', reason: 'Updated after the coordinator change' },
      { revision: 1, at: '2025-02-11', by: 'u-tom', reason: 'Original instruction' },
    ],
  },
  {
    id: 'INST-02', accountId: 'ACCT-100', siteId: 'SITE-03', classification: 'REOnly', revision: 1,
    coordinatorId: 'u-tom', updatedAt: '2026-05-18',
    text: 'Synthetic internal sensitivity note: the Line 4 supervisor should be briefed before any discussion of the solvent store with plant staff.',
    allowedRoles: ['engineer', 'manager', 'coordinator'],
    excludedAudiences: ['Underwriting', 'Marketing', 'Customer', 'Vendor'],
    revisions: [{ revision: 1, at: '2026-05-18', by: 'u-tom', reason: 'Original instruction' }],
  },
];

/* ------------------------------------------------------------------ *
 * Collaboration (F12, F15 of the API groups) — threads, info requests
 * ------------------------------------------------------------------ */

export const THREADS = [
  {
    id: 'THR-01', requestId: 'REQ-1042', audience: 'Internal', subject: 'Supply adequacy at Riverside',
    messages: [
      { id: 'MSG-01', authorId: 'u-dana', at: '2026-09-19T13:05:00Z', body: 'City supply only, no pump. I want to record judgment on supply adequacy rather than a calculated conclusion.' },
      { id: 'MSG-02', authorId: 'u-priya', at: '2026-09-19T15:40:00Z', body: 'Agreed. Record the observation and your reasoning; do not imply an automated result.' },
    ],
  },
  {
    id: 'THR-02', requestId: 'REQ-1042', audience: 'Shared', subject: 'Loading area changes',
    messages: [
      { id: 'MSG-03', authorId: 'u-dana', at: '2026-09-19T13:30:00Z', body: 'Could you share the current rack layout for the loading area before the visit?' },
      { id: 'MSG-04', authorId: 'u-nate', at: '2026-09-20T17:46:00Z', body: 'Uploaded the 2026 layout. Two aisles were narrowed in Q2.' },
    ],
  },
  {
    id: 'THR-03', requestId: 'REQ-1045', audience: 'Internal', subject: 'Return reason follow-up',
    messages: [{ id: 'MSG-05', authorId: 'u-priya', at: '2026-09-16T09:12:00Z', body: 'Returned revision 1. Add the solvent store values to the repeating section and resubmit.' }],
  },
];

export const INFORMATION_REQUESTS = [
  {
    id: 'INFO-3301', requestId: 'REQ-1042', scope: 'Question Q-1042-02 and rack layout evidence',
    recipientId: 'u-nate', recipientOrganizationId: 'ORG-HARBOR', dueDate: '2026-09-26', status: 'Responded',
    contributions: [{ id: 'CONTRIB-01', byId: 'u-nate', at: '2026-09-20T17:46:00Z', answer: 'Two shifts; third shift added at peak only.', evidenceId: 'EVID-02', staffReviewStatus: 'Pending' }],
  },
  {
    id: 'INFO-3302', requestId: 'REQ-1044', scope: 'Current storage heights at the Tacoma racking',
    recipientId: 'u-sofia', recipientOrganizationId: 'ORG-CASCADE', dueDate: '2026-09-28', status: 'Open',
    contributions: [],
  },
];

/* ------------------------------------------------------------------ *
 * Vendor work (F14)
 * ------------------------------------------------------------------ */

export const VENDOR_CONTRIBUTIONS = [
  {
    id: 'VC-01', requestId: 'REQ-1048', surveyId: 'SUR-1048', vendorOrganizationId: 'ORG-MERIDIAN',
    assignedVendorUserId: 'u-grant', internalOwnerId: 'u-dana', status: 'Submitted',
    submittedAt: '2026-09-19T20:30:00Z', reportEvidenceId: 'EVID-04', recommendationIds: ['REC-2026-002'],
    originalVendorPreserved: true, releaseAuthority: 'Internal manager only', handoffAt: null, handoffBy: null,
  },
];

/* ------------------------------------------------------------------ *
 * Time (F15)
 * ------------------------------------------------------------------ */

export const TIME_ACTIVITIES = ['Survey', 'Travel', 'Report writing', 'General administration', 'Account work', 'Training'];

export const TIME_ENTRIES = [
  { id: 'TIME-01', principalId: 'u-dana', date: '2026-09-18', activity: 'General administration', requestId: null, accountId: null, durationMinutes: 45, note: 'Synthetic planning and coordination work' },
  { id: 'TIME-02', principalId: 'u-dana', date: '2026-09-19', activity: 'Survey', requestId: 'REQ-1042', accountId: 'ACCT-100', durationMinutes: 300, note: 'Pre-visit preparation and draft answers' },
  { id: 'TIME-03', principalId: 'u-dana', date: '2026-09-19', activity: 'Travel', requestId: 'REQ-1042', accountId: 'ACCT-100', durationMinutes: 110, note: 'Return travel to Camden' },
  { id: 'TIME-04', principalId: 'u-dana', date: '2026-09-21', activity: 'Report writing', requestId: 'REQ-1045', accountId: 'ACCT-100', durationMinutes: 180, note: 'Corrections after review return' },
  { id: 'TIME-05', principalId: 'u-marcus', date: '2026-09-18', activity: 'Account work', requestId: null, accountId: 'ACCT-200', durationMinutes: 90, note: 'Service plan coordination' },
  { id: 'TIME-06', principalId: 'u-marcus', date: '2026-09-21', activity: 'Survey', requestId: 'REQ-1044', accountId: 'ACCT-200', durationMinutes: 120, note: 'Package review before the visit' },
  { id: 'TIME-07', principalId: 'u-tom', date: '2026-09-21', activity: 'General administration', requestId: null, accountId: null, durationMinutes: 60, note: 'Queue triage and scheduling' },
];

/* ------------------------------------------------------------------ *
 * Quality reviews (F16)
 * ------------------------------------------------------------------ */

export const QUALITY_REVIEWS = [
  {
    id: 'QA-2026-09-DW', subjectType: 'Employee', subjectId: 'u-dana', period: '2026-09', cadence: 'Monthly',
    rubricId: 'rubric-employee-v1', rubricVersion: 1, rubricStatus: 'Illustrative; business approval required',
    reviewerId: 'u-priya', status: 'InProgress', completedAt: null,
    samples: [{ id: 'QS-01', surveyId: 'SUR-1045', requestId: 'REQ-1045', note: 'Returned once; resubmitted within two days.' }],
    observations: [
      { dimension: 'Traceability', finding: 'Check supporting evidence links on findings', rating: null },
      { dimension: 'Timeliness', finding: 'Submission followed the visit within four days', rating: null },
    ],
    actions: [{ id: 'QACT-01', description: 'Attach finding evidence before submission', ownerId: 'u-dana', dueDate: '2026-10-02', status: 'Open' }],
  },
  {
    id: 'QA-2026-Q3-MERIDIAN', subjectType: 'Vendor', subjectId: 'ORG-MERIDIAN', period: '2026-Q3', cadence: 'Quarterly',
    rubricId: 'rubric-vendor-v1', rubricVersion: 1, rubricStatus: 'Illustrative; business approval required',
    reviewerId: 'u-priya', status: 'NotStarted', completedAt: null,
    samples: [{ id: 'QS-02', surveyId: 'SUR-1048', requestId: 'REQ-1048', note: 'Vendor submission pending internal handoff.' }],
    observations: [],
    actions: [],
  },
  {
    id: 'QA-2026-08-MO', subjectType: 'Employee', subjectId: 'u-marcus', period: '2026-08', cadence: 'Monthly',
    rubricId: 'rubric-employee-v1', rubricVersion: 1, rubricStatus: 'Illustrative; business approval required',
    reviewerId: 'u-priya', status: 'Complete', completedAt: '2026-09-02',
    samples: [{ id: 'QS-03', surveyId: 'SUR-1044', requestId: 'REQ-1044', note: 'Scope amendment handled correctly.' }],
    observations: [{ dimension: 'Scope discipline', finding: 'Amendment reason recorded on revision 2', rating: null }],
    actions: [],
  },
];

/* ------------------------------------------------------------------ *
 * Metrics (F17)
 * ------------------------------------------------------------------ */

export const METRIC_DEFINITIONS = [
  {
    id: 'METRIC-TURNAROUND', name: 'Engineer turnaround', startEvent: 'SurveyVisited', endEvent: 'FirstSubmittedInReview',
    unit: 'Calendar days (proposed)', aggregation: 'Mean of eligible completed intervals',
    excludesManagerReview: true, returnedReviewPolicy: 'Open decision', isApprovedPerformanceTarget: false,
    numerator: 'Sum of eligible completed intervals in days', denominator: 'Count of eligible completed intervals',
    samples: [
      { requestId: 'REQ-1045', surveyDate: '2026-09-11', inReviewDate: '2026-09-15', days: 4 },
      { requestId: 'REQ-1046', surveyDate: '2026-03-04', inReviewDate: '2026-03-09', days: 5 },
      { requestId: 'REQ-0988', surveyDate: '2024-09-19', inReviewDate: '2024-09-27', days: 8 },
    ],
  },
  {
    id: 'METRIC-REVIEW-DURATION', name: 'Review duration', startEvent: 'FirstSubmittedInReview', endEvent: 'ReviewDecision',
    unit: 'Calendar days (proposed)', aggregation: 'Mean of completed review intervals',
    excludesManagerReview: false, returnedReviewPolicy: 'Each decision counted separately', isApprovedPerformanceTarget: false,
    numerator: 'Sum of review intervals in days', denominator: 'Count of review decisions',
    samples: [
      { requestId: 'REQ-1045', surveyDate: '2026-09-15', inReviewDate: '2026-09-16', days: 1 },
      { requestId: 'REQ-1046', surveyDate: '2026-03-09', inReviewDate: '2026-03-10', days: 1 },
    ],
  },
  {
    id: 'METRIC-OPEN-RECS', name: 'Open recommendations', startEvent: 'RecommendationIssued', endEvent: 'RecommendationClosed',
    unit: 'Count', aggregation: 'Count of recommendations not in a closed status',
    excludesManagerReview: false, returnedReviewPolicy: 'Not applicable', isApprovedPerformanceTarget: false,
    numerator: 'Recommendations in an open status', denominator: 'Not applicable',
    samples: [
      { requestId: 'ACCT-100', surveyDate: '—', inReviewDate: '—', days: 3 },
      { requestId: 'ACCT-200', surveyDate: '—', inReviewDate: '—', days: 1 },
      { requestId: 'ACCT-300', surveyDate: '—', inReviewDate: '—', days: 1 },
    ],
  },
  {
    id: 'METRIC-PLAN-PROGRESS', name: 'Service plan progress', startEvent: 'PlanActionPlanned', endEvent: 'PlanActionComplete',
    unit: 'Percent of actions complete', aggregation: 'Complete actions divided by planned actions',
    excludesManagerReview: false, returnedReviewPolicy: 'Not applicable', isApprovedPerformanceTarget: false,
    numerator: 'Actions with an actual completion date', denominator: 'Actions in the current plan revision',
    samples: [
      { requestId: 'PLAN-2026-HARBOR', surveyDate: '—', inReviewDate: '—', days: 33 },
      { requestId: 'PLAN-2026-CASCADE', surveyDate: '—', inReviewDate: '—', days: 0 },
    ],
  },
  {
    id: 'METRIC-ACTIVITY-TIME', name: 'Activity time', startEvent: 'TimeEntryRecorded', endEvent: 'Not applicable',
    unit: 'Minutes', aggregation: 'Sum of recorded minutes by activity classification',
    excludesManagerReview: false, returnedReviewPolicy: 'Not applicable', isApprovedPerformanceTarget: false,
    numerator: 'Sum of DurationMinutes', denominator: 'Not applicable',
    samples: [
      { requestId: 'Survey', surveyDate: '—', inReviewDate: '—', days: 420 },
      { requestId: 'Travel', surveyDate: '—', inReviewDate: '—', days: 110 },
      { requestId: 'Report writing', surveyDate: '—', inReviewDate: '—', days: 180 },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Access administration (F13)
 * ------------------------------------------------------------------ */

export const MEMBERSHIPS = [
  { id: 'MEM-01', principalId: 'u-alicia', organizationId: 'ORG-HARBOR', status: 'Active', roles: ['CustomerOrganizationOwner', 'CustomerAdministrator'], scope: 'ACCT-100 (all permitted sites)', source: 'Claims Connect membership authority', authorizationVersion: 14 },
  { id: 'MEM-02', principalId: 'u-nate', organizationId: 'ORG-HARBOR', status: 'Active', roles: ['CustomerContributor'], scope: 'SITE-01', source: 'Invitation accepted 2026-04-02', authorizationVersion: 9 },
  { id: 'MEM-03', principalId: 'u-sofia', organizationId: 'ORG-CASCADE', status: 'Active', roles: ['CustomerViewer'], scope: 'ACCT-200 (all permitted sites)', source: 'Invitation accepted 2025-11-14', authorizationVersion: 6 },
  { id: 'MEM-04', principalId: 'u-grant', organizationId: 'ORG-MERIDIAN', status: 'Active', roles: ['VendorSurveyor'], scope: 'Assignment ASG-04 only', source: 'Vendor onboarding', authorizationVersion: 3 },
];

export const INVITATIONS = [
  { id: 'INV-01', organizationId: 'ORG-HARBOR', recipient: 'dana.pryor@example.invalid', proposedRoles: ['CustomerContributor'], scope: 'SITE-02', status: 'Pending', invitedById: 'u-alicia', expiresAt: '2026-10-05' },
];

export const ALLOWED_DELEGATED_ROLES = {
  customer_admin: ['CustomerContributor', 'CustomerViewer'],
  manager: ['Engineer', 'Coordinator', 'VendorSurveyor'],
};

export const ROLE_CATALOG = [
  { id: 'Engineer', audience: 'Workforce', delegable: false, description: 'Executes assigned assessments and surveys.' },
  { id: 'Manager', audience: 'Workforce', delegable: false, description: 'Triage, assignment, review and release authority.' },
  { id: 'Coordinator', audience: 'Workforce', delegable: false, description: 'Scheduling, plans and service instructions.' },
  { id: 'Underwriter', audience: 'Workforce', delegable: false, description: 'Creates requests and reads released results.' },
  { id: 'VendorSurveyor', audience: 'Vendor', delegable: true, description: 'Assignment-bound contribution only.' },
  { id: 'CustomerOrganizationOwner', audience: 'Customer', delegable: false, description: 'Protected owner responsibility; transfer only.' },
  { id: 'CustomerAdministrator', audience: 'Customer', delegable: true, description: 'Manages the customer REP team within delegated authority.' },
  { id: 'CustomerContributor', audience: 'Customer', delegable: true, description: 'Responds to assigned questions and uploads evidence.' },
  { id: 'CustomerViewer', audience: 'Customer', delegable: true, description: 'Reads released results only.' },
];

export const GROUP_ROLE_BINDINGS = [
  { id: 'GRB-01', workforceOrganizationId: 'ORG-MSIG-RE', groupId: 'grp-re-engineers', roleId: 'Engineer', environment: 'Production', active: true },
  { id: 'GRB-02', workforceOrganizationId: 'ORG-MSIG-RE', groupId: 'grp-re-managers', roleId: 'Manager', environment: 'Production', active: true },
  { id: 'GRB-03', workforceOrganizationId: 'ORG-MSIG-RE', groupId: 'grp-re-coordinators', roleId: 'Coordinator', environment: 'Production', active: true },
  { id: 'GRB-04', workforceOrganizationId: 'ORG-MSIG-RE', groupId: 'grp-uw-property', roleId: 'Underwriter', environment: 'Production', active: true },
  { id: 'GRB-05', workforceOrganizationId: 'ORG-MSIG-RE', groupId: 'grp-re-engineers', roleId: 'Engineer', environment: 'Test', active: false },
];

/* ------------------------------------------------------------------ *
 * Operations — migration, integrations, audit, jobs (F19, F20, F23)
 * ------------------------------------------------------------------ */

export const MIGRATION_BATCHES = [
  {
    id: 'MIG-01', sourceSystem: 'RCT', synthetic: true, status: 'Reconciliation exceptions', createdAt: '2026-09-15',
    manifestReference: 'rct-export-2026-09-15.manifest', checksumsSupplied: false, cutoverApproved: false,
    counts: [
      { entity: 'Surveys', expected: 3, received: 3 },
      { entity: 'Reports', expected: 3, received: 2 },
      { entity: 'ConfirmationLetters', expected: 3, received: 3 },
      { entity: 'Attachments', expected: 5, received: 4 },
      { entity: 'Recommendations', expected: 7, received: 7 },
    ],
    recommendationIdentityPreserved: true,
    items: [
      { id: 'MIGI-01', sourceId: 'RCT-SUR-88121', entity: 'Survey', mappedTo: 'SUR-0988', status: 'Imported', note: 'Identity preserved' },
      { id: 'MIGI-02', sourceId: 'RCT-RPT-88121', entity: 'Report', mappedTo: 'DOC-0988-INT', status: 'Imported', note: '' },
      { id: 'MIGI-03', sourceId: 'RCT-RPT-88144', entity: 'Report', mappedTo: null, status: 'Missing artifact', note: 'Source export did not contain the PDF' },
      { id: 'MIGI-04', sourceId: 'RCT-ATT-99012', entity: 'Attachment', mappedTo: null, status: 'Missing artifact', note: 'Attachment class absent from the archive' },
      { id: 'MIGI-05', sourceId: 'RCT-REC-2024-011', entity: 'Recommendation', mappedTo: 'REC-2024-011', status: 'Imported', note: 'Recommendation identity preserved' },
    ],
    exceptions: [
      { id: 'MIGE-01', severity: 'Blocking', detail: 'Reports received (2) fewer than expected (3).' },
      { id: 'MIGE-02', severity: 'Blocking', detail: 'Attachments received (4) fewer than expected (5).' },
      { id: 'MIGE-03', severity: 'Blocking', detail: 'Source checksums were not supplied with the manifest.' },
    ],
  },
  {
    id: 'MIG-02', sourceSystem: 'RCT', synthetic: true, status: 'Dry run complete', createdAt: '2026-09-19',
    manifestReference: 'rct-export-2026-09-19.manifest', checksumsSupplied: true, cutoverApproved: false,
    counts: [
      { entity: 'Surveys', expected: 2, received: 2 },
      { entity: 'Reports', expected: 2, received: 2 },
      { entity: 'ConfirmationLetters', expected: 2, received: 2 },
      { entity: 'Attachments', expected: 3, received: 3 },
      { entity: 'Recommendations', expected: 4, received: 4 },
    ],
    recommendationIdentityPreserved: true,
    items: [
      { id: 'MIGI-10', sourceId: 'RCT-SUR-90210', entity: 'Survey', mappedTo: 'staged', status: 'Staged', note: 'Dry run only' },
      { id: 'MIGI-11', sourceId: 'RCT-RPT-90210', entity: 'Report', mappedTo: 'staged', status: 'Staged', note: 'Dry run only' },
    ],
    exceptions: [],
  },
];

export const INTEGRATION_ADAPTERS = [
  { id: 'UWWB', name: 'UWWB account and policy status', direction: 'Inbound', schemaVersion: 1, lastSuccessAt: '2026-09-21T06:12:00Z', freshness: 'Fresh', coverage: '3 of 3 accounts', status: 'Healthy', realConnection: false },
  { id: 'ACCOUNT360', name: 'Account 360', direction: 'Inbound', schemaVersion: 2, lastSuccessAt: '2026-09-21T06:12:00Z', freshness: 'Fresh', coverage: '3 of 3 accounts', status: 'Healthy', realConnection: false },
  { id: 'PRODUCER360', name: 'Producer 360', direction: 'Inbound', schemaVersion: 1, lastSuccessAt: '2026-09-14T06:05:00Z', freshness: 'Stale (7 days)', coverage: '2 of 2 producers', status: 'Degraded', realConnection: false },
  { id: 'CRM', name: 'CRM contacts', direction: 'Inbound', schemaVersion: 1, lastSuccessAt: '2026-09-20T06:03:00Z', freshness: 'Fresh', coverage: '5 of 5 contacts', status: 'Healthy', realConnection: false },
  { id: 'EDP', name: 'Enterprise data platform extract', direction: 'Outbound', schemaVersion: 3, lastSuccessAt: '2026-09-21T23:40:00Z', freshness: 'Fresh', coverage: 'Nightly', status: 'Healthy', realConnection: false },
  { id: 'LOSSRUNS', name: 'Loss runs', direction: 'Inbound', schemaVersion: 1, lastSuccessAt: null, freshness: 'Never received', coverage: '0 of 3 accounts', status: 'Not configured', realConnection: false },
  { id: 'CLAIMSCONNECT', name: 'Claims Connect customer contracts', direction: 'Outbound', schemaVersion: 1, lastSuccessAt: '2026-09-22T05:00:00Z', freshness: 'Fresh', coverage: 'Contracts C01-C05', status: 'Healthy', realConnection: false },
];

export const INTEGRATION_EVENTS = [
  { id: 'EVT-001', source: 'UWWB sample', eventType: 'AccountCoverageChanged', correlationId: 'CORR-1042', organizationId: 'ORG-HARBOR', schemaVersion: 1, status: 'Applied', attempts: 1, appliedCount: 1, receivedAt: '2026-09-21T06:12:00Z', payload: { accountId: 'ACCT-100', coverageStatus: 'Active', effectiveDate: '2026-09-18' } },
  { id: 'EVT-001', source: 'UWWB sample', eventType: 'AccountCoverageChanged', correlationId: 'CORR-1042', organizationId: 'ORG-HARBOR', schemaVersion: 1, status: 'Duplicate ignored', attempts: 1, appliedCount: 1, receivedAt: '2026-09-21T06:18:00Z', payload: { accountId: 'ACCT-100', coverageStatus: 'Active', effectiveDate: '2026-09-18' }, duplicateOf: 'EVT-001' },
  { id: 'EVT-002', source: 'Producer 360 sample', eventType: 'ProducerChanged', correlationId: 'CORR-2200', organizationId: 'ORG-NORTHGATE', schemaVersion: 1, status: 'Failed', attempts: 4, appliedCount: 0, receivedAt: '2026-09-20T06:05:00Z', payload: { accountId: 'ACCT-300', producerId: 'PROD-5541' }, lastError: 'Simulated adapter timeout' },
  { id: 'EVT-003', source: 'REP outbox', eventType: 'SurveyReleased', correlationId: 'CORR-1046', organizationId: 'ORG-NORTHGATE', schemaVersion: 1, status: 'Delivered', attempts: 1, appliedCount: 1, receivedAt: '2026-03-11T14:05:00Z', payload: { requestId: 'REQ-1046', releaseId: 'REL-1046-1' } },
  { id: 'EVT-004', source: 'REP outbox', eventType: 'RecommendationIssued', correlationId: 'CORR-1042', organizationId: 'ORG-HARBOR', schemaVersion: 1, status: 'Pending', attempts: 0, appliedCount: 0, receivedAt: '2026-09-21T16:20:00Z', payload: { recommendationId: 'REC-2026-001' } },
];

export const AUDIT_EVENTS = [
  { id: 'AUD-0001', at: '2026-09-21T15:42:10Z', actorId: 'u-dana', consumer: 'REP', organizationId: 'ORG-HARBOR', operation: 'Survey.SaveDraft', resource: 'SUR-1042 revision 2', outcome: 'Allowed', correlationId: 'CORR-1042', summary: 'Draft answers saved' },
  { id: 'AUD-0002', at: '2026-09-21T16:00:04Z', actorId: 'u-dana', consumer: 'REP', organizationId: 'ORG-HARBOR', operation: 'Evidence.UploadScoped', resource: 'EVID-05 version 1', outcome: 'Quarantined', correlationId: 'CORR-1042', summary: 'Scan result rejected; version blocked' },
  { id: 'AUD-0003', at: '2026-09-20T17:46:22Z', actorId: 'u-nate', consumer: 'ClaimsConnect', organizationId: 'ORG-HARBOR', operation: 'Contribution.Save', resource: 'INFO-3301', outcome: 'Allowed', correlationId: 'CORR-1042', summary: 'Customer contribution recorded' },
  { id: 'AUD-0004', at: '2026-09-20T18:02:55Z', actorId: 'u-sofia', consumer: 'ClaimsConnect', organizationId: 'ORG-CASCADE', operation: 'Recommendation.Respond', resource: 'REC-2026-004', outcome: 'Denied', correlationId: 'CORR-2044', summary: 'Viewer role cannot post a response' },
  { id: 'AUD-0005', at: '2026-09-16T09:12:40Z', actorId: 'u-priya', consumer: 'REP', organizationId: 'ORG-HARBOR', operation: 'Survey.Review', resource: 'SUR-1045 revision 1', outcome: 'Returned', correlationId: 'CORR-1045', summary: 'Returned with a recorded reason' },
  { id: 'AUD-0006', at: '2026-09-19T20:30:11Z', actorId: 'u-grant', consumer: 'VendorPortal', organizationId: 'ORG-MERIDIAN', operation: 'VendorContribution.Submit', resource: 'VC-01', outcome: 'Allowed', correlationId: 'CORR-1048', summary: 'Vendor submission received' },
  { id: 'AUD-0007', at: '2026-09-19T20:35:02Z', actorId: 'u-grant', consumer: 'VendorPortal', organizationId: 'ORG-MERIDIAN', operation: 'RiskRequest.Read', resource: 'REQ-1042', outcome: 'Not found', correlationId: 'CORR-1042', summary: 'Out-of-scope identifier returns a non-disclosing result' },
];

export const JOBS = [
  { id: 'JOB-7701', type: 'ReportRender', requestId: 'REQ-1045', status: 'Succeeded', startedAt: '2026-09-17T18:21:00Z', finishedAt: '2026-09-17T18:21:40Z', attempts: 1, result: 'DOC-1045-INT version 1', error: null },
  { id: 'JOB-7702', type: 'OutboxDispatch', requestId: null, status: 'Retrying', startedAt: '2026-09-20T06:05:00Z', finishedAt: null, attempts: 4, result: null, error: 'Simulated adapter timeout on Producer 360' },
  { id: 'JOB-7703', type: 'Export', requestId: null, status: 'Succeeded', startedAt: '2026-09-21T09:15:00Z', finishedAt: '2026-09-21T09:15:12Z', attempts: 1, result: 'recommendations-scoped-export.csv', error: null },
  { id: 'JOB-7704', type: 'MalwareScan', requestId: 'REQ-1042', status: 'Failed', startedAt: '2026-09-21T16:00:02Z', finishedAt: '2026-09-21T16:00:09Z', attempts: 1, result: 'Rejected', error: 'Sample rejection for demonstration' },
];

export const RELEASE_GATES = [
  { name: 'Scoped authorization tests', status: 'Not run against engine', evidence: 'No engine under test in this wireframe' },
  { name: 'Migration reconciliation', status: 'Pending real export', evidence: 'MIG-01 has blocking exceptions' },
  { name: 'Backup/restore drill', status: 'Not performed', evidence: 'No environment provisioned' },
  { name: 'Business output acceptance', status: 'Pending actual templates', evidence: 'Approved property form not supplied' },
  { name: 'Accessibility check', status: 'Not performed', evidence: 'Scheduled with the first implementation slice' },
];

/* ------------------------------------------------------------------ *
 * Fire impairment (F21) — phase undecided
 * ------------------------------------------------------------------ */

export const IMPAIRMENTS = [
  {
    id: 'IMP-01', accountId: 'ACCT-100', siteId: 'SITE-01', system: 'Sample sprinkler zone 3',
    reportedBy: 'contact@example.invalid', reportedVia: 'Email (unverified channel)', reason: 'Illustrative planned maintenance',
    start: '2026-09-24T09:00', expectedRestoration: '2026-09-24T13:00', status: 'Reported',
    ownerId: 'u-hannah', restorationEvidenceId: null, safetyAssessment: 'Not performed by this prototype',
    history: [{ at: '2026-09-21T11:00:00Z', actor: 'u-hannah', event: 'Intake recorded', detail: 'Reporter identity not verified in this wireframe.' }],
  },
  {
    id: 'IMP-02', accountId: 'ACCT-200', siteId: 'SITE-04', system: 'Sample ESFR zone — aisle 6',
    reportedBy: 'sofia.lindqvist@example.invalid', reportedVia: 'Claims Connect message', reason: 'Illustrative valve replacement',
    start: '2026-09-10T07:00', expectedRestoration: '2026-09-10T16:00', status: 'Restored',
    ownerId: 'u-hannah', restorationEvidenceId: 'EVID-IMP-02', safetyAssessment: 'Not performed by this prototype',
    history: [
      { at: '2026-09-09T14:20:00Z', actor: 'u-hannah', event: 'Intake recorded', detail: 'Planned work notified in advance.' },
      { at: '2026-09-10T16:40:00Z', actor: 'u-hannah', event: 'Restoration evidence recorded', detail: 'Sample evidence EVID-IMP-02 attached.' },
      { at: '2026-09-10T16:45:00Z', actor: 'u-hannah', event: 'Closed', detail: 'Closure permitted only after evidence was recorded.' },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Future options (F24)
 * ------------------------------------------------------------------ */

export const FUTURE_OPTIONS = [
  {
    id: 'F25-EXTERNAL-DATA',
    title: 'External risk data services (CatNet, Swiss Re, FEMA, Google Earth Pro, Global Weather/NOAA, NFPA Link, RMS/Verisk)',
    status: 'Requirement raised; procurement gated',
    decisionOwner: 'Product + procurement + contract owners; FEMA access offline follow-up',
    evidence: 'Stated business need in the future-state scope lockdown meeting, after the discovery package was sealed. See docs/discovery/addendum/f25-external-risk-data.md.',
    note: '',
    isRequirement: true,
  },
  { id: 'AI-NOTES', title: 'Voice notes with human validation', status: 'Explore later', decisionOwner: 'Product + security + relevant data owners', evidence: 'Vendor demonstration only; no approved data flow.', note: '' },
  { id: 'MAP', title: 'Map of authorized scheduled work', status: 'Deferred', decisionOwner: 'Product + security', evidence: 'Screenshot concept; no approved map service or data boundary.', note: '' },
  { id: 'BROKER', title: 'Broker portfolio of explicitly entitled accounts', status: 'Separate scope decision', decisionOwner: 'Product + distribution + security', evidence: 'No entitlement model agreed for broker organizations.', note: '' },
  { id: 'DASH', title: 'Advanced management dashboards', status: 'Explore later', decisionOwner: 'Product + RE management', evidence: 'Metric definitions unapproved; see METRIC-TURNAROUND open decision.', note: '' },
  { id: 'CSAT', title: 'Vendor-generic claims and CSAT features', status: 'Out of REP scope', decisionOwner: 'Product', evidence: 'Generic vendor capability; not a REP requirement.', note: '' },
];

/* ------------------------------------------------------------------ *
 * Saved views (F01)
 * ------------------------------------------------------------------ */

export const SAVED_VIEWS = [
  { id: 'VIEW-01', ownerId: 'u-dana', name: 'My due-soon surveys', scope: 'Personal', filters: { assignee: 'self', status: ['Assigned', 'InProgress'], dueBefore: '2026-10-02' }, sort: ['dueDate', 'accountName'], countsAreScoped: true },
  { id: 'VIEW-02', ownerId: 'u-dana', name: 'Open recommendations I own', scope: 'Personal', filters: { owner: 'self', status: ['Open'] }, sort: ['dueDate'], countsAreScoped: true },
  { id: 'VIEW-03', ownerId: 'u-priya', name: 'Team work in review', scope: 'Group', filters: { status: ['InReview'] }, sort: ['dueDate'], countsAreScoped: true },
  { id: 'VIEW-04', ownerId: 'u-priya', name: 'Unassigned submitted requests', scope: 'Group', filters: { status: ['Submitted'], assignee: 'none' }, sort: ['requestedDate'], countsAreScoped: true },
  { id: 'VIEW-05', ownerId: 'u-tom', name: 'Recurring work to confirm', scope: 'Organization', filters: { origin: 'ServicePlan', status: ['Assigned', 'Submitted'] }, sort: ['requestedDate'], countsAreScoped: true },
];

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

export const STATUS_BADGE = {
  Draft: 'not-started',
  NotStarted: 'not-started',
  'Not started': 'not-started',
  Planned: 'not-started',
  Review: 'review',
  Approved: 'review',
  Accepted: 'complete',
  Triaged: 'open',
  HandedOff: 'complete',
  Responded: 'complete',
  Withdrawn: 'blocked',
  Cancelled: 'blocked',
  'Missing artifact': 'blocked',
  'Duplicate ignored': 'not-started',
  'Not configured': 'not-started',
  Submitted: 'new',
  Reported: 'new',
  Assigned: 'open',
  InProgress: 'in-progress',
  InReview: 'review',
  PendingReview: 'review',
  VendorSubmitted: 'review',
  Returned: 'blocked',
  Blocked: 'blocked',
  Failed: 'blocked',
  Rejected: 'blocked',
  Open: 'open',
  Released: 'complete',
  Published: 'complete',
  Complete: 'complete',
  Completed: 'complete',
  Closed: 'complete',
  Restored: 'complete',
  Locked: 'complete',
  Sent: 'complete',
  Applied: 'complete',
  Delivered: 'complete',
  Succeeded: 'complete',
  Clean: 'complete',
  Pending: 'new',
  Retrying: 'in-progress',
  Active: 'complete',
  Healthy: 'complete',
  Degraded: 'review',
  Stale: 'review',
  Imported: 'complete',
  Staged: 'in-progress',
  Superseded: 'not-started',
  Pinned: 'complete',
};

export function badgeFor(status) {
  return STATUS_BADGE[status] ?? 'not-started';
}

export function userName(userId) {
  return USERS.find(user => user.id === userId)?.name ?? 'Unassigned';
}

export function accountName(accountId) {
  return ACCOUNTS.find(account => account.id === accountId)?.name ?? accountId;
}

export function siteName(siteId) {
  return SITES.find(site => site.id === siteId)?.name ?? siteId;
}

export function templateName(templateId) {
  return TEMPLATES.find(template => template.id === templateId)?.name ?? templateId;
}

export function createInitialState() {
  return {
    requests: structuredClone(REQUESTS),
    surveys: structuredClone(SURVEYS),
    recommendations: structuredClone(RECOMMENDATIONS),
    tasks: structuredClone(TASKS),
    visits: structuredClone(VISITS),
    evidence: structuredClone(EVIDENCE),
    releases: structuredClone(RELEASES),
    distributions: structuredClone(DISTRIBUTIONS),
    reviewDecisions: structuredClone(REVIEW_DECISIONS),
    servicePlans: structuredClone(SERVICE_PLANS),
    instructions: structuredClone(INSTRUCTIONS),
    threads: structuredClone(THREADS),
    informationRequests: structuredClone(INFORMATION_REQUESTS),
    vendorContributions: structuredClone(VENDOR_CONTRIBUTIONS),
    timeEntries: structuredClone(TIME_ENTRIES),
    qualityReviews: structuredClone(QUALITY_REVIEWS),
    memberships: structuredClone(MEMBERSHIPS),
    invitations: structuredClone(INVITATIONS),
    templates: structuredClone(TEMPLATES),
    migrationBatches: structuredClone(MIGRATION_BATCHES),
    integrationEvents: structuredClone(INTEGRATION_EVENTS),
    auditEvents: structuredClone(AUDIT_EVENTS),
    jobs: structuredClone(JOBS),
    impairments: structuredClone(IMPAIRMENTS),
    futureOptions: structuredClone(FUTURE_OPTIONS),
    savedViews: structuredClone(SAVED_VIEWS),
    packageRevisions: structuredClone(PACKAGE_REVISIONS),
  };
}
