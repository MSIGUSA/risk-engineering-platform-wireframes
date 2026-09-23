import { useState } from 'react';
import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';
import {
  PageHeader, Badge, InfoCard, DefinitionList, EmptyState, SyntheticFooter, Disclosure, Field, Metric,
} from '../components/primitives';
import {
  ORGANIZATIONS, SITES, accountName, siteName, userName,
} from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

/* ------------------------------------------------------------------ *
 * C01 — Claims Connect REP area (separate consumer surface)
 * ------------------------------------------------------------------ */

export function ClaimsConnectRepArea() {
  const { releases, recommendations, informationRequests, memberships, distributions, authenticatedUser, can } = useRep();
  const dispatch = useRepDispatch();
  const [response, setResponse] = useState('');
  const [activeRecommendationId, setActiveRecommendationId] = useState(null);

  const membership = memberships.find(item => item.principalId === authenticatedUser.id);
  const organization = ORGANIZATIONS.find(item => item.id === authenticatedUser.organizationId);
  const entitledAccounts = authenticatedUser.accountScope;

  /* Only released content appears in the customer workspace. */
  const publishedReleases = releases.filter(release =>
    release.status === 'Published' &&
    release.audience === 'CustomerAndInternal');
  const customerDocuments = publishedReleases.flatMap(release =>
    release.artifacts.filter(artifact => artifact.audience === 'Customer').map(artifact => ({ ...artifact, releaseId: release.id, requestId: release.requestId })));
  const sentToMe = distributions.filter(item => item.status === 'Sent');

  const sharedRecommendations = recommendations.filter(rec =>
    entitledAccounts.includes(rec.accountId) && rec.status !== 'Completed');
  const myInformationRequests = informationRequests.filter(item => item.recipientId === authenticatedUser.id);

  const permittedSites = SITES.filter(site => entitledAccounts.includes(site.accountId)
    && (membership?.scope?.includes('all permitted sites') || membership?.scope?.includes(site.id)));

  const activeRecommendation = sharedRecommendations.find(rec => rec.id === activeRecommendationId) ?? null;

  return (
    <div>
      <PageHeader
        pageId="C01"
        title="Claims Connect — risk engineering"
        subtitle="Illustration of the REP area inside a separate, broader customer portal. Portal navigation, sign-in and unrelated business areas are owned by Claims Connect, not by REP."
      />

      <div className="rep-consumer-banner">
        <div>
          <strong>Separate consumer surface</strong>
          REP supplies entitled locations, permitted released documents, outstanding recommendations and information
          requests through the customer projection contracts C01–C05. Portal membership alone grants no REP access, and
          this surface never exposes the internal REP workbench.
        </div>
      </div>

      <div className="rep-kpi-row">
        <Metric label="Organization" value={organization?.name ?? '—'} detail={authenticatedUser.organizationId} />
        <Metric label="Entitled locations" value={permittedSites.length} />
        <Metric label="Outstanding recommendations" value={sharedRecommendations.length} tone="review" />
        <Metric label="Open information requests" value={myInformationRequests.filter(item => item.status === 'Open').length} />
      </div>

      <div className="rep-grid rep-grid--two">
        <InfoCard title="Your REP access">
          <DefinitionList items={[
            { label: 'Signed-in user', value: `${authenticatedUser.name} — ${authenticatedUser.title}` },
            { label: 'REP roles', value: membership?.roles.join(', ') ?? 'None' },
            { label: 'Scope', value: membership?.scope ?? '—' },
            { label: 'Source of authority', value: membership?.source ?? '—' },
            { label: 'Authorization version', value: membership?.authorizationVersion ?? '—' },
          ]} />
          <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
            Changing the organization context clears the visible customer context. Selecting a context never grants access
            by itself.
          </p>
        </InfoCard>

        <InfoCard title="Entitled locations">
          {permittedSites.length === 0 ? <EmptyState title="No entitled locations" /> : (
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Location</th><th>Account</th><th>Address</th></tr></thead>
                <tbody>
                  {permittedSites.map(site => (
                    <tr key={site.id}>
                      <td>{site.name}</td>
                      <td>{accountName(site.accountId)}</td>
                      <td className="rep-muted">{site.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </InfoCard>
      </div>

      <InfoCard title="Released documents">
        {customerDocuments.length === 0 ? (
          <EmptyState title="No released documents" detail="Only released content appears here. Draft or internal work is never visible on this surface." />
        ) : (
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Document</th><th>Type</th><th>Version</th><th>Release</th><th>Delivered</th></tr></thead>
              <tbody>
                {customerDocuments.map(document => (
                  <tr key={document.id}>
                    <td>{document.id}</td>
                    <td>{document.type}</td>
                    <td>v{document.version}</td>
                    <td className="rep-muted">{document.releaseId}</td>
                    <td className="rep-muted">{sentToMe.find(item => item.requestId === document.requestId)?.sentAt?.slice(0, 10) ?? 'Available in portal'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </InfoCard>

      <InfoCard title="Outstanding recommendations">
        {sharedRecommendations.length === 0 ? <EmptyState title="No outstanding recommendations" /> : (
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Recommendation</th><th>Location</th><th>Wording</th><th>Due</th><th>Status</th><th /></tr></thead>
              <tbody>
                {sharedRecommendations.map(rec => (
                  <tr key={rec.id}>
                    <td><code className="rep-code">{rec.id}</code></td>
                    <td>{siteName(rec.siteId)}</td>
                    <td>{rec.title}</td>
                    <td>{rec.dueDate}</td>
                    <td><Badge status={rec.status} /></td>
                    <td><button className="btn" onClick={() => setActiveRecommendationId(rec.id)}>Open</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </InfoCard>

      {activeRecommendation && (
        <InfoCard title={activeRecommendation.title} actions={<button className="btn" onClick={() => setActiveRecommendationId(null)}>Close</button>}>
          <div className="rep-preview">{activeRecommendation.issuedWording}</div>
          <div className="form-section__title" style={{ marginTop: 'var(--space-3)' }}>Conversation</div>
          <ul className="rep-timeline">
            {activeRecommendation.complianceEvents.map((event, index) => (
              <li key={index} className="rep-timeline__item">
                <div className="rep-timeline__meta">{event.at} · {event.actorAudience} · {event.type}</div>
                {event.detail}
              </li>
            ))}
          </ul>
          {can(PERMISSIONS.recommendationRespond) ? (
            <>
              <div className="form-grid">
                <Field label="Your response" span={2} type="textarea" value={response} onChange={setResponse} />
              </div>
              <button
                className="btn btn--primary"
                disabled={!response.trim()}
                onClick={() => { dispatch({ type: 'ADD_RECOMMENDATION_RESPONSE', payload: { recommendationId: activeRecommendation.id, detail: response } }); setResponse(''); }}
              >
                Post response
              </button>
              <p className="rep-muted" style={{ marginTop: 'var(--space-2)' }}>
                Your response is recorded for staff validation. Closure remains a staff decision.
              </p>
            </>
          ) : (
            <div className="rep-denial rep-denial--compact">
              <div className="rep-denial__title">Viewer access</div>
              <p>
                A viewer can read released results but cannot post a response. Posting requires a contributor role, which an
                organization administrator can grant within delegated authority.
              </p>
            </div>
          )}
        </InfoCard>
      )}

      <InfoCard title="Information requests for you">
        {myInformationRequests.length === 0 ? <EmptyState title="No information requests assigned to you" /> : (
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Request</th><th>Scope</th><th>Due</th><th>Status</th><th>Your contributions</th></tr></thead>
              <tbody>
                {myInformationRequests.map(item => (
                  <tr key={item.id}>
                    <td><code className="rep-code">{item.id}</code></td>
                    <td>{item.scope}</td>
                    <td>{item.dueDate}</td>
                    <td><Badge status={item.status} /></td>
                    <td className="rep-muted">
                      {item.contributions.length
                        ? item.contributions.map(contribution => `${contribution.answer} (staff review ${contribution.staffReviewStatus})`).join('; ')
                        : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
          Access is granted to the specific question and its evidence only, not to the whole request or account.
        </p>
      </InfoCard>

      <Disclosure label="Customer surface boundaries (F12)">
        <ul className="rep-bullet-list">
          <li>Verified user and client context, current membership, REP role, account and site entitlement, and release audience all apply together.</li>
          <li>Only released content appears; internal instructions and internal answers are never projected.</li>
          <li>A viewer cannot post; a contributor can. Both are scoped to their entitled locations.</li>
          <li>Other portal domains are neither implemented nor governed by REP.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F12 — Customer collaboration', 'Customer projection contracts C01–C05']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * V01 — Vendor Assigned Work (separate consumer surface)
 * ------------------------------------------------------------------ */

export function VendorAssignedWork() {
  const { vendorContributions, requests, surveys, evidence, recommendations, authenticatedUser } = useRep();
  const dispatch = useRepDispatch();
  const navigate = useNavigate();
  const [attemptedId, setAttemptedId] = useState('');

  const mine = vendorContributions.filter(item => item.assignedVendorUserId === authenticatedUser.id);

  function attemptOpen() {
    dispatch({
      type: 'PUSH_NOTICE',
      payload: {
        text: `Not found: ${attemptedId || 'that identifier'} is not within your assignment scope. An out-of-scope identifier returns a consistent not-found result rather than confirming that another record exists.`,
        tone: 'error',
      },
    });
  }

  return (
    <div>
      <PageHeader
        pageId="V01"
        title="Vendor assigned work"
        subtitle="Assignment-bound contribution workspace. Presentation ownership for the vendor surface remains an open decision."
      />

      <div className="rep-consumer-banner">
        <div>
          <strong>Separate consumer surface</strong>
          Vendor access is bound to a specific assignment through contracts V01–V03. It implies no account-wide browsing, no
          internal instructions and no release authority.
        </div>
      </div>

      {mine.length === 0 ? <EmptyState title="No work assigned to you" /> : mine.map(contribution => {
        const request = requests.find(item => item.id === contribution.requestId);
        const survey = surveys[contribution.surveyId];
        const report = evidence.find(item => item.id === contribution.reportEvidenceId);
        const linked = recommendations.filter(rec => contribution.recommendationIds.includes(rec.id));

        return (
          <div key={contribution.id}>
            <InfoCard title={`${request?.id} — ${request?.serviceType}`}>
              <DefinitionList items={[
                { label: 'Assignment', value: contribution.id },
                { label: 'Site', value: `${siteName(request?.siteIds?.[0])}` },
                { label: 'Scope', value: request?.purpose },
                { label: 'Committed date', value: request?.committedDate ?? 'Not committed' },
                { label: 'Status', value: <Badge status={contribution.status} /> },
                { label: 'Internal accountable owner', value: userName(contribution.internalOwnerId) },
                { label: 'Release authority', value: contribution.releaseAuthority },
              ]} />
              <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
                Account-level context, internal instructions and other sites at this account are not available on this
                surface.
              </p>
            </InfoCard>

            <div className="rep-grid rep-grid--two">
              <InfoCard title="Your survey">
                {survey ? (
                  <>
                    <DefinitionList items={[
                      { label: 'Survey', value: survey.id },
                      { label: 'Revision', value: survey.currentRevision },
                      { label: 'State', value: <Badge status={survey.state} /> },
                      { label: 'Submitted at', value: contribution.submittedAt?.replace('T', ' ').slice(0, 16) ?? 'Not submitted' },
                    ]} />
                    <button className="btn" onClick={() => navigate('P10', { surveyId: survey.id })}>Open survey</button>
                  </>
                ) : <EmptyState title="No survey instance" />}
              </InfoCard>

              <InfoCard title="Your report, photos and findings">
                <ul className="rep-plain-list">
                  {report && <li>{report.fileName} <span className="rep-muted">· v{report.versions[0].version} · {report.versions[0].scanStatus} · author {userName(report.versions[0].uploadedBy)}</span></li>}
                  {linked.map(rec => <li key={rec.id}><code className="rep-code">{rec.id}</code> — {rec.title}</li>)}
                </ul>
                <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
                  Your authorship is retained when an internal consultant takes over review and letter preparation.
                </p>
                <button
                  className="btn btn--primary"
                  disabled={contribution.status !== 'Assigned'}
                  onClick={() => dispatch({ type: 'VENDOR_SUBMIT', payload: { contributionId: contribution.id } })}
                >
                  {contribution.status === 'Assigned' ? 'Submit contribution' : 'Already submitted'}
                </button>
              </InfoCard>
            </div>
          </div>
        );
      })}

      <InfoCard title="Try an unassigned identifier">
        <p className="rep-muted rep-section-intro">
          Demonstrates the non-disclosing denial. Enter any request identifier that was not assigned to you.
        </p>
        <div className="form-grid">
          <Field label="Request identifier" value={attemptedId} onChange={setAttemptedId} />
          <div className="form-field" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" onClick={attemptOpen}>Attempt to open</button>
          </div>
        </div>
      </InfoCard>

      <Disclosure label="Vendor boundaries (F14)">
        <ul className="rep-bullet-list">
          <li>A vendor cannot open an unassigned record; the result is a consistent not-found.</li>
          <li>Submission enables an internal handoff, not customer sending.</li>
          <li>Vendor identity persists after an internal owner is recorded.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter
        openDecisions={['Presentation ownership of the vendor surface']}
        sources={['F14 — Vendor work and handoff', 'Vendor contracts V01–V03']}
      />
    </div>
  );
}
