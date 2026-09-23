import { useState } from 'react';
import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';
import {
  PageHeader, Badge, InfoCard, DefinitionList, EmptyState, SyntheticFooter, Disclosure, Crumb, Metric, Tabs, GateBanner,
} from '../components/primitives';
import { RELEASE_GATES, INTEGRATION_ADAPTERS, userName } from '../data/repository';
import { EXTERNAL_DATA_PROVIDERS, VOLUME_ESTIMATE, F25_STATUS } from '../data/externalRiskData';
import { PERMISSIONS } from '../config/repConfig';

/* ------------------------------------------------------------------ *
 * P32 — Migration
 * ------------------------------------------------------------------ */

export function MigrationList() {
  const { migrationBatches } = useRep();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        pageId="P32"
        subtitle="Batch inventory, dry-run and import status, and reconciliation counts. A received archive is not complete merely because some letters are present."
      />

      <div className="rep-kpi-row">
        <Metric label="Batches" value={migrationBatches.length} />
        <Metric label="With blocking exceptions" value={migrationBatches.filter(batch => batch.exceptions.length > 0).length} tone="blocked" />
        <Metric label="Cutover approved" value={migrationBatches.filter(batch => batch.cutoverApproved).length} tone="muted" />
      </div>

      <div className="rep-table-scroll">
        <table className="data-table">
          <thead><tr><th>Batch</th><th>Source</th><th>Created</th><th>Checksums supplied</th><th>Exceptions</th><th>Cutover approved</th><th>Status</th></tr></thead>
          <tbody>
            {migrationBatches.map(batch => (
              <tr key={batch.id}>
                <td><button className="table-link" onClick={() => navigate('P33', { batchId: batch.id })}>{batch.id}</button></td>
                <td>{batch.sourceSystem}</td>
                <td>{batch.createdAt}</td>
                <td><Badge status={batch.checksumsSupplied ? 'Complete' : 'Blocked'} label={batch.checksumsSupplied ? 'Yes' : 'Missing'} /></td>
                <td>{batch.exceptions.length}</td>
                <td>{batch.cutoverApproved ? 'Yes' : 'No'}</td>
                <td><Badge status={batch.exceptions.length ? 'Blocked' : 'Complete'} label={batch.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Disclosure label="Migration boundaries (F19)">
        <ul className="rep-bullet-list">
          <li>Privileged migration operations use scoped service identities and approved transfer, with source provenance retained.</li>
          <li>Reconciliation flags intentionally missing artifact classes rather than accepting a partial archive.</li>
          <li>Nothing here moves data. This wireframe simulates the inventory and gate only.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F19 — Migration and cutover', 'P32 /operations/migrations']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P33 — Migration Batch
 * ------------------------------------------------------------------ */

export function MigrationBatch({ batchId }) {
  const { migrationBatches, can } = useRep();
  const dispatch = useRepDispatch();

  const batch = migrationBatches.find(item => item.id === batchId);
  if (!batch) return <EmptyState title="Batch not found" />;

  const balanced = batch.counts.every(count => count.received === count.expected);
  const readyGate = balanced && batch.checksumsSupplied && batch.exceptions.length === 0;

  return (
    <div>
      <PageHeader
        pageId="P33"
        params={{ batchId }}
        title={`${batch.id} — ${batch.sourceSystem}`}
        subtitle="Original manifest and checksums, mapped records, missing artifacts, exceptions and cutover evidence."
        breadcrumb={<><Crumb pageId="P32">Migrations</Crumb><span>/</span><span>{batch.id}</span></>}
      />

      <div className="rep-grid rep-grid--two">
        <InfoCard title="Source manifest">
          <DefinitionList items={[
            { label: 'Batch', value: batch.id },
            { label: 'Source system', value: batch.sourceSystem },
            { label: 'Manifest reference', value: <code className="rep-code">{batch.manifestReference}</code> },
            { label: 'Source checksums', value: batch.checksumsSupplied ? 'Supplied' : 'Required in a real import; not supplied in this fixture' },
            { label: 'Recommendation identity preserved', value: String(batch.recommendationIdentityPreserved) },
            { label: 'Synthetic fixture', value: String(batch.synthetic) },
          ]} />
        </InfoCard>

        <InfoCard title="Reconciliation counts">
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Entity</th><th>Expected</th><th>Received</th><th>Difference</th></tr></thead>
              <tbody>
                {batch.counts.map(count => (
                  <tr key={count.entity} className={count.received === count.expected ? '' : 'rep-diff-removed'}>
                    <td>{count.entity}</td><td>{count.expected}</td><td>{count.received}</td>
                    <td>{count.received - count.expected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>
      </div>

      {batch.exceptions.length > 0 && (
        <div className="validation-banner" role="alert">
          <strong>Reconciliation exceptions</strong>
          <ul className="validation-banner__list">
            {batch.exceptions.map(exception => <li key={exception.id}>[{exception.severity}] {exception.detail}</li>)}
          </ul>
        </div>
      )}

      <InfoCard title="Mapped records">
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Item</th><th>Source identity</th><th>Entity</th><th>Mapped to</th><th>Status</th><th>Note</th></tr></thead>
            <tbody>
              {batch.items.map(item => (
                <tr key={item.id}>
                  <td><code className="rep-code">{item.id}</code></td>
                  <td><code className="rep-code">{item.sourceId}</code></td>
                  <td>{item.entity}</td>
                  <td>{item.mappedTo ?? <span className="rep-muted">Not mapped</span>}</td>
                  <td><Badge status={item.status === 'Missing artifact' ? 'Blocked' : item.status} /></td>
                  <td className="rep-muted">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoCard>

      <InfoCard title="Cutover gate">
        <DefinitionList items={[
          { label: 'Counts balance', value: <Badge status={balanced ? 'Complete' : 'Blocked'} label={balanced ? 'Yes' : 'No'} /> },
          { label: 'Checksums supplied', value: <Badge status={batch.checksumsSupplied ? 'Complete' : 'Blocked'} label={batch.checksumsSupplied ? 'Yes' : 'No'} /> },
          { label: 'Open exceptions', value: batch.exceptions.length },
          { label: 'Ready gate', value: <Badge status={readyGate ? 'Complete' : 'Blocked'} label={readyGate ? 'Simulated ready' : 'Not ready'} /> },
          { label: 'Cutover approved', value: <Badge status={batch.cutoverApproved ? 'Complete' : 'Blocked'} label={String(batch.cutoverApproved)} /> },
        ]} />
        <div className="rep-card-head__actions">
          {can(PERMISSIONS.migrationReconcile) && batch.exceptions.length > 0 && (
            <button className="btn" onClick={() => dispatch({ type: 'FIX_MIGRATION_MANIFEST', payload: { batchId } })}>
              Apply corrected sample manifest
            </button>
          )}
          {can(PERMISSIONS.migrationApproveCutover) && (
            <button className="btn btn--primary" disabled={!readyGate || batch.cutoverApproved} onClick={() => dispatch({ type: 'APPROVE_CUTOVER', payload: { batchId } })}>
              Approve cutover (simulated)
            </button>
          )}
        </div>
        <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
          Original source identity and checksum fields stay traceable on every imported record. A ready gate is not a claim
          that the production migration succeeded.
        </p>
      </InfoCard>

      <SyntheticFooter sources={['F19 — Migration and cutover', 'P33 /operations/migrations/:batchId']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P34 — Integration Operations
 * ------------------------------------------------------------------ */

export function IntegrationOperations() {
  const { integrationEvents, can } = useRep();
  const dispatch = useRepDispatch();
  const [tab, setTab] = useState('adapters');

  const failed = integrationEvents.filter(event => event.status === 'Failed');
  const pending = integrationEvents.filter(event => event.status === 'Pending');

  return (
    <div>
      <PageHeader
        pageId="P34"
        subtitle="Adapter freshness, pending and failed delivery, reconciliation and authorized replay. No real connection is claimed by any row here."
      />

      <div className="rep-kpi-row">
        <Metric label="Adapters" value={INTEGRATION_ADAPTERS.length} />
        <Metric label="Degraded or unconfigured" value={INTEGRATION_ADAPTERS.filter(adapter => adapter.status !== 'Healthy').length} tone="review" />
        <Metric label="Pending delivery" value={pending.length} />
        <Metric label="Failed delivery" value={failed.length} tone={failed.length ? 'blocked' : 'muted'} />
      </div>

      <Tabs
        tabs={[
          { id: 'adapters', label: 'Adapters', count: INTEGRATION_ADAPTERS.length },
          { id: 'events', label: 'Delivery and inbox', count: integrationEvents.length },
        ]}
        active={tab}
        onChange={setTab}
        ariaLabel="Integration views"
      />

      {tab === 'adapters' && (
        <InfoCard title="Existing adapter contracts">
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Adapter</th><th>Direction</th><th>Schema version</th><th>Last success</th><th>Freshness</th><th>Coverage</th><th>Status</th><th>Real connection</th></tr></thead>
              <tbody>
                {INTEGRATION_ADAPTERS.map(adapter => (
                  <tr key={adapter.id}>
                    <td>{adapter.name} <span className="rep-muted">({adapter.id})</span></td>
                    <td>{adapter.direction}</td>
                    <td>v{adapter.schemaVersion}</td>
                    <td>{adapter.lastSuccessAt?.replace('T', ' ').slice(0, 16) ?? 'Never'}</td>
                    <td>{adapter.freshness}</td>
                    <td>{adapter.coverage}</td>
                    <td><Badge status={adapter.status === 'Healthy' ? 'Complete' : adapter.status === 'Degraded' ? 'Review' : 'Blocked'} label={adapter.status} /></td>
                    <td><Badge status="Blocked" label={String(adapter.realConnection)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
            Each consumer has an allowed service surface and a verified actor context. A broad application credential cannot
            impersonate an arbitrary customer user.
          </p>
        </InfoCard>
      )}

      {tab === 'adapters' && (
        <InfoCard title="Candidate external risk data providers">
          <GateBanner badge={F25_STATUS.badge} title="F25 — External risk data services" reference={F25_STATUS.reference}>
            <span>{F25_STATUS.gate}</span>
            <span>
              These are candidates, not adapters. None is deployed, none has confirmed API rights, and none appears in the
              seven contracts defined by F20 above.
            </span>
          </GateBanner>
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Provider</th><th>Type</th><th>Category</th>
                  <th>Contract status</th><th>API rights</th><th>Pricing model</th><th>Licence terms</th><th>Access owner</th>
                </tr>
              </thead>
              <tbody>
                {EXTERNAL_DATA_PROVIDERS.map(provider => (
                  <tr key={provider.id} className="rep-gate-row">
                    <td>{provider.name}</td>
                    <td>{provider.kind}</td>
                    <td>{provider.category}</td>
                    <td><Badge status="Blocked" label={provider.contractStatus} /></td>
                    <td><Badge status="Blocked" label={provider.apiRightsConfirmed === false ? 'Not licensed' : 'Not confirmed'} /></td>
                    <td className="rep-muted">{provider.pricingModel}</td>
                    <td><Badge status="Blocked" label={provider.licenceTermsKnown ? 'Known' : 'Unknown'} /></td>
                    <td className="rep-muted">{provider.accessOwner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-section__title" style={{ marginTop: 'var(--space-4)' }}>Transaction volume for negotiation</div>
          <DefinitionList items={[
            { label: 'Consultants', value: VOLUME_ESTIMATE.consultants },
            { label: 'Reports per consultant per month', value: VOLUME_ESTIMATE.reportsPerConsultantPerMonth },
            { label: 'Stated reports per month', value: VOLUME_ESTIMATE.statedReportsPerMonth },
            { label: 'Derived reports per month', value: `${VOLUME_ESTIMATE.derivedPerMonth} (${VOLUME_ESTIMATE.consultants} x ${VOLUME_ESTIMATE.reportsPerConsultantPerMonth})` },
            { label: 'Stated annual transactions', value: VOLUME_ESTIMATE.statedAnnualTransactions.toLocaleString() },
            { label: 'Calls per report', value: VOLUME_ESTIMATE.callsPerReportMultiplier ?? 'Not established' },
            { label: 'Figures reconcile', value: <Badge status="Blocked" label={String(VOLUME_ESTIMATE.reconciles)} /> },
          ]} />
          <div className="validation-banner" role="alert">
            <strong>Volume figures do not reconcile.</strong> {VOLUME_ESTIMATE.discrepancy}
          </div>
        </InfoCard>
      )}

      {tab === 'events' && (
        <InfoCard title="Events, deduplication and replay">
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Event</th><th>Source</th><th>Type</th><th>Correlation</th><th>Received</th><th>Attempts</th><th>Applied count</th><th>Status</th><th /></tr></thead>
              <tbody>
                {integrationEvents.map((event, index) => (
                  <tr key={`${event.id}-${index}`}>
                    <td>
                      <code className="rep-code">{event.id}</code>
                      {event.duplicateOf && <div className="rep-muted">duplicate of {event.duplicateOf}</div>}
                    </td>
                    <td>{event.source}</td>
                    <td>{event.eventType}</td>
                    <td className="rep-muted">{event.correlationId}</td>
                    <td>{event.receivedAt.replace('T', ' ').slice(0, 16)}</td>
                    <td>{event.attempts}</td>
                    <td>{event.appliedCount}</td>
                    <td>
                      <Badge status={event.status === 'Duplicate ignored' ? 'Not started' : event.status} label={event.status} />
                      {event.lastError && <div className="rep-muted">{event.lastError}</div>}
                    </td>
                    <td>
                      {can(PERMISSIONS.integrationOperate) && event.status === 'Failed' && (
                        <button className="btn" onClick={() => dispatch({ type: 'RETRY_INTEGRATION_EVENT', payload: { eventId: event.id } })}>Retry</button>
                      )}
                      {can(PERMISSIONS.integrationOperate) && event.status === 'Applied' && !event.duplicateOf && (
                        <button className="btn" onClick={() => dispatch({ type: 'REPLAY_INTEGRATION_EVENT', payload: { eventId: event.id } })}>Replay</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
            Replaying the same event produces exactly one application: the duplicate is ignored. A failed delivery can be
            retried without creating a second application.
          </p>
        </InfoCard>
      )}

      <Disclosure label="Integration contracts (F20)">
        <ul className="rep-bullet-list">
          <li>Contracts cover UWWB account and policy status, Account 360, Producer 360, CRM, the enterprise data platform, loss runs and Claims Connect.</li>
          <li>Durable delivery uses versioned contracts, outbox processing, retries, deduplication and reconciliation.</li>
          <li>A demonstration control here is not evidence of an approved or implemented integration.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F20 — Integrations and delivery', 'P34 /operations/integrations']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P35 — Audit and Jobs
 * ------------------------------------------------------------------ */

export function AuditAndJobs() {
  const { auditEvents, jobs } = useRep();
  const [tab, setTab] = useState('audit');
  const [outcome, setOutcome] = useState('');
  const [consumer, setConsumer] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);

  const filteredEvents = auditEvents.filter(event =>
    (!outcome || event.outcome === outcome) && (!consumer || event.consumer === consumer));
  const selectedJob = jobs.find(job => job.id === selectedJobId) ?? null;

  const outcomes = [...new Set(auditEvents.map(event => event.outcome))];
  const consumers = [...new Set(auditEvents.map(event => event.consumer))];

  return (
    <div>
      <PageHeader
        pageId="P35"
        subtitle="Scoped business and security history, plus permitted job status, results and failed operation detail."
      />

      <Tabs
        tabs={[
          { id: 'audit', label: 'Audit history', count: auditEvents.length },
          { id: 'jobs', label: 'Jobs', count: jobs.length },
          { id: 'gates', label: 'Release readiness', count: RELEASE_GATES.length },
        ]}
        active={tab}
        onChange={setTab}
        ariaLabel="Operations views"
      />

      {tab === 'audit' && (
        <>
          <div className="rep-toolbar">
            <div className="form-field">
              <label className="form-label" htmlFor="audit-outcome">Outcome</label>
              <select id="audit-outcome" className="form-select" value={outcome} onChange={event => setOutcome(event.target.value)}>
                <option value="">Any</option>
                {outcomes.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="audit-consumer">Consumer</label>
              <select id="audit-consumer" className="form-select" value={consumer} onChange={event => setConsumer(event.target.value)}>
                <option value="">Any</option>
                {consumers.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </div>

          {filteredEvents.length === 0 ? <EmptyState title="No audit events match this filter" /> : (
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Event</th><th>When</th><th>Actor</th><th>Consumer</th><th>Organization</th><th>Operation</th><th>Resource</th><th>Outcome</th><th>Summary</th></tr></thead>
                <tbody>
                  {filteredEvents.map(event => (
                    <tr key={event.id}>
                      <td><code className="rep-code">{event.id}</code></td>
                      <td>{event.at.replace('T', ' ').slice(0, 19)}</td>
                      <td>{userName(event.actorId)}</td>
                      <td>{event.consumer}</td>
                      <td className="rep-muted">{event.organizationId}</td>
                      <td><code className="rep-code">{event.operation}</code></td>
                      <td className="rep-muted">{event.resource}</td>
                      <td><Badge status={['Allowed', 'Applied'].includes(event.outcome) ? 'Complete' : ['Denied', 'Quarantined'].includes(event.outcome) ? 'Blocked' : 'Review'} label={event.outcome} /></td>
                      <td className="rep-muted">{event.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
            Audit records identify the actor and the verified consumer without leaking sensitive payloads. Support access is
            bounded and attributable.
          </p>
        </>
      )}

      {tab === 'jobs' && (
        <div className="rep-split">
          <InfoCard title="Jobs">
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Job</th><th>Type</th><th>Request</th><th>Attempts</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id} className={job.id === selectedJobId ? 'data-table__row--active' : ''}>
                      <td><code className="rep-code">{job.id}</code></td>
                      <td>{job.type}</td>
                      <td className="rep-muted">{job.requestId ?? '—'}</td>
                      <td>{job.attempts}</td>
                      <td><Badge status={job.status} /></td>
                      <td><button className="btn" onClick={() => setSelectedJobId(job.id)}>Open</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InfoCard>
          {selectedJob && (
            <InfoCard title={`${selectedJob.id} detail`}>
              <DefinitionList items={[
                { label: 'Type', value: selectedJob.type },
                { label: 'Started', value: selectedJob.startedAt?.replace('T', ' ').slice(0, 19) },
                { label: 'Finished', value: selectedJob.finishedAt?.replace('T', ' ').slice(0, 19) ?? 'Running' },
                { label: 'Attempts', value: selectedJob.attempts },
                { label: 'Status', value: <Badge status={selectedJob.status} /> },
                { label: 'Result', value: selectedJob.result ?? '—' },
                { label: 'Error', value: selectedJob.error ?? 'None' },
              ]} />
            </InfoCard>
          )}
        </div>
      )}

      {tab === 'gates' && (
        <InfoCard title="Release readiness">
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Gate</th><th>Status</th><th>Evidence</th></tr></thead>
              <tbody>
                {RELEASE_GATES.map(gate => (
                  <tr key={gate.name}>
                    <td>{gate.name}</td>
                    <td><Badge status="Blocked" label={gate.status} /></td>
                    <td className="rep-muted">{gate.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="validation-banner" role="alert">
            Missing evidence is distinct from a failed gate. Nothing here is production proof, and this package is not
            production ready.
          </div>
        </InfoCard>
      )}

      <Disclosure label="Audit and operations boundaries (F23)">
        <ul className="rep-bullet-list">
          <li>A simulated decision elsewhere in this wireframe creates a readable audit event here.</li>
          <li>Gate status distinguishes missing evidence from failure.</li>
          <li>Every requirement needs a source and a test outcome; a demonstration is not production proof.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F23 — Audit, operations and readiness', 'P35 /operations/audit and /operations/jobs/:jobId']} />
    </div>
  );
}
