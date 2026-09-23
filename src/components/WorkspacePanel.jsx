import { lazy, Suspense } from 'react';
import { useRep } from '../state/repHooks';
import { PAGES, roleHas } from '../config/repConfig';
import { NoticeStack, PermissionGate } from './primitives';

const named = (loader, exportName) => lazy(() => loader().then(module => ({ default: module[exportName] })));

const PAGE_MAP = {
  P01: lazy(() => import('../pages/MyWork')),
  P02: named(() => import('../pages/Accounts'), 'AccountSearch'),
  P03: named(() => import('../pages/Accounts'), 'AccountWorkspace'),
  P04: named(() => import('../pages/Accounts'), 'SiteWorkspace'),
  P05: lazy(() => import('../pages/NewRequest')),
  P06: lazy(() => import('../pages/RequestWorkspace')),
  P07: named(() => import('../pages/WorkPlanning'), 'TriageAndAssignment'),
  P08: named(() => import('../pages/WorkPlanning'), 'Calendar'),
  P09: named(() => import('../pages/WorkPlanning'), 'TaskDetail'),
  P10: lazy(() => import('../pages/SurveyWorkspace')),
  P11: named(() => import('../pages/HistoricalCopy'), 'HistoricalCopy'),
  P12: named(() => import('../pages/Evidence'), 'EvidencePage'),
  P13: named(() => import('../pages/Recommendations'), 'RecommendationQueue'),
  P14: named(() => import('../pages/Recommendations'), 'RecommendationDetail'),
  P15: named(() => import('../pages/ReviewRelease'), 'ReviewQueue'),
  P16: named(() => import('../pages/ReviewRelease'), 'ReviewWorkspace'),
  P17: named(() => import('../pages/ReviewRelease'), 'Correspondence'),
  P18: named(() => import('../pages/ServicePlans'), 'ServicePlanList'),
  P19: named(() => import('../pages/ServicePlans'), 'ServicePlanWorkspace'),
  P20: named(() => import('../pages/ServicePlans'), 'ReInstructions'),
  P21: named(() => import('../pages/Collaboration'), 'CollaborationPage'),
  P22: named(() => import('../pages/Collaboration'), 'VendorHandoff'),
  P23: named(() => import('../pages/Time'), 'MyTime'),
  P24: named(() => import('../pages/Time'), 'TeamTime'),
  P25: named(() => import('../pages/Quality'), 'QualityReviews'),
  P26: named(() => import('../pages/Quality'), 'QualityReviewDetail'),
  P27: named(() => import('../pages/Insights'), 'ManagementInsights'),
  P28: named(() => import('../pages/Administration'), 'OrganizationTeamAccess'),
  P29: named(() => import('../pages/Administration'), 'PermissionAdministration'),
  P30: named(() => import('../pages/Catalog'), 'GovernedCatalog'),
  P31: named(() => import('../pages/Catalog'), 'CatalogVersion'),
  P32: named(() => import('../pages/Operations'), 'MigrationList'),
  P33: named(() => import('../pages/Operations'), 'MigrationBatch'),
  P34: named(() => import('../pages/Operations'), 'IntegrationOperations'),
  P35: named(() => import('../pages/Operations'), 'AuditAndJobs'),
  P36: named(() => import('../pages/Impairment'), 'ImpairmentRegister'),
  P37: named(() => import('../pages/Impairment'), 'ImpairmentDetail'),
  C01: named(() => import('../pages/ConsumerSurfaces'), 'ClaimsConnectRepArea'),
  V01: named(() => import('../pages/ConsumerSurfaces'), 'VendorAssignedWork'),
  F24: named(() => import('../pages/FutureOptions'), 'FutureOptions'),
};

export default function WorkspacePanel() {
  const { page, authenticatedUser } = useRep();
  const definition = PAGES[page.id];
  const Page = PAGE_MAP[page.id];

  if (!definition || !Page) {
    return <div className="wb-panel-loading">This page identifier is not part of the design inventory.</div>;
  }

  if (!roleHas(authenticatedUser.role, definition.permission)) {
    return (
      <>
        <NoticeStack />
        <PermissionGate permission={definition.permission}>
          <div />
        </PermissionGate>
      </>
    );
  }

  return (
    <>
      <NoticeStack />
      <Suspense fallback={<div className="wb-panel-loading">Loading…</div>}>
        <Page key={`${page.id}-${JSON.stringify(page.params)}`} {...page.params} />
      </Suspense>
    </>
  );
}
