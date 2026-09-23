import { useState } from 'react';
import { useRep, useNavigate } from '../state/repHooks';
import {
  PageHeader, Badge, Tabs, EmptyState, SearchField, InfoCard, DefinitionList, Metric,
  SyntheticFooter, Disclosure, Crumb,
} from '../components/primitives';
import ExternalRiskDataPanel from '../components/ExternalRiskDataPanel';
import { ACCOUNTS, SITES, ENTITIES, POLICIES, CONTACTS, ORGANIZATIONS, siteName, userName } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

/* ------------------------------------------------------------------ *
 * P02 — Account Search
 * ------------------------------------------------------------------ */

export function AccountSearch() {
  const { authenticatedUser, requests } = useRep();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [coverage, setCoverage] = useState('');
  const [visitedBefore, setVisitedBefore] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  /* Cross-organization accounts never appear: the scope filter is applied before paging. */
  const inScopeSites = SITES.filter(site => authenticatedUser.accountScope.includes(site.accountId));

  const rows = inScopeSites
    .map(site => {
      const account = ACCOUNTS.find(item => item.id === site.accountId);
      const entity = ENTITIES.find(item => item.id === site.entityId);
      return { site, account, entity };
    })
    .filter(({ site, account, entity }) => {
      const term = query.trim().toLowerCase();
      const searchable = [account?.name, entity?.name, site.name, site.address, site.id, account?.externalId, site.policyRefs.join(' ')].join(' ').toLowerCase();
      if (term && !searchable.includes(term)) return false;
      if (coverage && account?.coverageStatus !== coverage) return false;
      if (visitedBefore) {
        if (site.lastVisited === 'Never') return true;
        if (site.lastVisited > visitedBefore) return false;
      }
      return true;
    });

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <PageHeader
        pageId="P02"
        subtitle="Server-paged search over entitled accounts, operating entities and sites. Results show identity and source freshness, never a parent name standing in for the visited operation."
      />

      <div className="rep-toolbar">
        <SearchField id="account-search" label="Search accounts and sites" value={query} onChange={value => { setQuery(value); setPage(1); }} placeholder="Account, entity, site, address, policy, source ID" />
        <div className="form-field">
          <label className="form-label" htmlFor="coverage-filter">Coverage status</label>
          <select id="coverage-filter" className="form-select" value={coverage} onChange={event => { setCoverage(event.target.value); setPage(1); }}>
            <option value="">Any</option>
            <option value="Active">Active</option>
            <option value="Non-renewed">Non-renewed</option>
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="visited-filter">Last visited on or before</label>
          <input id="visited-filter" className="form-input" type="date" value={visitedBefore} onChange={event => { setVisitedBefore(event.target.value); setPage(1); }} />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No records in your entitled scope"
          detail="Accounts outside the entitled scope are not returned at all. No records is distinct from access denied."
        />
      ) : (
        <>
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parent account</th><th>Operating entity</th><th>Site</th><th>Address</th>
                  <th>Coverage</th><th>Last visited</th><th>Open work</th><th>Source freshness</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ site, account, entity }) => (
                  <tr key={site.id}>
                    <td><button className="table-link" onClick={() => navigate('P03', { accountId: account.id })}>{account.name}</button></td>
                    <td>{entity?.name}</td>
                    <td><button className="table-link" onClick={() => navigate('P04', { accountId: account.id, siteId: site.id })}>{site.name}</button></td>
                    <td className="rep-muted">{site.address}</td>
                    <td><Badge status={account.coverageStatus === 'Active' ? 'Active' : 'Blocked'} label={account.coverageStatus} /></td>
                    <td>{site.lastVisited}</td>
                    <td>{requests.filter(request => request.siteIds.includes(site.id) && !['Closed', 'Released'].includes(request.state)).length}</td>
                    <td className="rep-muted">{account.sourceSystem} · {account.lastRefreshedAt.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rep-toolbar" style={{ marginTop: 'var(--space-4)' }}>
            <span className="rep-muted">
              Page {currentPage} of {pageCount} · {rows.length} scoped rows · deterministic ID tie-breaker
            </span>
            <button className="btn" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
            <button className="btn" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</button>
          </div>
        </>
      )}

      <Disclosure label="Scope and identity notes (F02)">
        <ul className="rep-bullet-list">
          <li>Organization membership is not an automatic grant to every subsidiary or location; account and site entitlements are verified separately.</li>
          <li>Reference records project Account 360, Producer 360 and policy sources. They are not an authoritative master.</li>
          <li>Search supports coverage status and visited or completed dates as agreed in discovery.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F02 — Accounts, sites and history', 'P02 /accounts']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P03 — Account Workspace
 * ------------------------------------------------------------------ */

export function AccountWorkspace({ accountId }) {
  const { requests, recommendations, servicePlans, can } = useRep();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  const account = ACCOUNTS.find(item => item.id === accountId);
  if (!account) return <EmptyState title="Account not found in this scope" detail="An out-of-scope identifier returns a consistent not-found result rather than disclosing another customer record." />;

  const organization = ORGANIZATIONS.find(item => item.id === account.organizationId);
  const entities = ENTITIES.filter(item => item.accountId === accountId);
  const sites = SITES.filter(item => item.accountId === accountId);
  const policies = POLICIES.filter(item => item.accountId === accountId);
  const contacts = CONTACTS.filter(item => item.accountId === accountId);
  const accountRequests = requests.filter(item => item.accountId === accountId);
  const accountRecommendations = recommendations.filter(item => item.accountId === accountId);
  const plans = servicePlans.filter(item => item.accountId === accountId);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'structure', label: 'Entities & sites', count: sites.length },
    { id: 'policies', label: 'Policies', count: policies.length },
    { id: 'contacts', label: 'Contacts', count: contacts.length },
    { id: 'surveys', label: 'Surveys', count: accountRequests.length },
    { id: 'recommendations', label: 'Recommendations', count: accountRecommendations.length },
    { id: 'plans', label: 'Service plans', count: plans.length },
  ];

  return (
    <div>
      <PageHeader
        pageId="P03"
        params={{ accountId }}
        title={account.name}
        subtitle={`${organization?.kind} organization ${organization?.name}. The selected tab and filter are preserved when you open and return from work.`}
        breadcrumb={<><Crumb pageId="P02">Accounts</Crumb><span>/</span><span>{account.id}</span></>}
        actions={(
          <>
            {can(PERMISSIONS.serviceInstructionRead) && (
              <button className="btn" onClick={() => navigate('P20', { accountId })}>RE instructions</button>
            )}
            {can(PERMISSIONS.surveyCreate) && (
              <button className="btn btn--primary" onClick={() => navigate('P05')}>New request</button>
            )}
          </>
        )}
      />

      <Tabs tabs={tabs} active={tab} onChange={setTab} ariaLabel="Account workspace tabs" />

      {tab === 'overview' && (
        <>
          <div className="rep-kpi-row">
            <Metric label="Sites in scope" value={sites.length} />
            <Metric label="Open requests" value={accountRequests.filter(item => !['Closed', 'Released'].includes(item.state)).length} />
            <Metric label="Open recommendations" value={accountRecommendations.filter(item => item.status === 'Open').length} tone="review" />
            <Metric label="Coverage" value={account.coverageStatus} tone={account.coverageStatus === 'Active' ? 'complete' : 'blocked'} detail={`Source ${account.sourceSystem}`} />
          </div>
          <div className="rep-grid rep-grid--two">
            <InfoCard title="Account identity">
              <DefinitionList items={[
                { label: 'Account', value: account.id },
                { label: 'Customer organization', value: `${organization?.name} (${account.organizationId})` },
                { label: 'Source system', value: `${account.sourceSystem} · ${account.externalId}` },
                { label: 'Last refreshed', value: account.lastRefreshedAt },
                { label: 'Producer', value: `${account.producer} (${account.producerId})` },
                { label: 'Classification', value: account.sicDescription },
                { label: 'Service tier', value: account.serviceTier },
              ]} />
            </InfoCard>
            <InfoCard title="Ownership and boundary">
              <p className="rep-muted">
                This projection supports risk-engineering work. It does not replace the authoritative account, producer,
                claims or policy systems, and it does not itself grant access to any site.
              </p>
              <p className="rep-muted">
                A customer portal session never exposes this internal workspace. Customer-facing content is a separate
                authorization surface delivered through Claims Connect.
              </p>
            </InfoCard>
          </div>
        </>
      )}

      {tab === 'structure' && entities.map(entity => (
        <InfoCard key={entity.id} title={`${entity.name} · ${entity.id}`}>
          <p className="rep-muted">{entity.relationship}</p>
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Site</th><th>Address</th><th>Construction</th><th>Sprinklered</th><th>Sq ft</th><th>Last visited</th><th>Policies</th></tr></thead>
              <tbody>
                {sites.filter(site => site.entityId === entity.id).map(site => (
                  <tr key={site.id}>
                    <td><button className="table-link" onClick={() => navigate('P04', { accountId, siteId: site.id })}>{site.name}</button></td>
                    <td className="rep-muted">{site.address}</td>
                    <td>{site.construction}</td>
                    <td>{site.sprinklered}</td>
                    <td>{site.squareFeet.toLocaleString()}</td>
                    <td>{site.lastVisited}</td>
                    <td className="rep-muted">{site.policyRefs.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>
      ))}

      {tab === 'policies' && (
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Policy</th><th>Line</th><th>Effective</th><th>Expiration</th><th>Status</th><th>Source</th></tr></thead>
            <tbody>
              {policies.map(policy => (
                <tr key={policy.id}>
                  <td>{policy.id}</td><td>{policy.line}</td><td>{policy.effective}</td>
                  <td>{policy.expiration}</td><td><Badge status="Active" label={policy.status} /></td>
                  <td className="rep-muted">{policy.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'contacts' && (
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Contact</th><th>Role</th><th>Site</th><th>Email</th><th>Phone</th><th>Application user</th></tr></thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact.id}>
                  <td>{contact.name}</td><td>{contact.role}</td>
                  <td>{contact.siteId ? siteName(contact.siteId) : 'Account level'}</td>
                  <td className="rep-muted">{contact.email}</td><td className="rep-muted">{contact.phone}</td>
                  <td>{contact.isApplicationUser ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'surveys' && (
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Request</th><th>Site</th><th>Service</th><th>Requested</th><th>Assignee</th><th>State</th></tr></thead>
            <tbody>
              {accountRequests.map(request => (
                <tr key={request.id}>
                  <td><button className="table-link" onClick={() => navigate('P06', { requestId: request.id })}>{request.id}</button></td>
                  <td>{request.siteIds.map(siteName).join(', ')}</td>
                  <td>{request.serviceType}</td>
                  <td>{request.requestedDate}</td>
                  <td>{request.assigneeId ? userName(request.assigneeId) : <span className="rep-muted">Unassigned</span>}</td>
                  <td><Badge status={request.state} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'recommendations' && (
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Recommendation</th><th>Title</th><th>Site</th><th>Created</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>
              {accountRecommendations.map(rec => (
                <tr key={rec.id}>
                  <td><button className="table-link" onClick={() => navigate('P14', { recommendationId: rec.id })}>{rec.id}</button></td>
                  <td>{rec.title}</td><td>{siteName(rec.siteId)}</td>
                  <td>{rec.createdAt}</td><td>{rec.dueDate}</td><td><Badge status={rec.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'plans' && (
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Plan</th><th>Year</th><th>Coordinator</th><th>Objectives</th><th>Status</th></tr></thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id}>
                  <td><button className="table-link" onClick={() => navigate('P19', { planId: plan.id })}>{plan.id}</button></td>
                  <td>{plan.year}</td><td>{userName(plan.coordinatorId)}</td>
                  <td>{plan.objectives.length}</td><td><Badge status={plan.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SyntheticFooter sources={['F02 — Accounts, sites and history', 'P03 /accounts/:accountId']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P04 — Site Workspace
 * ------------------------------------------------------------------ */

export function SiteWorkspace({ accountId, siteId }) {
  const { requests, recommendations, evidence, can } = useRep();
  const navigate = useNavigate();

  const site = SITES.find(item => item.id === siteId && item.accountId === accountId);
  if (!site) return <EmptyState title="Site not found in this scope" detail="Out-of-scope identifiers return a consistent not-found result." />;

  const account = ACCOUNTS.find(item => item.id === accountId);
  const entity = ENTITIES.find(item => item.id === site.entityId);
  const sitePolicies = POLICIES.filter(policy => site.policyRefs.includes(policy.id));
  const siteRequests = requests.filter(request => request.siteIds.includes(siteId));
  const siteRecommendations = recommendations.filter(rec => rec.siteId === siteId);
  const siteEvidence = evidence.filter(item => siteRequests.some(request => request.id === item.requestId));

  return (
    <div>
      <PageHeader
        pageId="P04"
        params={{ accountId, siteId }}
        title={site.name}
        subtitle={`${entity?.name} — operating entity of ${account?.name}. The parent account name is never used in place of the visited operation.`}
        breadcrumb={<>
          <Crumb pageId="P02">Accounts</Crumb><span>/</span>
          <Crumb pageId="P03" params={{ accountId }}>{account?.name}</Crumb><span>/</span>
          <span>{site.id}</span>
        </>}
        actions={can(PERMISSIONS.surveyCreate) && <button className="btn btn--primary" onClick={() => navigate('P05')}>Start authorized work</button>}
      />

      <div className="rep-grid rep-grid--two">
        <InfoCard title="Site and parent context">
          <DefinitionList items={[
            { label: 'Site', value: `${site.name} (${site.id})` },
            { label: 'Operating entity', value: `${entity?.name} (${entity?.id})` },
            { label: 'Parent account', value: `${account?.name} (${account?.id})` },
            { label: 'Address', value: site.address },
            { label: 'Time zone', value: site.timeZone },
            { label: 'Construction', value: site.construction },
            { label: 'Sprinklered', value: site.sprinklered },
            { label: 'Area', value: `${site.squareFeet.toLocaleString()} sq ft` },
            { label: 'Last visited', value: site.lastVisited },
          ]} />
        </InfoCard>
        <InfoCard title="Policy context">
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Policy</th><th>Line</th><th>Effective</th><th>Status</th></tr></thead>
              <tbody>
                {sitePolicies.map(policy => (
                  <tr key={policy.id}><td>{policy.id}</td><td>{policy.line}</td><td>{policy.effective}</td><td><Badge status="Active" label={policy.status} /></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
            Customer access to this site is verified separately from the policy association.
          </p>
        </InfoCard>
      </div>

      <InfoCard title="Work history at this site">
        {siteRequests.length === 0 ? <EmptyState title="No work recorded for this site" /> : (
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Request</th><th>Service</th><th>Requested</th><th>Engineer</th><th>State</th></tr></thead>
              <tbody>
                {siteRequests.map(request => (
                  <tr key={request.id}>
                    <td><button className="table-link" onClick={() => navigate('P06', { requestId: request.id })}>{request.id}</button></td>
                    <td>{request.serviceType}</td><td>{request.requestedDate}</td>
                    <td>{request.assigneeId ? userName(request.assigneeId) : 'Unassigned'}</td>
                    <td><Badge status={request.state} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </InfoCard>

      <InfoCard title="Open recommendations at this site">
        {siteRecommendations.filter(rec => rec.status !== 'Completed').length === 0
          ? <EmptyState title="No open recommendations" />
          : (
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Recommendation</th><th>Title</th><th>Due</th><th>Status</th></tr></thead>
                <tbody>
                  {siteRecommendations.filter(rec => rec.status !== 'Completed').map(rec => (
                    <tr key={rec.id}>
                      <td><button className="table-link" onClick={() => navigate('P14', { recommendationId: rec.id })}>{rec.id}</button></td>
                      <td>{rec.title}</td><td>{rec.dueDate}</td><td><Badge status={rec.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </InfoCard>

      <ExternalRiskDataPanel siteId={siteId} variant="site" />

      <InfoCard title="Evidence links">
        {siteEvidence.length === 0 ? <EmptyState title="No evidence linked to this site" /> : (
          <ul className="rep-plain-list">
            {siteEvidence.map(item => (
              <li key={item.id}>
                <button className="table-link" onClick={() => navigate('P12', { requestId: item.requestId })}>{item.fileName}</button>
                <span className="rep-muted"> · {item.context} · v{item.versions[0].version} · {item.versions[0].scanStatus}</span>
              </li>
            ))}
          </ul>
        )}
      </InfoCard>

      <SyntheticFooter sources={['F02 — Accounts, sites and history', 'P04 /accounts/:accountId/sites/:siteId']} />
    </div>
  );
}
