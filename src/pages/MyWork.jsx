import { useMemo, useState } from 'react';
import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';
import { PageHeader, Badge, Metric, Tabs, EmptyState, SearchField, SyntheticFooter, Disclosure } from '../components/primitives';
import { accountName, siteName, userName, TODAY } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

const SCOPES = [
  { id: 'personal', label: 'My work', permission: PERMISSIONS.workReadOwn },
  { id: 'group', label: 'Team work', permission: PERMISSIONS.workReadTeam },
  { id: 'organization', label: 'Organization', permission: PERMISSIONS.workReadTeam },
];

function daysUntil(dateString) {
  if (!dateString) return null;
  const diff = (new Date(dateString) - new Date(TODAY)) / 86400000;
  return Math.round(diff);
}

export default function MyWork() {
  const state = useRep();
  const { authenticatedUser, requests, recommendations, tasks, visits, savedViews, savedViewId, workScope, can } = state;
  const dispatch = useRepDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('requests');

  const availableScopes = SCOPES.filter(scope => can(scope.permission));
  const scope = availableScopes.some(item => item.id === workScope) ? workScope : 'personal';
  const savedView = savedViews.find(view => view.id === savedViewId) ?? null;
  const mySavedViews = savedViews.filter(view => view.ownerId === authenticatedUser.id);

  /* Scope resolution is illustrative: the engine resolves the same scope for counts and rows. */
  const scopedRequests = useMemo(() => requests.filter(request => {
    if (request.state === 'Closed') return false;
    if (scope === 'personal') return request.assigneeId === authenticatedUser.id || request.requesterId === authenticatedUser.id;
    if (scope === 'group') return authenticatedUser.accountScope.includes(request.accountId);
    return true;
  }), [requests, scope, authenticatedUser]);

  const scopedRecommendations = useMemo(() => recommendations.filter(rec => {
    if (scope === 'personal') return rec.ownerId === authenticatedUser.id;
    if (scope === 'group') return authenticatedUser.accountScope.includes(rec.accountId);
    return true;
  }), [recommendations, scope, authenticatedUser]);

  const scopedTasks = useMemo(() => tasks.filter(task => {
    if (scope === 'personal') return task.ownerId === authenticatedUser.id;
    return true;
  }), [tasks, scope, authenticatedUser]);

  const scopedVisits = useMemo(() => visits.filter(visit => {
    if (scope === 'personal') return visit.engineerId === authenticatedUser.id;
    return true;
  }), [visits, scope, authenticatedUser]);

  const viewFiltered = useMemo(() => {
    if (!savedView) return scopedRequests;
    return scopedRequests.filter(request => {
      const filters = savedView.filters;
      if (filters.status && !filters.status.includes(request.state)) return false;
      if (filters.assignee === 'self' && request.assigneeId !== authenticatedUser.id) return false;
      if (filters.assignee === 'none' && request.assigneeId) return false;
      if (filters.origin && request.origin !== filters.origin) return false;
      if (filters.dueBefore && request.requestedDate > filters.dueBefore) return false;
      return true;
    });
  }, [savedView, scopedRequests, authenticatedUser]);

  /* Search filters both the displayed rows and the counts (F01 acceptance scenario). */
  const term = query.trim().toLowerCase();
  const matches = value => !term || String(value).toLowerCase().includes(term);

  const filteredRequests = viewFiltered.filter(request =>
    matches([request.id, accountName(request.accountId), request.siteIds.map(siteName).join(' '), request.state, request.serviceType, userName(request.assigneeId)].join(' ')));
  const filteredRecommendations = scopedRecommendations.filter(rec =>
    matches([rec.id, rec.title, accountName(rec.accountId), siteName(rec.siteId), rec.status].join(' ')));
  const filteredTasks = scopedTasks.filter(task => matches([task.id, task.title, task.status, task.requestId ?? ''].join(' ')));
  const filteredVisits = scopedVisits.filter(visit => matches([visit.id, visit.requestId, siteName(visit.siteId), visit.status].join(' ')));

  const dueSoon = filteredRequests.filter(request => {
    const days = daysUntil(request.requestedDate);
    return days !== null && days <= 14;
  });

  const tabs = [
    { id: 'requests', label: 'Requests', count: filteredRequests.length },
    { id: 'recommendations', label: 'Recommendations', count: filteredRecommendations.length },
    { id: 'tasks', label: 'Tasks', count: filteredTasks.length },
    { id: 'calendar', label: 'Visits', count: filteredVisits.length },
  ];

  return (
    <div>
      <PageHeader
        pageId="P01"
        title={`Work for ${authenticatedUser.name}`}
        subtitle="Counts and rows resolve through the same account and assignment scope. A saved view is a preference; it never grants access."
        actions={can(PERMISSIONS.surveyCreate) && (
          <button className="btn btn--primary" onClick={() => navigate('P05')}>New request</button>
        )}
      />

      <div className="rep-chip-row" role="group" aria-label="Work scope">
        {availableScopes.map(item => (
          <button
            key={item.id}
            className={`rep-chip${scope === item.id ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'SET_WORK_SCOPE', payload: item.id })}
          >
            {item.label}
          </button>
        ))}
        {availableScopes.length === 1 && (
          <span className="rep-muted">
            Team and organization scopes require <code>Work.ReadTeam</code>. The difference between the engineer and
            manager views is a scope decision, not a hidden menu item.
          </span>
        )}
      </div>

      <div className="rep-kpi-row">
        <Metric label="Open requests in scope" value={filteredRequests.length} detail={term ? 'Filtered by search' : 'Scoped count'} />
        <Metric label="Due within 14 days" value={dueSoon.length} tone={dueSoon.length ? 'review' : 'muted'} detail={`Relative to ${TODAY}`} />
        <Metric label="Open recommendations" value={filteredRecommendations.filter(rec => rec.status === 'Open').length} tone="review" detail="Owned in this scope" />
        <Metric label="Tasks not complete" value={filteredTasks.filter(task => task.status !== 'Complete').length} detail="Includes blocked items" />
      </div>

      <div className="rep-toolbar">
        <SearchField
          id="work-search"
          label="Search work in scope"
          value={query}
          onChange={setQuery}
          placeholder="Request, account, site, status, assignee, recommendation"
        />
        <div className="form-field">
          <label className="form-label" htmlFor="saved-view">Saved filter</label>
          <select
            id="saved-view"
            className="form-select"
            value={savedViewId ?? ''}
            onChange={event => dispatch({ type: 'SET_SAVED_VIEW', payload: event.target.value || null })}
          >
            <option value="">No saved filter</option>
            {mySavedViews.map(view => <option key={view.id} value={view.id}>{view.name}</option>)}
          </select>
        </div>
        {savedView && (
          <div className="rep-muted" style={{ maxWidth: 320 }}>
            <strong>{savedView.id}</strong> · owner {userName(savedView.ownerId)} · sort {savedView.sort.join(', ')} ·
            counts are scoped: {String(savedView.countsAreScoped)}
          </div>
        )}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} ariaLabel="Work queues" />

      {tab === 'requests' && (
        filteredRequests.length === 0
          ? <EmptyState title="No records in this scope" detail="No records is distinct from access denied. This scope resolved successfully and returned nothing." />
          : (
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Request</th><th>Account</th><th>Site</th><th>Service</th>
                    <th>Requested</th><th>Committed</th><th>Assignee</th><th>State</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(request => (
                    <tr key={request.id}>
                      <td><button className="table-link" onClick={() => navigate('P06', { requestId: request.id })}>{request.id}</button></td>
                      <td>{accountName(request.accountId)}</td>
                      <td>{request.siteIds.map(siteName).join(', ')}</td>
                      <td>{request.serviceType}</td>
                      <td>{request.requestedDate}</td>
                      <td>{request.committedDate ?? <span className="rep-muted">Not committed</span>}</td>
                      <td>{request.assigneeId ? userName(request.assigneeId) : <span className="rep-muted">Unassigned</span>}</td>
                      <td><Badge status={request.state} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}

      {tab === 'recommendations' && (
        filteredRecommendations.length === 0
          ? <EmptyState title="No recommendations in this scope" />
          : (
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Recommendation</th><th>Title</th><th>Account</th><th>Site</th><th>Due</th><th>Status</th></tr></thead>
                <tbody>
                  {filteredRecommendations.map(rec => (
                    <tr key={rec.id}>
                      <td><button className="table-link" onClick={() => navigate('P14', { recommendationId: rec.id })}>{rec.id}</button></td>
                      <td>{rec.title}</td>
                      <td>{accountName(rec.accountId)}</td>
                      <td>{siteName(rec.siteId)}</td>
                      <td>{rec.dueDate}</td>
                      <td><Badge status={rec.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}

      {tab === 'tasks' && (
        filteredTasks.length === 0
          ? <EmptyState title="No tasks in this scope" />
          : (
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Task</th><th>Title</th><th>Request</th><th>Type</th><th>Due</th><th>Owner</th><th>Status</th></tr></thead>
                <tbody>
                  {filteredTasks.map(task => (
                    <tr key={task.id}>
                      <td><button className="table-link" onClick={() => navigate('P09', { taskId: task.id })}>{task.id}</button></td>
                      <td>{task.title}</td>
                      <td>{task.requestId ? <button className="table-link" onClick={() => navigate('P06', { requestId: task.requestId })}>{task.requestId}</button> : <span className="rep-muted">Account work</span>}</td>
                      <td>{task.type}</td>
                      <td>{task.dueDate}</td>
                      <td>{userName(task.ownerId)}</td>
                      <td><Badge status={task.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}

      {tab === 'calendar' && (
        filteredVisits.length === 0
          ? <EmptyState title="No visits in this scope" />
          : (
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Visit</th><th>Request</th><th>Site</th><th>Start</th><th>Time zone</th><th>Status</th></tr></thead>
                <tbody>
                  {filteredVisits.map(visit => (
                    <tr key={visit.id}>
                      <td>{visit.id}</td>
                      <td><button className="table-link" onClick={() => navigate('P06', { requestId: visit.requestId })}>{visit.requestId}</button></td>
                      <td>{siteName(visit.siteId)}</td>
                      <td>{visit.start.replace('T', ' ')}</td>
                      <td>{visit.timeZone}</td>
                      <td><Badge status={visit.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}

      <Disclosure label="How this queue behaves (F01 acceptance scenarios)">
        <ul className="rep-bullet-list">
          <li>Search filters the displayed rows and the counts above together.</li>
          <li>Opening a row keeps the active scope and saved filter, so returning restores the same queue.</li>
          <li>Engineer and manager views differ by resolved scope. A hidden menu item is never the access control.</li>
          <li>Saved-filter settings live in the principal profile, scoped by organization and page. They cannot carry grants.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter
        openDecisions={['Final dashboard priorities and metric definitions']}
        sources={['F01 — My work & queues', 'P01 /workbench']}
      />
    </div>
  );
}
