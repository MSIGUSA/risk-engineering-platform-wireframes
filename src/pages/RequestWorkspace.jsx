import { useState } from 'react';
import { useRep, useNavigate } from '../state/repHooks';
import {
  PageHeader, Badge, Tabs, InfoCard, DefinitionList, EmptyState, SyntheticFooter, Crumb, Disclosure,
} from '../components/primitives';
import { accountName, siteName, userName, TEMPLATES } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

export default function RequestWorkspace({ requestId }) {
  const state = useRep();
  const { requests, surveys, evidence, recommendations, releases, threads, informationRequests, tasks, visits, reviewDecisions, packageRevisions, vendorContributions, can } = state;
  const navigate = useNavigate();
  const [tab, setTab] = useState('scope');

  const request = requests.find(item => item.id === requestId);
  if (!request) return <EmptyState title="Request not found in this scope" detail="Out-of-scope identifiers return a consistent not-found result rather than disclosing another customer record." />;

  const survey = request.surveyId ? surveys[request.surveyId] : null;
  const revisions = packageRevisions[request.id] ?? [];
  const pinned = revisions.find(revision => revision.state === 'Pinned') ?? revisions[0];
  const requestEvidence = evidence.filter(item => item.requestId === requestId);
  const requestRecommendations = recommendations.filter(rec => rec.surveyLinks.includes(request.surveyId));
  const requestReleases = releases.filter(release => release.requestId === requestId);
  const requestThreads = threads.filter(thread => thread.requestId === requestId);
  const requestInfo = informationRequests.filter(item => item.requestId === requestId);
  const requestTasks = tasks.filter(task => task.requestId === requestId);
  const requestVisits = visits.filter(visit => visit.requestId === requestId);
  const requestReviews = reviewDecisions.filter(decision => decision.requestId === requestId);
  const vendorWork = vendorContributions.filter(item => item.requestId === requestId);

  const tabs = [
    { id: 'scope', label: 'Scope' },
    { id: 'assignments', label: 'Assignments & visits', count: requestVisits.length },
    { id: 'surveys', label: 'Surveys', count: survey ? 1 : 0 },
    { id: 'evidence', label: 'Evidence', count: requestEvidence.length },
    { id: 'recommendations', label: 'Recommendations', count: requestRecommendations.length },
    { id: 'review', label: 'Review & release', count: requestReleases.length },
    { id: 'correspondence', label: 'Correspondence' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div>
      <PageHeader
        pageId="P06"
        params={{ requestId }}
        title={`${request.id} — ${request.serviceType}`}
        subtitle={`${accountName(request.accountId)} · ${request.siteIds.map(siteName).join(', ')}`}
        breadcrumb={<>
          <Crumb pageId="P01">My work</Crumb><span>/</span>
          <Crumb pageId="P03" params={{ accountId: request.accountId }}>{accountName(request.accountId)}</Crumb><span>/</span>
          <span>{request.id}</span>
        </>}
        actions={(
          <>
            {survey && can(PERMISSIONS.surveyReadAssigned) && (
              <button className="btn" onClick={() => navigate('P10', { surveyId: survey.id })}>Open survey</button>
            )}
            {can(PERMISSIONS.surveyCopySource) && (
              <button className="btn" onClick={() => navigate('P11', { requestId })}>Copy historical work</button>
            )}
            {can(PERMISSIONS.surveyReview) && survey?.submitted && (
              <button className="btn btn--primary" onClick={() => navigate('P16', { requestId })}>Review</button>
            )}
          </>
        )}
      />

      <div className="claim-strip">
        <div className="claim-strip__item"><span className="claim-strip__label">State</span><span className="claim-strip__value"><Badge status={request.state} /></span></div>
        <div className="claim-strip__item"><span className="claim-strip__label">Requested</span><span className="claim-strip__value">{request.requestedDate}</span></div>
        <div className="claim-strip__item"><span className="claim-strip__label">Committed</span><span className="claim-strip__value">{request.committedDate ?? 'Not committed'}</span></div>
        <div className="claim-strip__item"><span className="claim-strip__label">Origin</span><span className="claim-strip__value">{request.origin}</span></div>
        <div className="claim-strip__item"><span className="claim-strip__label">Assignee</span><span className="claim-strip__value">{request.assigneeId ? userName(request.assigneeId) : 'Unassigned'}</span></div>
        <div className="claim-strip__item"><span className="claim-strip__label">Accountable owner</span><span className="claim-strip__value">{request.accountableOwnerId ? userName(request.accountableOwnerId) : 'Not set'}</span></div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} ariaLabel="Request workspace tabs" />

      {tab === 'scope' && (
        <>
          <div className="rep-grid rep-grid--two">
            <InfoCard title="Request">
              <DefinitionList items={[
                { label: 'Request', value: request.id },
                { label: 'Customer organization', value: request.customerOrganizationId },
                { label: 'Requester', value: userName(request.requesterId) },
                { label: 'Priority', value: request.priority },
                { label: 'Purpose', value: request.purpose },
                { label: 'Background', value: request.background },
                { label: 'Concurrency token', value: <code className="rep-code">{request.rowVersion}</code> },
              ]} />
            </InfoCard>
            <InfoCard title="Package revisions">
              {revisions.length === 0 ? <EmptyState title="No package revision recorded" /> : (
                <div className="rep-table-scroll">
                  <table className="data-table">
                    <thead><tr><th>Revision</th><th>State</th><th>Created</th><th>By</th><th>Reason</th><th>Hash</th></tr></thead>
                    <tbody>
                      {revisions.map(revision => (
                        <tr key={revision.revision}>
                          <td>{revision.revision}</td>
                          <td><Badge status={revision.state} /></td>
                          <td>{revision.createdAt}</td>
                          <td>{userName(revision.createdBy)}</td>
                          <td className="rep-muted">{revision.reason}</td>
                          <td><code className="rep-code">{revision.hash}</code></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
                Submitted revisions are immutable. A scope amendment creates a new revision with a recorded reason.
              </p>
            </InfoCard>
          </div>

          {pinned && (
            <InfoCard title={`Pinned components — revision ${pinned.revision}`}>
              <div className="rep-table-scroll">
                <table className="data-table">
                  <thead><tr><th>Component</th><th>Type</th><th>Template</th><th>Pinned version</th><th>Site</th></tr></thead>
                  <tbody>
                    {pinned.components.map(component => (
                      <tr key={component.id}>
                        <td><code className="rep-code">{component.id}</code></td>
                        <td>{component.type}</td>
                        <td>{component.templateId ? TEMPLATES.find(template => template.id === component.templateId)?.name ?? component.templateId : 'Request question snapshot'}</td>
                        <td>{component.templateVersion ? `v${component.templateVersion}` : '—'}</td>
                        <td>{siteName(component.siteId)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pinned.additionalQuestions.length > 0 && (
                <>
                  <div className="form-section__title" style={{ marginTop: 'var(--space-4)' }}>Request-specific questions</div>
                  <div className="rep-table-scroll">
                    <table className="data-table">
                      <thead><tr><th>Question</th><th>Text</th><th>Type</th><th>Respondent</th><th>Audience</th><th>Required</th></tr></thead>
                      <tbody>
                        {pinned.additionalQuestions.map(question => (
                          <tr key={question.id}>
                            <td><code className="rep-code">{question.id}</code></td>
                            <td>{question.text}</td><td>{question.type}</td>
                            <td>{question.respondent}</td><td>{question.audience}</td><td>{question.required ? 'Yes' : 'No'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </InfoCard>
          )}
        </>
      )}

      {tab === 'assignments' && (
        <>
          <InfoCard title="Visits" actions={can(PERMISSIONS.visitSchedule) && <button className="btn" onClick={() => navigate('P08')}>Open calendar</button>}>
            {requestVisits.length === 0 ? <EmptyState title="No visit scheduled" detail="A visit has its own lifecycle, separate from the request and the survey." /> : (
              <div className="rep-table-scroll">
                <table className="data-table">
                  <thead><tr><th>Visit</th><th>Site</th><th>Start</th><th>End</th><th>Time zone</th><th>Status</th></tr></thead>
                  <tbody>
                    {requestVisits.map(visit => (
                      <tr key={visit.id}>
                        <td>{visit.id}</td><td>{siteName(visit.siteId)}</td>
                        <td>{visit.start.replace('T', ' ')}</td><td>{visit.end.replace('T', ' ')}</td>
                        <td>{visit.timeZone}</td><td><Badge status={visit.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </InfoCard>
          <InfoCard title="Tasks">
            {requestTasks.length === 0 ? <EmptyState title="No tasks on this request" /> : (
              <div className="rep-table-scroll">
                <table className="data-table">
                  <thead><tr><th>Task</th><th>Title</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead>
                  <tbody>
                    {requestTasks.map(task => (
                      <tr key={task.id}>
                        <td><button className="table-link" onClick={() => navigate('P09', { taskId: task.id })}>{task.id}</button></td>
                        <td>{task.title}</td><td>{userName(task.ownerId)}</td><td>{task.dueDate}</td>
                        <td><Badge status={task.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </InfoCard>
          {vendorWork.length > 0 && (
            <InfoCard title="Vendor work" actions={can(PERMISSIONS.vendorWorkHandoff) && <button className="btn" onClick={() => navigate('P22', { requestId })}>Open vendor handoff</button>}>
              {vendorWork.map(item => (
                <DefinitionList key={item.id} items={[
                  { label: 'Vendor organization', value: item.vendorOrganizationId },
                  { label: 'Assigned vendor user', value: userName(item.assignedVendorUserId) },
                  { label: 'Internal accountable owner', value: userName(item.internalOwnerId) },
                  { label: 'Status', value: <Badge status={item.status} /> },
                  { label: 'Release authority', value: item.releaseAuthority },
                ]} />
              ))}
            </InfoCard>
          )}
        </>
      )}

      {tab === 'surveys' && (
        survey ? (
          <InfoCard title={`${survey.id} — ${TEMPLATES.find(template => template.id === survey.templateId)?.name} v${survey.templateVersion}`}
            actions={can(PERMISSIONS.surveyReadAssigned) && <button className="btn btn--primary" onClick={() => navigate('P10', { surveyId: survey.id })}>Open survey workspace</button>}>
            <DefinitionList items={[
              { label: 'State', value: <Badge status={survey.state} /> },
              { label: 'Respondent', value: userName(survey.respondentId) },
              { label: 'Audience', value: survey.audience },
              { label: 'Current revision', value: survey.currentRevision },
              { label: 'Save state', value: survey.saveState },
              { label: 'Last saved', value: survey.lastSavedAt ?? 'Never' },
              survey.copiedFrom && { label: 'Copied from', value: `${survey.copiedFrom.surveyId} revision ${survey.copiedFrom.revision}` },
            ]} />
            <div className="form-section__title" style={{ marginTop: 'var(--space-4)' }}>Revision history</div>
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Revision</th><th>State</th><th>Saved</th><th>By</th><th>Note</th></tr></thead>
                <tbody>
                  {survey.revisions.map(revision => (
                    <tr key={`${revision.revision}-${revision.savedAt}`}>
                      <td>{revision.revision}</td><td><Badge status={revision.state} /></td>
                      <td>{revision.savedAt?.replace('T', ' ').slice(0, 16)}</td>
                      <td>{userName(revision.by)}</td><td className="rep-muted">{revision.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InfoCard>
        ) : <EmptyState title="No survey instance yet" detail="A survey instance is created when the package is pinned and the work is assigned." />
      )}

      {tab === 'evidence' && (
        <InfoCard title="Evidence" actions={<button className="btn" onClick={() => navigate('P12', { requestId })}>Open evidence page</button>}>
          {requestEvidence.length === 0 ? <EmptyState title="No evidence on this request" /> : (
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>File</th><th>Context</th><th>Classification</th><th>Audience</th><th>Latest version</th><th>Scan</th></tr></thead>
                <tbody>
                  {requestEvidence.map(item => (
                    <tr key={item.id}>
                      <td>{item.fileName}</td><td>{item.context}</td>
                      <td>{item.classification}</td><td>{item.audience}</td>
                      <td>v{item.versions[0].version}</td>
                      <td><Badge status={item.versions[0].scanStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </InfoCard>
      )}

      {tab === 'recommendations' && (
        <InfoCard title="Recommendations linked to this work">
          {requestRecommendations.length === 0 ? <EmptyState title="No recommendations linked" /> : (
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Recommendation</th><th>Title</th><th>Site</th><th>Issued revision</th><th>Due</th><th>Status</th></tr></thead>
                <tbody>
                  {requestRecommendations.map(rec => (
                    <tr key={rec.id}>
                      <td><button className="table-link" onClick={() => navigate('P14', { recommendationId: rec.id })}>{rec.id}</button></td>
                      <td>{rec.title}</td><td>{siteName(rec.siteId)}</td>
                      <td>{rec.issuedRevision}</td><td>{rec.dueDate}</td><td><Badge status={rec.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </InfoCard>
      )}

      {tab === 'review' && (
        <>
          <InfoCard title="Review decisions">
            {requestReviews.length === 0 ? <EmptyState title="No review decision recorded" /> : (
              <ul className="rep-timeline">
                {requestReviews.map(decision => (
                  <li key={decision.id} className="rep-timeline__item">
                    <div className="rep-timeline__meta">{decision.at} · {userName(decision.reviewerId)} · revision {decision.responseRevision}</div>
                    <strong>{decision.decision}</strong> — {decision.reason}
                  </li>
                ))}
              </ul>
            )}
          </InfoCard>
          <InfoCard title="Releases" actions={can(PERMISSIONS.surveyReview) && <button className="btn" onClick={() => navigate('P16', { requestId })}>Open review workspace</button>}>
            {requestReleases.length === 0 ? <EmptyState title="No release created" /> : (
              <div className="rep-table-scroll">
                <table className="data-table">
                  <thead><tr><th>Release</th><th>Response revision</th><th>Audience</th><th>Published by</th><th>Published at</th><th>Status</th></tr></thead>
                  <tbody>
                    {requestReleases.map(release => (
                      <tr key={release.id}>
                        <td>{release.id}</td><td>{release.responseRevision}</td><td>{release.audience}</td>
                        <td>{release.publishedBy ? userName(release.publishedBy) : '—'}</td>
                        <td>{release.publishedAt?.slice(0, 10) ?? '—'}</td>
                        <td><Badge status={release.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </InfoCard>
        </>
      )}

      {tab === 'correspondence' && (
        <>
          <InfoCard title="Threads and information requests" actions={<button className="btn" onClick={() => navigate('P21', { requestId })}>Open collaboration</button>}>
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Thread</th><th>Audience</th><th>Subject</th><th>Messages</th></tr></thead>
                <tbody>
                  {requestThreads.map(thread => (
                    <tr key={thread.id}>
                      <td>{thread.id}</td>
                      <td><Badge status={thread.audience === 'Internal' ? 'Open' : 'Review'} label={thread.audience} /></td>
                      <td>{thread.subject}</td><td>{thread.messages.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {requestInfo.length > 0 && (
              <div className="rep-table-scroll" style={{ marginTop: 'var(--space-4)' }}>
                <table className="data-table">
                  <thead><tr><th>Information request</th><th>Scope</th><th>Recipient</th><th>Due</th><th>Status</th></tr></thead>
                  <tbody>
                    {requestInfo.map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td><td>{item.scope}</td>
                        <td>{userName(item.recipientId)}</td><td>{item.dueDate}</td>
                        <td><Badge status={item.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </InfoCard>
          {can(PERMISSIONS.correspondenceDraft) && (
            <InfoCard title="Delivery">
              <button className="btn" onClick={() => navigate('P17', { requestId })}>Open correspondence package</button>
            </InfoCard>
          )}
        </>
      )}

      {tab === 'history' && (
        <InfoCard title="Request history">
          <ul className="rep-timeline">
            <li className="rep-timeline__item">
              <div className="rep-timeline__meta">{request.createdAt} · {userName(request.requesterId)}</div>
              Request created from origin {request.origin}.
            </li>
            {revisions.map(revision => (
              <li key={`rev-${revision.revision}`} className="rep-timeline__item">
                <div className="rep-timeline__meta">{revision.createdAt} · {userName(revision.createdBy)}</div>
                Package revision {revision.revision} — {revision.state}. {revision.reason}
              </li>
            ))}
            {requestVisits.map(visit => (
              <li key={`visit-${visit.id}`} className="rep-timeline__item">
                <div className="rep-timeline__meta">{visit.start.slice(0, 10)}</div>
                Visit {visit.id} {visit.status.toLowerCase()} at {siteName(visit.siteId)}.
              </li>
            ))}
            {requestReviews.map(decision => (
              <li key={`rev-dec-${decision.id}`} className="rep-timeline__item">
                <div className="rep-timeline__meta">{decision.at} · {userName(decision.reviewerId)}</div>
                Review decision {decision.decision} on revision {decision.responseRevision}.
              </li>
            ))}
            {requestReleases.filter(release => release.publishedAt).map(release => (
              <li key={`rel-${release.id}`} className="rep-timeline__item">
                <div className="rep-timeline__meta">{release.publishedAt.slice(0, 10)} · {userName(release.publishedBy)}</div>
                Release {release.id} published to {release.audience}.
              </li>
            ))}
          </ul>
        </InfoCard>
      )}

      <Disclosure label="Workspace state contract">
        <ul className="rep-bullet-list">
          <li>Every editable workspace has loading, loaded, dirty, saving, saved, validation-error, conflict and unavailable states.</li>
          <li>Detail sections load on demand rather than downloading all historical versions.</li>
          <li>A released snapshot is not a live view of editable account data.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F03, F04, F05, F08 — request lifecycle', 'P06 /requests/:requestId']} />
    </div>
  );
}
