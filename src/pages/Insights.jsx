import { useState } from 'react';
import { useRep, useNavigate } from '../state/repHooks';
import {
  PageHeader, InfoCard, DefinitionList, EmptyState, SyntheticFooter, Disclosure, Metric, Badge,
} from '../components/primitives';
import { METRIC_DEFINITIONS, accountName, userName } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

const SCOPES = [
  { id: 'personal', label: 'Personal' },
  { id: 'team', label: 'Team', permission: PERMISSIONS.analyticsReadTeam },
  { id: 'account', label: 'Account' },
  { id: 'organization', label: 'Organization', permission: PERMISSIONS.analyticsReadTeam },
];

/* P27 — Management Insights (/insights) */
export function ManagementInsights() {
  const { requests, recommendations, servicePlans, timeEntries, authenticatedUser, can } = useRep();
  const navigate = useNavigate();
  const [scope, setScope] = useState('personal');
  const [metricId, setMetricId] = useState('METRIC-TURNAROUND');
  const [from, setFrom] = useState('2026-01-01');
  const [to, setTo] = useState('2026-12-31');

  const availableScopes = SCOPES.filter(item => !item.permission || can(item.permission));
  const metric = METRIC_DEFINITIONS.find(item => item.id === metricId) ?? METRIC_DEFINITIONS[0];

  /* Date filters change the supporting rows and therefore the computed value. */
  const samples = metric.samples.filter(sample => {
    if (sample.surveyDate === '—') return true;
    return sample.surveyDate >= from && sample.surveyDate <= to;
  });
  const numerator = samples.reduce((sum, sample) => sum + sample.days, 0);
  const denominator = samples.length;
  const computed = denominator ? (numerator / denominator) : 0;

  const scopedRequests = requests.filter(request => {
    if (scope === 'personal') return request.assigneeId === authenticatedUser.id;
    if (scope === 'account') return authenticatedUser.accountScope.includes(request.accountId);
    return true;
  });
  const scopedRecommendations = recommendations.filter(rec => {
    if (scope === 'personal') return rec.ownerId === authenticatedUser.id;
    if (scope === 'account') return authenticatedUser.accountScope.includes(rec.accountId);
    return true;
  });

  const planActions = servicePlans.flatMap(plan => plan.objectives.flatMap(objective => objective.actions));
  const planProgress = planActions.length ? Math.round((planActions.filter(action => action.status === 'Complete').length / planActions.length) * 100) : 0;
  const totalMinutes = timeEntries
    .filter(entry => scope !== 'personal' || entry.principalId === authenticatedUser.id)
    .reduce((sum, entry) => sum + entry.durationMinutes, 0);

  return (
    <div>
      <PageHeader
        pageId="P27"
        subtitle="Permission-filtered portfolio, workload and agreed operational measures with drill-through and export. Every measure states its definition."
        actions={can(PERMISSIONS.analyticsExport) && (
          <button className="btn" onClick={() => window.alert('Simulation only. The export reproduces the current server-authorized scope and filter, and records the audience context on the job.')}>
            Export visible scope
          </button>
        )}
      />

      <div className="rep-chip-row" role="group" aria-label="Analytics scope">
        {availableScopes.map(item => (
          <button key={item.id} className={`rep-chip${scope === item.id ? ' active' : ''}`} onClick={() => setScope(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="rep-kpi-row">
        <Metric label="Open requests" value={scopedRequests.filter(request => !['Closed', 'Released'].includes(request.state)).length} />
        <Metric label="Open recommendations" value={scopedRecommendations.filter(rec => rec.status === 'Open').length} tone="review" />
        <Metric label="Service plan progress" value={`${planProgress}%`} tone={planProgress > 50 ? 'complete' : 'muted'} detail="Complete actions / planned actions" />
        <Metric label="Activity time recorded" value={`${Math.round(totalMinutes / 60)}h`} detail="Sum of DurationMinutes" />
      </div>

      <div className="rep-toolbar">
        <div className="form-field">
          <label className="form-label" htmlFor="metric-select">Measure</label>
          <select id="metric-select" className="form-select" value={metricId} onChange={event => setMetricId(event.target.value)}>
            {METRIC_DEFINITIONS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="metric-from">From</label>
          <input id="metric-from" className="form-input" type="date" value={from} onChange={event => setFrom(event.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="metric-to">To</label>
          <input id="metric-to" className="form-input" type="date" value={to} onChange={event => setTo(event.target.value)} />
        </div>
      </div>

      <div className="rep-grid rep-grid--two">
        <InfoCard title={`${metric.name} — definition`}>
          <DefinitionList items={[
            { label: 'Identifier', value: metric.id },
            { label: 'Start event', value: metric.startEvent },
            { label: 'End event', value: metric.endEvent },
            { label: 'Unit', value: metric.unit },
            { label: 'Aggregation', value: metric.aggregation },
            { label: 'Numerator', value: metric.numerator },
            { label: 'Denominator', value: metric.denominator },
            { label: 'Excludes manager review', value: String(metric.excludesManagerReview) },
            { label: 'Returned review policy', value: metric.returnedReviewPolicy },
            { label: 'Approved performance target', value: <Badge status={metric.isApprovedPerformanceTarget ? 'Complete' : 'Blocked'} label={String(metric.isApprovedPerformanceTarget)} /> },
          ]} />
        </InfoCard>

        <InfoCard title="Computed value and supporting rows">
          <div className="rep-preview">
            <h4>{metric.name}</h4>
            <p style={{ fontSize: 22, fontWeight: 700 }}>
              {denominator ? computed.toFixed(1) : '—'} <span style={{ fontSize: 13, fontWeight: 400 }}>{metric.unit}</span>
            </p>
            <p className="rep-preview__rule">
              Formula shown explicitly: {numerator} ({metric.numerator.toLowerCase()}) ÷ {denominator} ({metric.denominator.toLowerCase()}).
              Changing the date filter changes both the supporting rows and this value.
            </p>
          </div>
          {samples.length === 0 ? <EmptyState title="No supporting rows in this date range" /> : (
            <div className="rep-table-scroll" style={{ marginTop: 'var(--space-3)' }}>
              <table className="data-table">
                <thead><tr><th>Subject</th><th>Start</th><th>End</th><th>Value</th></tr></thead>
                <tbody>
                  {samples.map((sample, index) => (
                    <tr key={index}>
                      <td>
                        {sample.requestId.startsWith('REQ-')
                          ? <button className="table-link" onClick={() => navigate('P06', { requestId: sample.requestId })}>{sample.requestId}</button>
                          : sample.requestId.startsWith('PLAN-')
                            ? <button className="table-link" onClick={() => navigate('P19', { planId: sample.requestId })}>{sample.requestId}</button>
                            : sample.requestId.startsWith('ACCT-')
                              ? <button className="table-link" onClick={() => navigate('P03', { accountId: sample.requestId })}>{accountName(sample.requestId)}</button>
                              : sample.requestId}
                      </td>
                      <td>{sample.surveyDate}</td>
                      <td>{sample.inReviewDate}</td>
                      <td>{sample.days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </InfoCard>
      </div>

      <InfoCard title="Portfolio and workload in this scope">
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Request</th><th>Account</th><th>Assignee</th><th>Requested</th><th>State</th></tr></thead>
            <tbody>
              {scopedRequests.map(request => (
                <tr key={request.id}>
                  <td><button className="table-link" onClick={() => navigate('P06', { requestId: request.id })}>{request.id}</button></td>
                  <td>{accountName(request.accountId)}</td>
                  <td>{request.assigneeId ? userName(request.assigneeId) : 'Unassigned'}</td>
                  <td>{request.requestedDate}</td>
                  <td><Badge status={request.state} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoCard>

      <Disclosure label="Measure boundaries (F17)">
        <ul className="rep-bullet-list">
          <li>Personal, team, account and organization views each use explicit grants.</li>
          <li>Engineering turnaround, review duration, open recommendations, service-plan progress and activity time are separate measures with separate definitions.</li>
          <li>Sensitive employee metrics are not customer projections.</li>
          <li>No measure here is an approved performance target; the definitions remain open decisions.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter
        openDecisions={['Agreed turnaround definition and returned-review policy', 'Approved operational targets']}
        sources={['F17 — Operational measures and exports', 'P27 /insights']}
      />
    </div>
  );
}
