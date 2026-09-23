import { useState } from 'react';
import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';
import {
  PageHeader, Badge, InfoCard, DefinitionList, EmptyState, SyntheticFooter, Disclosure, Crumb, Field,
} from '../components/primitives';
import { userName } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

/* ------------------------------------------------------------------ *
 * P21 — Messages and Information Requests
 * ------------------------------------------------------------------ */

export function CollaborationPage({ requestId }) {
  const { threads, informationRequests, requests, evidence, authenticatedUser, can } = useRep();
  const dispatch = useRepDispatch();
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [draft, setDraft] = useState('');

  const request = requests.find(item => item.id === requestId);
  if (!request) return <EmptyState title="Request not found in this scope" />;

  const isCustomer = authenticatedUser.role.startsWith('customer');
  const visibleThreads = threads.filter(thread => thread.requestId === requestId && (!isCustomer || thread.audience === 'Shared'));
  const activeThread = visibleThreads.find(thread => thread.id === activeThreadId) ?? visibleThreads[0] ?? null;
  const requestInfo = informationRequests.filter(item => item.requestId === requestId);

  return (
    <div>
      <PageHeader
        pageId="P21"
        params={{ requestId }}
        subtitle="Internal and shared threads are distinct conversations. Targeted questions grant narrow contribution access with a due date, and staff review every contribution."
        breadcrumb={<><Crumb pageId="P06" params={{ requestId }}>{requestId}</Crumb><span>/</span><span>collaboration</span></>}
      />

      <div className="rep-split">
        <div>
          <InfoCard title="Threads">
            <div className="rep-chip-row">
              {visibleThreads.map(thread => (
                <button
                  key={thread.id}
                  className={`rep-chip${activeThread?.id === thread.id ? ' active' : ''}`}
                  onClick={() => setActiveThreadId(thread.id)}
                >
                  {thread.subject} <Badge status={thread.audience === 'Internal' ? 'Open' : 'Review'} label={thread.audience} />
                </button>
              ))}
            </div>

            {!activeThread ? <EmptyState title="No threads visible to this audience" /> : (
              <>
                <ul className="rep-timeline">
                  {activeThread.messages.map(message => (
                    <li key={message.id} className="rep-timeline__item">
                      <div className="rep-timeline__meta">
                        {message.at.replace('T', ' ').slice(0, 16)} · {userName(message.authorId)}
                      </div>
                      {message.body}
                    </li>
                  ))}
                </ul>
                <div className="form-grid">
                  <Field label={`Post to the ${activeThread.audience.toLowerCase()} thread`} span={2} type="textarea" value={draft} onChange={setDraft} />
                </div>
                <button
                  className="btn btn--primary"
                  disabled={!draft.trim() || (isCustomer && authenticatedUser.role === 'customer_viewer')}
                  onClick={() => { dispatch({ type: 'POST_MESSAGE', payload: { threadId: activeThread.id, body: draft } }); setDraft(''); }}
                >
                  Post message
                </button>
                {authenticatedUser.role === 'customer_viewer' && (
                  <p className="rep-muted" style={{ marginTop: 'var(--space-2)' }}>
                    A viewer cannot post. Posting requires a contributor role.
                  </p>
                )}
              </>
            )}
          </InfoCard>
        </div>

        <div>
          <InfoCard title="Information requests">
            {requestInfo.length === 0 ? <EmptyState title="No targeted questions on this request" /> : requestInfo.map(item => (
              <div key={item.id} style={{ marginBottom: 'var(--space-4)' }}>
                <DefinitionList items={[
                  { label: 'Information request', value: item.id },
                  { label: 'Scope', value: item.scope },
                  { label: 'Recipient', value: `${userName(item.recipientId)} (${item.recipientOrganizationId})` },
                  { label: 'Due date', value: item.dueDate },
                  { label: 'Status', value: <Badge status={item.status} /> },
                ]} />
                {item.contributions.length > 0 && (
                  <div className="rep-table-scroll" style={{ marginTop: 'var(--space-2)' }}>
                    <table className="data-table">
                      <thead><tr><th>Contribution</th><th>By</th><th>Answer</th><th>Evidence</th><th>Staff review</th><th /></tr></thead>
                      <tbody>
                        {item.contributions.map(contribution => (
                          <tr key={contribution.id}>
                            <td><code className="rep-code">{contribution.id}</code></td>
                            <td>{userName(contribution.byId)}</td>
                            <td>{contribution.answer}</td>
                            <td className="rep-muted">
                              {contribution.evidenceId
                                ? `${evidence.find(entry => entry.id === contribution.evidenceId)?.fileName} (${evidence.find(entry => entry.id === contribution.evidenceId)?.versions[0].scanStatus})`
                                : 'None'}
                            </td>
                            <td><Badge status={contribution.staffReviewStatus === 'Pending' ? 'Pending' : 'Complete'} label={contribution.staffReviewStatus} /></td>
                            <td>
                              {can(PERMISSIONS.workReadTeam) && contribution.staffReviewStatus === 'Pending' && (
                                <button className="btn" onClick={() => dispatch({ type: 'REVIEW_CONTRIBUTION', payload: { informationRequestId: item.id, contributionId: contribution.id, status: 'Accepted' } })}>
                                  Accept
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {isCustomer && item.recipientId === authenticatedUser.id && item.status !== 'Responded' && (
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <Field label="Your answer" span={2} type="textarea" value={draft} onChange={setDraft} />
                    <button className="btn" disabled={!draft.trim()} onClick={() => { dispatch({ type: 'RESPOND_INFORMATION_REQUEST', payload: { informationRequestId: item.id, answer: draft } }); setDraft(''); }}>
                      Submit contribution
                    </button>
                  </div>
                )}
              </div>
            ))}
            <p className="rep-muted">
              A targeted question grants access to that question and its evidence only. It is not account-wide browsing.
            </p>
          </InfoCard>
        </div>
      </div>

      <Disclosure label="Collaboration boundaries (F12)">
        <ul className="rep-bullet-list">
          <li>Internal and shared conversations are separate records with separate audiences.</li>
          <li>Customers and vendors contribute only to explicitly shared questions, documents and discussions.</li>
          <li>Staff retain review authority over every contribution; a contribution never closes a finding by itself.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F12 — Customer collaboration', 'P21 /requests/:requestId/collaboration']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P22 — Vendor Handoff (internal view)
 * ------------------------------------------------------------------ */

export function VendorHandoff({ requestId }) {
  const { vendorContributions, requests, surveys, evidence, recommendations, can } = useRep();
  const dispatch = useRepDispatch();
  const navigate = useNavigate();

  const request = requests.find(item => item.id === requestId);
  const contribution = vendorContributions.find(item => item.requestId === requestId);

  if (!request || !contribution) return <EmptyState title="No vendor work on this request" />;

  const survey = surveys[contribution.surveyId];
  const report = evidence.find(item => item.id === contribution.reportEvidenceId);
  const vendorRecommendations = recommendations.filter(rec => contribution.recommendationIds.includes(rec.id));

  return (
    <div>
      <PageHeader
        pageId="P22"
        params={{ requestId }}
        title={`Vendor work on ${request.id}`}
        subtitle="Internal view of the vendor assignment, the original contribution, the retained author and the accountable internal engineer."
        breadcrumb={<><Crumb pageId="P06" params={{ requestId }}>{requestId}</Crumb><span>/</span><span>vendor-work</span></>}
      />

      <div className="rep-grid rep-grid--two">
        <InfoCard title="Assignment">
          <DefinitionList items={[
            { label: 'Contribution', value: contribution.id },
            { label: 'Vendor organization', value: contribution.vendorOrganizationId },
            { label: 'Assigned vendor user', value: userName(contribution.assignedVendorUserId) },
            { label: 'Internal accountable owner', value: userName(contribution.internalOwnerId) },
            { label: 'Status', value: <Badge status={contribution.status} /> },
            { label: 'Submitted at', value: contribution.submittedAt?.replace('T', ' ').slice(0, 16) ?? 'Not submitted' },
            { label: 'Handoff recorded', value: contribution.handoffAt ? `${contribution.handoffAt.slice(0, 10)} by ${userName(contribution.handoffBy)}` : 'Not handed off' },
            { label: 'Release authority', value: contribution.releaseAuthority },
            { label: 'Original vendor preserved', value: String(contribution.originalVendorPreserved) },
          ]} />
        </InfoCard>

        <InfoCard title="Original contribution">
          <p className="rep-muted rep-section-intro">
            The vendor original is retained unchanged when an internal consultant takes over review and letter preparation.
          </p>
          <DefinitionList items={[
            { label: 'Vendor survey', value: survey ? `${survey.id} revision ${survey.currentRevision}` : 'None' },
            { label: 'Report', value: report ? `${report.fileName} (v${report.versions[0].version}, ${report.versions[0].scanStatus})` : 'None' },
            { label: 'Recorded author', value: report ? userName(report.versions[0].uploadedBy) : '—' },
          ]} />
          {vendorRecommendations.length > 0 && (
            <>
              <div className="form-section__title" style={{ marginTop: 'var(--space-3)' }}>Vendor recommendations</div>
              <ul className="rep-plain-list">
                {vendorRecommendations.map(rec => (
                  <li key={rec.id}>
                    <button className="table-link" onClick={() => navigate('P14', { recommendationId: rec.id })}>{rec.id}</button>
                    <span className="rep-muted"> — {rec.title} · original author {userName(rec.originalAuthor ?? rec.ownerId)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </InfoCard>
      </div>

      <InfoCard title="Handoff and review">
        {can(PERMISSIONS.vendorWorkHandoff) ? (
          <>
            <p className="rep-muted rep-section-intro">
              Submission enables an internal handoff. It does not send anything to a customer, and it does not transfer
              release authority to the vendor.
            </p>
            <div className="rep-card-head__actions">
              <button
                className="btn btn--primary"
                disabled={contribution.status !== 'Submitted'}
                onClick={() => dispatch({ type: 'VENDOR_HANDOFF', payload: { contributionId: contribution.id } })}
              >
                {contribution.status === 'HandedOff' ? 'Handoff already recorded' : 'Record internal handoff'}
              </button>
              {survey && (
                <button className="btn" onClick={() => navigate('P16', { requestId })}>Open review workspace</button>
              )}
            </div>
          </>
        ) : (
          <p className="rep-muted">Recording a handoff requires <code>VendorWork.Handoff</code>.</p>
        )}
      </InfoCard>

      <Disclosure label="Vendor boundaries (F14)">
        <ul className="rep-bullet-list">
          <li>Vendor access is assignment-bound; it implies no account-wide browsing and no access to internal instructions.</li>
          <li>Vendor identity persists after an internal owner is recorded.</li>
          <li>Release authority stays with an internal manager.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F14 — Vendor work and handoff', 'P22 /requests/:requestId/vendor-work']} />
    </div>
  );
}
