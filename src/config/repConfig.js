/**
 * Risk Engineering Platform — wireframe configuration seams.
 *
 * Permission names are the proposed names recorded in the discovery feature
 * documents (F01-F24). They are illustrative discovery vocabulary, not a
 * verbatim Spark catalog. Nothing here implements real authorization: the
 * wireframe hides or disables surfaces for demonstration only.
 */

export const REP_BRANDING = {
  carrierName: 'MSIG USA',
  productName: 'Risk Engineering Platform',
  logoSrc: '/images/msig-logo.png',
  logoAlt: 'MSIG USA logo',
};

export const SYNTHETIC_NOTICE =
  'Illustrative discovery wireframe. All operational data is synthetic. No real authorization, persistence, scanning, sending, signing, migration, AI, or external integration is implemented.';

/* ------------------------------------------------------------------ *
 * Proposed permissions (discovery F01-F24)
 * ------------------------------------------------------------------ */

export const PERMISSIONS = {
  workReadOwn: 'Work.ReadOwn',
  workReadTeam: 'Work.ReadTeam',
  workAssign: 'Work.Assign',
  visitSchedule: 'Visit.Schedule',
  accountReadScoped: 'Account.ReadScoped',
  siteReadScoped: 'Site.ReadScoped',
  surveyCreate: 'Survey.Create',
  surveyScopeAmend: 'Survey.ScopeAmend',
  surveyReadAssigned: 'Survey.ReadAssigned',
  surveyReview: 'Survey.Review',
  surveyUnlock: 'Survey.Unlock',
  surveyCopySource: 'Survey.CopySource',
  responseWriteOwn: 'Response.WriteOwn',
  responseSubmit: 'Response.Submit',
  templateUse: 'Template.Use',
  templatePublish: 'Template.Publish',
  recommendationTemplateManage: 'RecommendationTemplate.Manage',
  evidenceUploadScoped: 'Evidence.UploadScoped',
  evidenceReadScoped: 'Evidence.ReadScoped',
  evidenceClassify: 'Evidence.Classify',
  recommendationCreate: 'Recommendation.Create',
  recommendationUpdateStatus: 'Recommendation.UpdateStatus',
  recommendationAmendIssued: 'Recommendation.AmendIssued',
  recommendationExport: 'Recommendation.Export',
  recommendationReadShared: 'Recommendation.ReadShared',
  recommendationRespond: 'Recommendation.Respond',
  releasePublish: 'Release.Publish',
  releaseWithdraw: 'Release.Withdraw',
  correspondenceDraft: 'Correspondence.Draft',
  correspondenceSend: 'Correspondence.Send',
  reportReadScoped: 'Report.ReadScoped',
  servicePlanReadScoped: 'ServicePlan.ReadScoped',
  servicePlanManage: 'ServicePlan.Manage',
  servicePlanRelease: 'ServicePlan.Release',
  serviceInstructionRead: 'ServiceInstruction.Read',
  serviceInstructionManage: 'ServiceInstruction.Manage',
  customerReleaseRead: 'CustomerRelease.Read',
  repTeamInvite: 'REPTeam.Invite',
  repTeamAssignAllowedRole: 'REPTeam.AssignAllowedRole',
  repTeamRemoveAccess: 'REPTeam.RemoveAccess',
  permissionAdminScoped: 'Permission.AdminScoped',
  vendorWorkReadAssigned: 'VendorWork.ReadAssigned',
  vendorContributionSubmit: 'VendorContribution.Submit',
  vendorWorkHandoff: 'VendorWork.Handoff',
  timeWriteOwn: 'Time.WriteOwn',
  timeReadOwn: 'Time.ReadOwn',
  timeReadTeam: 'Time.ReadTeam',
  timeExport: 'Time.Export',
  qualityReviewManage: 'QualityReview.Manage',
  qualityReviewReadTeam: 'QualityReview.ReadTeam',
  portfolioReadScoped: 'Portfolio.ReadScoped',
  analyticsReadTeam: 'Analytics.ReadTeam',
  analyticsExport: 'Analytics.Export',
  migrationPlan: 'Migration.Plan',
  migrationReconcile: 'Migration.Reconcile',
  migrationApproveCutover: 'Migration.ApproveCutover',
  integrationOperate: 'Integration.Operate',
  integrationReadStatus: 'Integration.ReadStatus',
  impairmentManage: 'Impairment.Manage',
  impairmentReadAssigned: 'Impairment.ReadAssigned',
  auditReadScoped: 'Audit.ReadScoped',
  supportOperateScoped: 'Support.OperateScoped',
  roadmapDecide: 'Roadmap.Decide',
  /* F25 — addendum scope, not approved for build. Holding the permission lets a
     role see the gated surface; it does not make any provider available. */
  externalDataLookup: 'ExternalData.Lookup',
  externalDataReadScoped: 'ExternalData.ReadScoped',
};

const P = PERMISSIONS;

/* ------------------------------------------------------------------ *
 * Roles (discovery actor vocabulary)
 * ------------------------------------------------------------------ */

export const ROLES = {
  engineer: { id: 'engineer', label: 'Risk Engineer', audience: 'Workforce' },
  manager: { id: 'manager', label: 'RE Manager', audience: 'Workforce' },
  coordinator: { id: 'coordinator', label: 'Service Coordinator', audience: 'Workforce' },
  underwriter: { id: 'underwriter', label: 'Underwriter', audience: 'Workforce' },
  impairment_team: { id: 'impairment_team', label: 'Impairment Team', audience: 'Workforce' },
  operations: { id: 'operations', label: 'Platform Operations', audience: 'Workforce' },
  access_admin: { id: 'access_admin', label: 'Platform Access Administrator', audience: 'Workforce' },
  vendor: { id: 'vendor', label: 'Vendor Surveyor', audience: 'Vendor' },
  customer_admin: { id: 'customer_admin', label: 'Customer Organization Administrator', audience: 'Customer' },
  customer_contributor: { id: 'customer_contributor', label: 'Customer Contributor', audience: 'Customer' },
  customer_viewer: { id: 'customer_viewer', label: 'Customer Viewer', audience: 'Customer' },
};

export const ROLE_PERMISSIONS = {
  engineer: [
    P.workReadOwn, P.accountReadScoped, P.siteReadScoped, P.surveyCreate, P.surveyReadAssigned,
    P.responseWriteOwn, P.responseSubmit, P.templateUse, P.surveyCopySource,
    P.evidenceUploadScoped, P.evidenceReadScoped, P.evidenceClassify,
    P.recommendationCreate, P.recommendationUpdateStatus,
    P.correspondenceDraft, P.reportReadScoped,
    P.servicePlanReadScoped, P.serviceInstructionRead,
    P.timeWriteOwn, P.timeReadOwn, P.portfolioReadScoped, P.visitSchedule,
    P.externalDataLookup, P.externalDataReadScoped,
  ],
  manager: [
    P.workReadOwn, P.workReadTeam, P.workAssign, P.visitSchedule,
    P.accountReadScoped, P.siteReadScoped, P.surveyCreate, P.surveyScopeAmend,
    P.surveyReadAssigned, P.surveyReview, P.surveyUnlock, P.surveyCopySource, P.templateUse,
    P.templatePublish, P.recommendationTemplateManage,
    P.evidenceReadScoped, P.evidenceClassify,
    P.recommendationCreate, P.recommendationUpdateStatus, P.recommendationAmendIssued, P.recommendationExport,
    P.releasePublish, P.releaseWithdraw, P.correspondenceDraft, P.correspondenceSend, P.reportReadScoped,
    P.servicePlanReadScoped, P.servicePlanManage, P.servicePlanRelease,
    P.serviceInstructionRead, P.serviceInstructionManage,
    P.repTeamInvite, P.repTeamAssignAllowedRole, P.repTeamRemoveAccess,
    P.vendorWorkHandoff,
    P.timeWriteOwn, P.timeReadOwn, P.timeReadTeam, P.timeExport,
    P.qualityReviewManage, P.qualityReviewReadTeam,
    P.portfolioReadScoped, P.analyticsReadTeam, P.analyticsExport,
    P.migrationPlan, P.migrationReconcile, P.migrationApproveCutover,
    P.integrationReadStatus, P.auditReadScoped, P.roadmapDecide,
    P.externalDataLookup, P.externalDataReadScoped,
  ],
  coordinator: [
    P.workReadOwn, P.workReadTeam, P.workAssign, P.visitSchedule,
    P.accountReadScoped, P.siteReadScoped, P.surveyCreate, P.surveyScopeAmend, P.templateUse,
    P.evidenceReadScoped, P.recommendationUpdateStatus, P.recommendationExport,
    P.correspondenceDraft, P.correspondenceSend, P.reportReadScoped,
    P.servicePlanReadScoped, P.servicePlanManage, P.servicePlanRelease,
    P.serviceInstructionRead, P.serviceInstructionManage,
    P.timeWriteOwn, P.timeReadOwn, P.portfolioReadScoped,
    P.impairmentManage, P.impairmentReadAssigned,
    P.integrationReadStatus, P.roadmapDecide, P.surveyCopySource,
    P.externalDataLookup, P.externalDataReadScoped,
  ],
  underwriter: [
    P.workReadOwn, P.accountReadScoped, P.siteReadScoped,
    P.surveyCreate, P.templateUse, P.reportReadScoped, P.portfolioReadScoped,
  ],
  impairment_team: [
    P.workReadOwn, P.accountReadScoped, P.siteReadScoped,
    P.impairmentManage, P.impairmentReadAssigned, P.evidenceUploadScoped, P.evidenceReadScoped,
  ],
  operations: [
    P.migrationPlan, P.migrationReconcile,
    P.integrationOperate, P.integrationReadStatus,
    P.auditReadScoped, P.supportOperateScoped,
  ],
  access_admin: [
    P.permissionAdminScoped, P.repTeamInvite, P.repTeamAssignAllowedRole, P.repTeamRemoveAccess,
    P.auditReadScoped,
  ],
  vendor: [P.vendorWorkReadAssigned, P.vendorContributionSubmit, P.evidenceUploadScoped],
  customer_admin: [P.customerReleaseRead, P.recommendationReadShared, P.recommendationRespond, P.repTeamInvite, P.repTeamAssignAllowedRole],
  customer_contributor: [P.customerReleaseRead, P.recommendationReadShared, P.recommendationRespond, P.evidenceUploadScoped],
  customer_viewer: [P.customerReleaseRead, P.recommendationReadShared],
};

/* ------------------------------------------------------------------ *
 * Page and route inventory — docs/application-detailed-design.md section 4
 * ------------------------------------------------------------------ */

export const PAGES = {
  P01: { id: 'P01', name: 'My Work', route: '/workbench', apiGroups: 'A01, A02', permission: P.workReadOwn },
  P02: { id: 'P02', name: 'Account Search', route: '/accounts', apiGroups: 'A03', permission: P.accountReadScoped },
  P03: { id: 'P03', name: 'Account Workspace', route: '/accounts/:accountId', apiGroups: 'A03, A04, A10, A13', permission: P.accountReadScoped },
  P04: { id: 'P04', name: 'Site Workspace', route: '/accounts/:accountId/sites/:siteId', apiGroups: 'A03, A04, A10', permission: P.siteReadScoped },
  P05: { id: 'P05', name: 'New Request', route: '/requests/new', apiGroups: 'A03-A05, A09', permission: P.surveyCreate },
  P06: { id: 'P06', name: 'Request Workspace', route: '/requests/:requestId', apiGroups: 'A04, A06-A12', permission: P.workReadOwn },
  P07: { id: 'P07', name: 'Triage and Assignment', route: '/work/triage', apiGroups: 'A04, A06', permission: P.workAssign },
  P08: { id: 'P08', name: 'Calendar', route: '/work/calendar', apiGroups: 'A06', permission: P.visitSchedule },
  P09: { id: 'P09', name: 'Task Detail', route: '/tasks/:taskId', apiGroups: 'A06', permission: P.workReadOwn },
  P10: { id: 'P10', name: 'Survey Workspace', route: '/surveys/:surveyId', apiGroups: 'A07, A09, A10', permission: P.surveyReadAssigned },
  P11: { id: 'P11', name: 'Historical Copy', route: '/requests/:requestId/copy', apiGroups: 'A08', permission: P.surveyCopySource },
  P12: { id: 'P12', name: 'Evidence', route: '/requests/:requestId/evidence', apiGroups: 'A09', permission: P.evidenceReadScoped },
  P13: { id: 'P13', name: 'Recommendation Queue', route: '/recommendations', apiGroups: 'A10, A19', permission: P.recommendationUpdateStatus },
  P14: { id: 'P14', name: 'Recommendation Detail', route: '/recommendations/:recommendationId', apiGroups: 'A10, A15', permission: P.recommendationUpdateStatus },
  P15: { id: 'P15', name: 'Review Queue', route: '/reviews', apiGroups: 'A11', permission: P.surveyReview },
  P16: { id: 'P16', name: 'Review Workspace', route: '/requests/:requestId/review', apiGroups: 'A07, A10-A12', permission: P.surveyReview },
  P17: { id: 'P17', name: 'Correspondence', route: '/requests/:requestId/correspondence', apiGroups: 'A12', permission: P.correspondenceDraft },
  P18: { id: 'P18', name: 'Service Plans', route: '/service-plans', apiGroups: 'A13', permission: P.servicePlanReadScoped },
  P19: { id: 'P19', name: 'Service Plan Workspace', route: '/service-plans/:planId', apiGroups: 'A13', permission: P.servicePlanReadScoped },
  P20: { id: 'P20', name: 'RE Instructions', route: '/accounts/:accountId/instructions', apiGroups: 'A14', permission: P.serviceInstructionRead },
  P21: { id: 'P21', name: 'Messages and Information Requests', route: '/requests/:requestId/collaboration', apiGroups: 'A15', permission: P.workReadOwn },
  P22: { id: 'P22', name: 'Vendor Handoff', route: '/requests/:requestId/vendor-work', apiGroups: 'A16', permission: P.vendorWorkHandoff },
  P23: { id: 'P23', name: 'My Time', route: '/time', apiGroups: 'A17', permission: P.timeReadOwn },
  P24: { id: 'P24', name: 'Team Time', route: '/time/team', apiGroups: 'A17, A19', permission: P.timeReadTeam },
  P25: { id: 'P25', name: 'Quality Reviews', route: '/quality-reviews', apiGroups: 'A18', permission: P.qualityReviewReadTeam },
  P26: { id: 'P26', name: 'Quality Review Detail', route: '/quality-reviews/:reviewId', apiGroups: 'A18', permission: P.qualityReviewReadTeam },
  P27: { id: 'P27', name: 'Management Insights', route: '/insights', apiGroups: 'A19', permission: P.portfolioReadScoped },
  P28: { id: 'P28', name: 'Organization Team Access', route: '/administration/organizations/:organizationId/team', apiGroups: 'A20', permission: P.repTeamInvite },
  P29: { id: 'P29', name: 'Permission Administration', route: '/administration/access', apiGroups: 'A20', permission: P.permissionAdminScoped },
  P30: { id: 'P30', name: 'Governed Catalog', route: '/administration/catalog', apiGroups: 'A05', permission: P.templateUse },
  P31: { id: 'P31', name: 'Catalog Version', route: '/administration/catalog/:templateId/versions/:versionId', apiGroups: 'A05', permission: P.templateUse },
  P32: { id: 'P32', name: 'Migration', route: '/operations/migrations', apiGroups: 'A21', permission: P.migrationPlan },
  P33: { id: 'P33', name: 'Migration Batch', route: '/operations/migrations/:batchId', apiGroups: 'A21', permission: P.migrationPlan },
  P34: { id: 'P34', name: 'Integration Operations', route: '/operations/integrations', apiGroups: 'A22', permission: P.integrationReadStatus },
  P35: { id: 'P35', name: 'Audit and Jobs', route: '/operations/audit', apiGroups: 'A23', permission: P.auditReadScoped },
  P36: { id: 'P36', name: 'Impairment Register', route: '/impairments', apiGroups: 'A24', permission: P.impairmentReadAssigned, phase: 'Phase undecided' },
  P37: { id: 'P37', name: 'Impairment Detail', route: '/impairments/:impairmentId', apiGroups: 'A24, A09', permission: P.impairmentReadAssigned, phase: 'Phase undecided' },
  C01: { id: 'C01', name: 'Claims Connect — REP area', route: '(separate consumer surface)', apiGroups: 'C01-C05', permission: P.customerReleaseRead, consumer: 'Claims Connect' },
  V01: { id: 'V01', name: 'Vendor Assigned Work', route: '(separate consumer surface)', apiGroups: 'V01-V03', permission: P.vendorWorkReadAssigned, consumer: 'Vendor' },
  F24: { id: 'F24', name: 'Future Options Register', route: '/roadmap/options', apiGroups: '—', permission: P.roadmapDecide, phase: 'Options only; not approved for build' },
};

/* Left-navigation grouping. Detail pages are reached by drilling in. */
export const NAV_GROUPS = [
  { id: 'work', label: 'Work', items: ['P01', 'P07', 'P08', 'P15', 'P13'] },
  { id: 'accounts', label: 'Accounts & Service', items: ['P02', 'P18'] },
  { id: 'time', label: 'Time', items: ['P23', 'P24'] },
  { id: 'oversight', label: 'Oversight', items: ['P25', 'P27'] },
  { id: 'administration', label: 'Administration', items: ['P28', 'P29', 'P30'] },
  { id: 'operations', label: 'Operations', items: ['P32', 'P34', 'P35'] },
  { id: 'impairment', label: 'Fire impairment', items: ['P36'] },
  { id: 'roadmap', label: 'Roadmap', items: ['F24'] },
  { id: 'consumers', label: 'Separate consumer surfaces', items: ['C01', 'V01'] },
];

export const DEFAULT_PAGE_BY_ROLE = {
  engineer: 'P01',
  manager: 'P01',
  coordinator: 'P01',
  underwriter: 'P01',
  impairment_team: 'P36',
  operations: 'P34',
  access_admin: 'P29',
  vendor: 'V01',
  customer_admin: 'C01',
  customer_contributor: 'C01',
  customer_viewer: 'C01',
};

export function permissionsForRole(role) {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function roleHas(role, permission) {
  return permissionsForRole(role).includes(permission);
}

export function buildRoute(page, params = {}) {
  if (!page) return '';
  return page.route.replace(/:([A-Za-z]+)/g, (match, key) => params[key] ?? match);
}
