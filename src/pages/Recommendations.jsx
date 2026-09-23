import { useState } from 'react';
import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';
import {
  PageHeader, Badge, InfoCard, DefinitionList, EmptyState, SearchField, SyntheticFooter,
  Disclosure, Crumb, Metric, Field, Tabs,
} from '../components/primitives';
import { ACCOUNTS, SITES, accountName, siteName, userName, TEMPLATES, TODAY } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

/* ------------------------------------------------------------------ *
 * P13 — Recommendation Queue
 * ------------------------------------------------------------------ */

export function RecommendationQueue() {
  const { recommendations, authenticatedUser, can } = useRep();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Open');
  const [dueBefore, setDueBefore] = useState('');
  const [showReminderPreview, setShowReminderPreview] = useState(false);

  const scoped = recommendations.filter(rec => authenticatedUser.accountScope.includes(rec.accountId));

  const filtered = scoped.filter(rec => {
    const term = query.trim().toLowerCase();
    if (term && ![rec.id, rec.title, accountName(rec.accountId), siteName(rec.siteId), rec.status].join(' ').toLowerCase().includes(term)) return false;
    if (accountFilter && rec.accountId !== accountFilter) return false;
    if (siteFilter && rec.siteId !== siteFilter) return false;
    if (statusFilter && rec.status !== statusFilter) return false;
    if (dueBefore && rec.dueDate > dueBefore) return false;
    return true;
  });

  /* Reminder preview contains only outstanding items; completed work stays in history. */
  const reminderItems = scoped.filter(rec => rec.status !== 'Completed');

  return (
    <div>
      <PageHeader
        pageId="P13"
        subtitle="Account, site, status and due filters over outstanding items, with controlled exports that reproduce the server-authorized scope."
        actions={can(PERMISSIONS.recommendationExport) && (
          <button className="btn" onClick={() => window.alert(`Simulation only. An export job would reproduce the ${filtered.length} server-authorized rows for this filter, not whatever happens to be loaded in the browser.`)}>
            Export scoped results
          </button>
        )}
      />

      <div className="rep-kpi-row">
        <Metric label="Open in scope" value={scoped.filter(rec => rec.status === 'Open').length} tone="review" />
        <Metric label="Pending staff review" value={scoped.filter(rec => rec.status === 'PendingReview').length} />
        <Metric label="Completed" value={scoped.filter(rec => rec.status === 'Completed').length} tone="complete" />
        <Metric label="Past due" value={scoped.filter(rec => rec.status !== 'Completed' && rec.dueDate < TODAY).length} tone="blocked" detail={`Relative to ${TODAY}`} />
      </div>

      <div className="rep-toolbar">
        <SearchField id="rec-search" label="Search recommendations" value={query} onChange={setQuery} placeholder="Identifier, title, account, site" />
        <div className="form-field">
          <label className="form-label" htmlFor="rec-account">Account</label>
          <select id="rec-account" className="form-select" value={accountFilter} onChange={event => { setAccountFilter(event.target.value); setSiteFilter(''); }}>
            <option value="">Any in scope</option>
            {ACCOUNTS.filter(account => authenticatedUser.accountScope.includes(account.id)).map(account => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="rec-site">Site</label>
          <select id="rec-site" className="form-select" value={siteFilter} onChange={event => setSiteFilter(event.target.value)}>
            <option value="">Any</option>
            {SITES.filter(site => !accountFilter || site.accountId === accountFilter).map(site => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="rec-status">Status</label>
          <select id="rec-status" className="form-select" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
            <option value="">Any</option>
            <option value="Open">Open</option>
            <option value="PendingReview">Pending review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="rec-due">Due on or before</label>
          <input id="rec-due" className="form-input" type="date" value={dueBefore} onChange={event => setDueBefore(event.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? <EmptyState title="No recommendations match this filter" /> : (
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Recommendation</th><th>Title</th><th>Account</th><th>Site</th><th>Owner</th><th>Created</th><th>Due</th><th>Issued rev</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(rec => (
                <tr key={rec.id}>
                  <td><button className="table-link" onClick={() => navigate('P14', { recommendationId: rec.id })}>{rec.id}</button></td>
                  <td>{rec.title}</td>
                  <td>{accountName(rec.accountId)}</td>
                  <td>{siteName(rec.siteId)}</td>
                  <td>{userName(rec.ownerId)}</td>
                  <td>{rec.createdAt}</td>
                  <td className={rec.status !== 'Completed' && rec.dueDate < TODAY ? 'rep-diff-removed' : ''}>{rec.dueDate}</td>
                  <td>{rec.issuedRevision}</td>
                  <td><Badge status={rec.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InfoCard
        title="Follow-up reminder preview"
        actions={<button className="btn" onClick={() => setShowReminderPreview(!showReminderPreview)}>{showReminderPreview ? 'Hide' : 'Show'} preview</button>}
      >
        <p className="rep-muted rep-section-intro">
          Reminder generation is separate from automatic sending. Nothing is sent from this wireframe, and the send policy
          is unapproved.
        </p>
        {showReminderPreview && (
          reminderItems.length === 0 ? <EmptyState title="No outstanding items to remind about" /> : (
            <div className="rep-preview">
              <h4>Draft follow-up — outstanding recommendations only</h4>
              <ul className="rep-bullet-list">
                {reminderItems.map(rec => <li key={rec.id}><code className="rep-code">{rec.id}</code> — {rec.title} (due {rec.dueDate})</li>)}
              </ul>
              <p className="rep-preview__rule">
                Completed items are excluded from the reminder but remain in the recommendation history. Completing an item
                removes it from this preview, not from the record.
              </p>
            </div>
          )
        )}
      </InfoCard>

      <SyntheticFooter sources={['F07 — Recommendations and follow-up', 'P13 /recommendations']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P14 — Recommendation Detail
 * ------------------------------------------------------------------ */

export function RecommendationDetail({ recommendationId }) {
  const { recommendations, evidence, can, authenticatedUser } = useRep();
  const dispatch = useRepDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState('wording');
  const [verificationNote, setVerificationNote] = useState('');

  const rec = recommendations.find(item => item.id === recommendationId);
  if (!rec) return <EmptyState title="Recommendation not found in this scope" />;

  const template = TEMPLATES.find(item => item.id === rec.templateId);
  const originalEvidence = evidence.filter(item => item.recommendationId === rec.id && item.context !== 'CustomerMessageAttachment');
  const responseEvidence = evidence.filter(item => item.recommendationId === rec.id && item.context === 'CustomerMessageAttachment');
  const customerResponses = rec.complianceEvents.filter(event => event.actorAudience === 'Customer');

  const tabs = [
    { id: 'wording', label: 'Governed wording' },
    { id: 'versions', label: 'Issued versions', count: rec.revisions.length },
    { id: 'compliance', label: 'Live compliance', count: rec.complianceEvents.length },
    { id: 'evidence', label: 'Evidence', count: originalEvidence.length + responseEvidence.length },
  ];

  return (
    <div>
      <PageHeader
        pageId="P14"
        params={{ recommendationId }}
        title={rec.title}
        subtitle={`${accountName(rec.accountId)} · ${siteName(rec.siteId)} · identity preserved across surveys`}
        breadcrumb={<><Crumb pageId="P13">Recommendations</Crumb><span>/</span><span>{rec.id}</span></>}
      />

      <div className="claim-strip">
        <div className="claim-strip__item"><span className="claim-strip__label">Status</span><span className="claim-strip__value"><Badge status={rec.status} /></span></div>
        <div className="claim-strip__item"><span className="claim-strip__label">Severity</span><span className="claim-strip__value">{rec.severity}</span></div>
        <div className="claim-strip__item"><span className="claim-strip__label">Created</span><span className="claim-strip__value">{rec.createdAt}</span></div>
        <div className="claim-strip__item"><span className="claim-strip__label">Due</span><span className="claim-strip__value">{rec.dueDate}</span></div>
        <div className="claim-strip__item"><span className="claim-strip__label">Owner</span><span className="claim-strip__value">{userName(rec.ownerId)}</span></div>
        <div className="claim-strip__item"><span className="claim-strip__label">Issued revision</span><span className="claim-strip__value">{rec.issuedRevision}</span></div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} ariaLabel="Recommendation tabs" />

      {tab === 'wording' && (
        <div className="rep-grid rep-grid--two">
          <InfoCard title="Issued wording">
            <div className="rep-preview">{rec.issuedWording}</div>
            <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
              Governed wording from {template?.name} v{rec.templateVersion}. Amending issued wording is a different
              permission from changing the compliance status.
            </p>
            {can(PERMISSIONS.recommendationAmendIssued) && (
              <button className="btn" onClick={() => window.alert('Simulation only. Amending issued wording creates a new issued revision with a reason, and does not alter previously released snapshots.')}>
                Amend issued wording
              </button>
            )}
          </InfoCard>
          <InfoCard title="Identity and continuity">
            <DefinitionList items={[
              { label: 'Recommendation', value: rec.id },
              { label: 'Wording template', value: `${rec.templateId} v${rec.templateVersion}` },
              { label: 'Linked surveys', value: rec.surveyLinks.length ? rec.surveyLinks.join(', ') : 'None' },
              { label: 'Carried forward from', value: rec.carriedForwardFrom ?? 'Not carried forward' },
              { label: 'Original author', value: rec.originalAuthor ? `${userName(rec.originalAuthor)} (retained)` : userName(rec.ownerId) },
              { label: 'Follow-up offsets', value: `${rec.followUp.dayOffsets.join(', ')} days` },
              { label: 'Send policy', value: rec.followUp.sendPolicy },
              { label: 'Excludes completed', value: String(rec.followUp.excludeCompleted) },
            ]} />
          </InfoCard>
        </div>
      )}

      {tab === 'versions' && (
        <InfoCard title="Issued versions">
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Revision</th><th>Issued</th><th>By</th><th>Reason</th><th>Wording hash</th></tr></thead>
              <tbody>
                {rec.revisions.map(revision => (
                  <tr key={revision.revision}>
                    <td>{revision.revision}</td><td>{revision.issuedAt}</td>
                    <td>{userName(revision.by)}</td><td className="rep-muted">{revision.reason}</td>
                    <td><code className="rep-code">{revision.wordingHash}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rec.surveyLinks.length > 0 && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <span className="rep-muted">Survey associations: </span>
              {rec.surveyLinks.map(surveyId => (
                <button key={surveyId} className="table-link" style={{ marginRight: 8 }} onClick={() => navigate('P10', { surveyId })}>{surveyId}</button>
              ))}
            </div>
          )}
        </InfoCard>
      )}

      {tab === 'compliance' && (
        <>
          <InfoCard title="Compliance history">
            {rec.complianceEvents.length === 0 ? <EmptyState title="No compliance events recorded" /> : (
              <ul className="rep-timeline">
                {rec.complianceEvents.map((event, index) => (
                  <li key={index} className="rep-timeline__item">
                    <div className="rep-timeline__meta">
                      {event.at} · {userName(event.actor) !== 'Unassigned' ? userName(event.actor) : event.actor} · {event.actorAudience} · {event.type}
                    </div>
                    {event.detail}
                  </li>
                ))}
              </ul>
            )}
          </InfoCard>

          {can(PERMISSIONS.recommendationUpdateStatus) && (
            <InfoCard title="Staff verification and closure">
              <p className="rep-muted rep-section-intro">
                Customer responses require staff validation. Closure is staff-controlled: a customer response alone never
                closes a recommendation.
              </p>
              {customerResponses.length > 0 && (
                <div className="rep-preview" style={{ marginBottom: 'var(--space-3)' }}>
                  <h4>Latest customer response</h4>
                  <p>{customerResponses[customerResponses.length - 1].detail}</p>
                </div>
              )}
              <div className="form-grid">
                <Field label="Verification note" span={2} type="textarea" value={verificationNote} onChange={setVerificationNote} />
              </div>
              <div className="rep-card-head__actions">
                <button className="btn" disabled={rec.status === 'Open'} onClick={() => dispatch({ type: 'SET_RECOMMENDATION_STATUS', payload: { recommendationId: rec.id, status: 'Open', detail: verificationNote || 'Reopened' } })}>
                  Set open
                </button>
                <button className="btn" onClick={() => dispatch({ type: 'SET_RECOMMENDATION_STATUS', payload: { recommendationId: rec.id, status: 'PendingReview', detail: verificationNote || 'Awaiting staff verification' } })}>
                  Mark pending review
                </button>
                <button className="btn btn--primary" disabled={!verificationNote.trim()} onClick={() => { dispatch({ type: 'SET_RECOMMENDATION_STATUS', payload: { recommendationId: rec.id, status: 'Completed', detail: verificationNote } }); setVerificationNote(''); }}>
                  Record staff-verified completion
                </button>
              </div>
            </InfoCard>
          )}

          {can(PERMISSIONS.recommendationRespond) && authenticatedUser.role.startsWith('customer') && (
            <InfoCard title="Respond">
              <div className="form-grid">
                <Field label="Your response" span={2} type="textarea" value={verificationNote} onChange={setVerificationNote} />
              </div>
              <button className="btn btn--primary" disabled={!verificationNote.trim()} onClick={() => { dispatch({ type: 'ADD_RECOMMENDATION_RESPONSE', payload: { recommendationId: rec.id, detail: verificationNote } }); setVerificationNote(''); }}>
                Post response
              </button>
            </InfoCard>
          )}
        </>
      )}

      {tab === 'evidence' && (
        <div className="rep-grid rep-grid--two">
          <InfoCard title="Original finding evidence">
            {originalEvidence.length === 0 ? <EmptyState title="No original evidence" /> : (
              <ul className="rep-plain-list">
                {originalEvidence.map(item => (
                  <li key={item.id}>
                    <button className="table-link" onClick={() => navigate('P12', { requestId: item.requestId })}>{item.fileName}</button>
                    <span className="rep-muted"> · v{item.versions[0].version} · {item.versions[0].scanStatus} · {item.classification}</span>
                  </li>
                ))}
              </ul>
            )}
          </InfoCard>
          <InfoCard title="Customer response evidence">
            {responseEvidence.length === 0 ? <EmptyState title="No response evidence" detail="Original evidence and response evidence stay distinguishable." /> : (
              <ul className="rep-plain-list">
                {responseEvidence.map(item => (
                  <li key={item.id}>
                    <button className="table-link" onClick={() => navigate('P12', { requestId: item.requestId })}>{item.fileName}</button>
                    <span className="rep-muted"> · v{item.versions[0].version} · {item.versions[0].scanStatus} · {item.classification}</span>
                  </li>
                ))}
              </ul>
            )}
          </InfoCard>
        </div>
      )}

      <Disclosure label="Recommendation safeguards (F07)">
        <ul className="rep-bullet-list">
          <li>Changing compliance status is a different permission from amending issued wording.</li>
          <li>Recommendation identity survives a survey copy, so continuity is preserved across years.</li>
          <li>Completing an item removes it from the reminder preview, not from the history.</li>
          <li>Severity taxonomy remains to be assessed; no risk score is calculated here.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F07 — Recommendations and follow-up', 'P14 /recommendations/:recommendationId']} />
    </div>
  );
}
