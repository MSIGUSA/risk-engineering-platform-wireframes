import { useState } from 'react';
import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';
import {
  PageHeader, Badge, InfoCard, DefinitionList, EmptyState, SyntheticFooter, Disclosure, Crumb, Field, Metric,
} from '../components/primitives';
import { accountName, siteName, userName, TEMPLATES, CONTACTS, USERS } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

/* ------------------------------------------------------------------ *
 * P15 — Review Queue
 * ------------------------------------------------------------------ */

export function ReviewQueue() {
  const { requests, surveys, authenticatedUser } = useRep();
  const navigate = useNavigate();
  const [scope, setScope] = useState('team');

  const queue = requests.filter(request => {
    if (!['InReview', 'VendorSubmitted', 'Approved'].includes(request.state)) return false;
    if (scope === 'mine' && request.accountableOwnerId !== authenticatedUser.id) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        pageId="P15"
        subtitle="Submitted work by scope and status. Opening a row opens the specific revision that was submitted, not a live view."
      />

      <div className="rep-kpi-row">
        <Metric label="Awaiting review" value={queue.filter(request => request.state === 'InReview').length} tone="review" />
        <Metric label="Vendor submissions" value={queue.filter(request => request.state === 'VendorSubmitted').length} />
        <Metric label="Approved, not released" value={queue.filter(request => request.state === 'Approved').length} tone="complete" />
      </div>

      <div className="rep-chip-row">
        <button className={`rep-chip${scope === 'team' ? ' active' : ''}`} onClick={() => setScope('team')}>Team scope</button>
        <button className={`rep-chip${scope === 'mine' ? ' active' : ''}`} onClick={() => setScope('mine')}>Where I am accountable</button>
      </div>

      {queue.length === 0 ? <EmptyState title="Nothing awaiting review in this scope" /> : (
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Request</th><th>Account</th><th>Site</th><th>Submitted revision</th><th>Submitted by</th><th>State</th><th /></tr></thead>
            <tbody>
              {queue.map(request => {
                const survey = request.surveyId ? surveys[request.surveyId] : null;
                return (
                  <tr key={request.id}>
                    <td><button className="table-link" onClick={() => navigate('P06', { requestId: request.id })}>{request.id}</button></td>
                    <td>{accountName(request.accountId)}</td>
                    <td>{request.siteIds.map(siteName).join(', ')}</td>
                    <td>{survey ? survey.currentRevision : '—'}</td>
                    <td>{survey ? userName(survey.respondentId) : '—'}</td>
                    <td><Badge status={request.state} /></td>
                    <td><button className="btn" onClick={() => navigate('P16', { requestId: request.id })}>Open review</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <SyntheticFooter sources={['F08 — Review, approval and release', 'P15 /reviews']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P16 — Review Workspace
 * ------------------------------------------------------------------ */

export function ReviewWorkspace({ requestId }) {
  const { requests, surveys, recommendations, evidence, releases, can } = useRep();
  const dispatch = useRepDispatch();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [audience, setAudience] = useState('UnderwritingInternal');

  const request = requests.find(item => item.id === requestId);
  if (!request) return <EmptyState title="Request not found in this scope" />;
  const survey = request.surveyId ? surveys[request.surveyId] : null;
  if (!survey) return <EmptyState title="No submitted survey on this request" />;

  const linkedRecommendations = recommendations.filter(rec => rec.surveyLinks.includes(survey.id));
  const linkedEvidence = evidence.filter(item => item.requestId === requestId);
  const draftRelease = releases.find(release => release.requestId === requestId && release.status === 'Draft');
  const publishedRelease = releases.find(release => release.requestId === requestId && release.status === 'Published');

  const canDecide = can(PERMISSIONS.surveyReview) && survey.submitted && request.state === 'InReview';
  const canRelease = can(PERMISSIONS.releasePublish) && (request.state === 'Approved' || Boolean(draftRelease));

  const totalInsurableValue = survey.buildings.reduce(
    (sum, building) => sum + Number(building.buildingValue || 0) + Number(building.contentsValue || 0) + Number(building.businessInterruptionValue || 0),
    0,
  );

  return (
    <div>
      <PageHeader
        pageId="P16"
        params={{ requestId }}
        title={`Review ${request.id}`}
        subtitle="Side-by-side response and output preview with the linked recommendations and evidence. Approval and release are separate actions."
        breadcrumb={<>
          <Crumb pageId="P15">Review queue</Crumb><span>/</span>
          <Crumb pageId="P06" params={{ requestId }}>{requestId}</Crumb><span>/</span><span>review</span>
        </>}
      />

      <div className="claim-strip">
        <div className="claim-strip__item"><span className="claim-strip__label">Request state</span><span className="claim-strip__value"><Badge status={request.state} /></span></div>
        <div className="claim-strip__item"><span className="claim-strip__label">Survey</span><span className="claim-strip__value">{survey.id}</span></div>
        <div className="claim-strip__item"><span className="claim-strip__label">Revision under review</span><span className="claim-strip__value">{survey.currentRevision}</span></div>
        <div className="claim-strip__item"><span className="claim-strip__label">Submitted by</span><span className="claim-strip__value">{userName(survey.respondentId)}</span></div>
        <div className="claim-strip__item"><span className="claim-strip__label">Template</span><span className="claim-strip__value">{TEMPLATES.find(item => item.id === survey.templateId)?.name} v{survey.templateVersion}</span></div>
      </div>

      <div className="rep-compare">
        <div className="rep-compare__col">
          <div className="rep-compare__title">Submitted response — revision {survey.currentRevision}</div>
          <DefinitionList items={Object.entries(survey.answers).map(([key, value]) => ({
            label: key,
            value: value === '' ? <span className="rep-muted">blank</span> : String(value),
          }))} />
          <div className="form-section__title" style={{ marginTop: 'var(--space-3)' }}>Building rows</div>
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Row</th><th>Name</th><th>Building</th><th>Contents</th><th>BI</th></tr></thead>
              <tbody>
                {survey.buildings.map(building => (
                  <tr key={building.id}>
                    <td><code className="rep-code">{building.id}</code></td>
                    <td>{building.name}</td>
                    <td>${Number(building.buildingValue).toLocaleString()}</td>
                    <td>${Number(building.contentsValue).toLocaleString()}</td>
                    <td>${Number(building.businessInterruptionValue).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rep-compare__col">
          <div className="rep-compare__title">Output preview — internal survey report</div>
          <div className="rep-preview">
            <h4>{accountName(request.accountId)} — {siteName(survey.siteId)}</h4>
            <p><strong>Occupancy:</strong> {survey.answers.occupancyDescription}</p>
            <p>
              <strong>Fire pump:</strong> {survey.answers.firePump || <span className="rep-preview__omitted">blank — omitted</span>}
              {survey.answers.firePump === 'No' && survey.answers.firePumpComment && ` — ${survey.answers.firePumpComment}`}
            </p>
            <p><strong>Sprinkler coverage:</strong> {survey.answers.sprinklerCoverage}</p>
            <p><strong>Housekeeping:</strong> {survey.answers.housekeepingRating}</p>
            <p><strong>Total insurable value:</strong> ${totalInsurableValue.toLocaleString()}</p>
            <p className="rep-preview__rule">
              Conditional output rule applied: a recorded <strong>No</strong> prints with its comment; a blank answer is
              omitted. Wording fidelity depends on the approved output template, which is not yet supplied.
            </p>
          </div>
        </div>
      </div>

      <div className="rep-grid rep-grid--two">
        <InfoCard title="Recommendations in this work">
          {linkedRecommendations.length === 0 ? <EmptyState title="No recommendations linked" /> : (
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Recommendation</th><th>Title</th><th>Status</th></tr></thead>
                <tbody>
                  {linkedRecommendations.map(rec => (
                    <tr key={rec.id}>
                      <td><button className="table-link" onClick={() => navigate('P14', { recommendationId: rec.id })}>{rec.id}</button></td>
                      <td>{rec.title}</td><td><Badge status={rec.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </InfoCard>
        <InfoCard title="Evidence">
          {linkedEvidence.length === 0 ? <EmptyState title="No evidence attached" /> : (
            <ul className="rep-plain-list">
              {linkedEvidence.map(item => (
                <li key={item.id}>
                  {item.fileName} <span className="rep-muted">· {item.context} · v{item.versions[0].version} · </span>
                  <Badge status={item.versions[0].scanStatus} />
                </li>
              ))}
            </ul>
          )}
        </InfoCard>
      </div>

      <InfoCard title="Review decision">
        {!canDecide ? (
          <p className="rep-muted">
            {request.state !== 'InReview'
              ? `This request is in state ${request.state}; no review decision is outstanding.`
              : 'Create, submit, review, release and unlock are distinct permissions. This role may submit but not approve.'}
          </p>
        ) : (
          <>
            <div className="form-grid">
              <Field label="Reason (required to return)" span={2} type="textarea" value={reason} onChange={setReason} hint="A return must record a reason and produces a new editable revision." />
            </div>
            <div className="rep-card-head__actions">
              <button
                className="btn"
                disabled={!reason.trim()}
                onClick={() => { dispatch({ type: 'REVIEW_DECISION', payload: { requestId, responseRevision: survey.currentRevision, decision: 'Returned', reason } }); setReason(''); }}
              >
                Return for correction
              </button>
              <button
                className="btn btn--primary"
                onClick={() => { dispatch({ type: 'REVIEW_DECISION', payload: { requestId, responseRevision: survey.currentRevision, decision: 'Approved', reason: reason || 'Approved without additional comment' } }); setReason(''); }}
              >
                Approve revision {survey.currentRevision}
              </button>
            </div>
          </>
        )}
      </InfoCard>

      <InfoCard title="Release">
        {publishedRelease ? (
          <>
            <DefinitionList items={[
              { label: 'Release', value: publishedRelease.id },
              { label: 'Response revision', value: publishedRelease.responseRevision },
              { label: 'Audience', value: publishedRelease.audience },
              { label: 'Published by', value: userName(publishedRelease.publishedBy) },
              { label: 'Published at', value: publishedRelease.publishedAt },
              { label: 'Snapshot immutable', value: String(publishedRelease.snapshotImmutable) },
              { label: 'Live follow-up allowed', value: publishedRelease.liveFollowUpAllowed.join(', ') },
            ]} />
            {can(PERMISSIONS.releaseWithdraw) && (
              <button className="btn" onClick={() => dispatch({ type: 'WITHDRAW_RELEASE', payload: { releaseId: publishedRelease.id, reason: 'Withdrawn in the wireframe demonstration' } })}>
                Withdraw release
              </button>
            )}
          </>
        ) : canRelease && draftRelease ? (
          <>
            <p className="rep-muted rep-section-intro">
              Release creates an immutable snapshot referencing the exact response revision. It is not a live view of
              editable account data.
            </p>
            <div className="form-grid">
              <Field label="Audience" value={audience} onChange={setAudience} options={['UnderwritingInternal', 'CustomerAndInternal', 'Internal']} />
            </div>
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Artifact</th><th>Type</th><th>Version</th><th>Audience</th><th>Output template</th></tr></thead>
                <tbody>
                  {draftRelease.artifacts.map(artifact => (
                    <tr key={artifact.id}>
                      <td>{artifact.id}</td><td>{artifact.type}</td><td>v{artifact.version}</td>
                      <td>{artifact.audience}</td>
                      <td className="rep-muted">{artifact.templateId} v{artifact.templateVersion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn--primary" style={{ marginTop: 'var(--space-3)' }} onClick={() => dispatch({ type: 'PUBLISH_RELEASE', payload: { releaseId: draftRelease.id, audience } })}>
              Publish release
            </button>
          </>
        ) : (
          <p className="rep-muted">
            No release is available to publish. Release is a separate action from approval and requires{' '}
            <code>Release.Publish</code>.
          </p>
        )}
        {can(PERMISSIONS.correspondenceDraft) && (
          <button className="btn" style={{ marginTop: 'var(--space-3)' }} onClick={() => navigate('P17', { requestId })}>
            Prepare correspondence
          </button>
        )}
      </InfoCard>

      <Disclosure label="Review and release safeguards (F08)">
        <ul className="rep-bullet-list">
          <li>An engineer can submit but cannot approve; the permissions are distinct.</li>
          <li>A return requires a reason and produces a new editable revision.</li>
          <li>A release records the audience, the actor and the immutable revision references.</li>
          <li>Follow-up records such as compliance status can continue without changing issued content.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F08 — Review, approval and release', 'P16 /requests/:requestId/review']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P17 — Correspondence
 * ------------------------------------------------------------------ */

export function Correspondence({ requestId }) {
  const { requests, distributions, releases, can } = useRep();
  const dispatch = useRepDispatch();
  const [audience, setAudience] = useState('Internal');
  const [recipientId, setRecipientId] = useState('');

  const request = requests.find(item => item.id === requestId);
  if (!request) return <EmptyState title="Request not found in this scope" />;

  const packages = distributions.filter(item => item.requestId === requestId);
  const current = packages[0];
  const release = current ? releases.find(item => item.id === current.releaseId) : null;

  const candidateRecipients = [
    ...USERS.filter(user => ['underwriter', 'manager', 'engineer', 'coordinator'].includes(user.role))
      .map(user => ({ id: user.id, label: `${user.name} — ${user.title}`, audience: 'Internal', email: user.email })),
    ...CONTACTS.filter(contact => contact.accountId === request.accountId)
      .map(contact => ({ id: contact.id, label: `${contact.name} — ${contact.role}`, audience: 'Customer', email: contact.email })),
  ];

  const selectedRecipient = candidateRecipients.find(item => item.id === recipientId) ?? null;
  const audienceMismatch = selectedRecipient && selectedRecipient.audience !== audience;
  const documentsAreInternal = current?.documents.every(document => document.audience === 'Internal');
  const externalBlocked = documentsAreInternal && audience === 'Customer';

  return (
    <div>
      <PageHeader
        pageId="P17"
        params={{ requestId }}
        subtitle="Package preview, recipients and sender, a reviewed distribution action, delivery history and follow-up preview."
        breadcrumb={<><Crumb pageId="P06" params={{ requestId }}>{requestId}</Crumb><span>/</span><span>correspondence</span></>}
      />

      {!current ? <EmptyState title="No correspondence package on this request" detail="A package is prepared from an approved release." /> : (
        <>
          <div className="rep-grid rep-grid--two">
            <InfoCard title="What will be sent">
              <div className="rep-table-scroll">
                <table className="data-table">
                  <thead><tr><th>Document</th><th>Type</th><th>Version</th><th>Audience</th></tr></thead>
                  <tbody>
                    {current.documents.map(document => (
                      <tr key={document.id}>
                        <td>{document.id}</td><td>{document.type}</td>
                        <td>v{document.version}</td><td>{document.audience}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <DefinitionList items={[
                { label: 'Source release', value: release ? `${release.id} (${release.status})` : 'None' },
                { label: 'Response revision', value: release?.responseRevision ?? '—' },
                { label: 'Transport', value: current.transport },
                { label: 'Idempotency key', value: <code className="rep-code">{current.idempotencyKey}</code> },
              ]} />
            </InfoCard>

            <InfoCard title="Recipients and audience">
              <div className="form-grid">
                <Field label="Package audience" value={audience} onChange={setAudience} options={['Internal', 'Customer']} />
                <Field label="Add recipient" value={recipientId} onChange={setRecipientId} options={candidateRecipients.map(item => ({ value: item.id, label: item.label }))} />
              </div>
              {externalBlocked && (
                <div className="validation-banner" role="alert">
                  Blocked: this package contains internal-classified documents. Switching an internal package to an external
                  audience is refused in the engine, not merely hidden in the interface.
                </div>
              )}
              {audienceMismatch && !externalBlocked && (
                <div className="validation-banner" role="alert">
                  Blocked: {selectedRecipient.label} is an {selectedRecipient.audience.toLowerCase()} audience recipient.
                  Being a known application user does not make a contact internal.
                </div>
              )}
              <div className="form-section__title" style={{ marginTop: 'var(--space-3)' }}>Current recipients</div>
              <ul className="rep-plain-list">
                {current.recipients.map(recipient => (
                  <li key={recipient.email}>{recipient.email} <span className="rep-muted">· {recipient.role} · {recipient.audience}</span></li>
                ))}
              </ul>
            </InfoCard>
          </div>

          <InfoCard title="Reviewed distribution">
            <DefinitionList items={[
              { label: 'Package', value: current.id },
              { label: 'Status', value: <Badge status={current.status} /> },
              { label: 'Approved by', value: current.approvedBy ? userName(current.approvedBy) : 'Not approved' },
              { label: 'Sent at', value: current.sentAt ?? 'Not sent' },
            ]} />
            {can(PERMISSIONS.correspondenceSend) ? (
              <button
                className="btn btn--primary"
                disabled={current.status === 'Sent' || externalBlocked || audienceMismatch}
                onClick={() => dispatch({ type: 'SEND_DISTRIBUTION', payload: { distributionId: current.id } })}
              >
                {current.status === 'Sent' ? 'Already recorded as sent' : 'Record simulated send'}
              </button>
            ) : (
              <p className="rep-muted">
                Drafting and sending are distinct permissions. This role may draft the package but not send it.
              </p>
            )}
          </InfoCard>

          <InfoCard title="Delivery history">
            {packages.filter(item => item.sentAt).length === 0 ? <EmptyState title="Nothing delivered yet" /> : (
              <ul className="rep-timeline">
                {packages.filter(item => item.sentAt).map(item => (
                  <li key={item.id} className="rep-timeline__item">
                    <div className="rep-timeline__meta">{item.sentAt} · approved by {userName(item.approvedBy)}</div>
                    {item.id} delivered to {item.recipients.map(recipient => recipient.email).join(', ')} with{' '}
                    {item.documents.map(document => `${document.id} v${document.version}`).join(', ')}.
                  </li>
                ))}
              </ul>
            )}
            <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
              The manifest preserves the actual recipients and the exact artifact versions that were sent, independently of
              later edits.
            </p>
          </InfoCard>
        </>
      )}

      <Disclosure label="Correspondence safeguards (F09)">
        <ul className="rep-bullet-list">
          <li>Document classification and recipient audience are both checked in the engine.</li>
          <li>Reminder generation stays separate from automatic sending; no transport is implemented here.</li>
          <li>The sent snapshot is preserved even when the underlying records change afterwards.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F09 — Correspondence and delivery', 'P17 /requests/:requestId/correspondence']} />
    </div>
  );
}
