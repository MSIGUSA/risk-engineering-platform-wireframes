import { useState } from 'react';
import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';
import {
  PageHeader, Badge, InfoCard, DefinitionList, EmptyState, SyntheticFooter, Disclosure, Crumb, Field, Metric,
} from '../components/primitives';
import { ACCOUNTS, SITES, accountName, siteName, userName } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

/* ------------------------------------------------------------------ *
 * P36 — Impairment Register (phase undecided)
 * ------------------------------------------------------------------ */

export function ImpairmentRegister() {
  const { impairments, can } = useRep();
  const dispatch = useRepDispatch();
  const navigate = useNavigate();
  const [showIntake, setShowIntake] = useState(false);
  const [form, setForm] = useState({
    accountId: 'ACCT-100', siteId: 'SITE-01', system: '', reportedBy: '', reportedVia: 'Email (unverified channel)',
    reason: '', start: '', expectedRestoration: '',
  });

  const open = impairments.filter(item => item.status === 'Reported');

  return (
    <div>
      <PageHeader
        pageId="P36"
        subtitle="Dedicated-team list, intake and expected restoration. This module coordinates workflow only: it provides no fire-safety advice and verifies no restoration."
        actions={can(PERMISSIONS.impairmentManage) && (
          <button className="btn btn--primary" onClick={() => setShowIntake(!showIntake)}>
            {showIntake ? 'Close intake' : 'Record impairment'}
          </button>
        )}
      />

      <div className="rep-consumer-banner">
        <div>
          <strong>Phase undecided</strong>
          Fire impairment tables are marked phase-undecided in the design package. A dedicated-team permission is required;
          general RE membership does not grant it, and intake identity and public-channel verification remain open questions.
        </div>
      </div>

      <div className="rep-kpi-row">
        <Metric label="Open impairments" value={open.length} tone={open.length ? 'blocked' : 'muted'} />
        <Metric label="Restored" value={impairments.filter(item => item.status === 'Restored').length} tone="complete" />
        <Metric label="Register total" value={impairments.length} />
      </div>

      {showIntake && (
        <InfoCard title="Intake">
          <div className="form-grid">
            <Field label="Account" required value={form.accountId} onChange={value => setForm({ ...form, accountId: value, siteId: '' })} options={ACCOUNTS.map(account => ({ value: account.id, label: account.name }))} />
            <Field label="Site" required value={form.siteId} onChange={value => setForm({ ...form, siteId: value })} options={SITES.filter(site => site.accountId === form.accountId).map(site => ({ value: site.id, label: site.name }))} />
            <Field label="System" required value={form.system} onChange={value => setForm({ ...form, system: value })} />
            <Field label="Reported by" required value={form.reportedBy} onChange={value => setForm({ ...form, reportedBy: value })} hint="Reporter identity is not verified in this wireframe. Intake identity verification is an open decision." />
            <Field label="Reported via" value={form.reportedVia} onChange={value => setForm({ ...form, reportedVia: value })} options={['Email (unverified channel)', 'Telephone', 'Claims Connect message', 'Public channel (unverified)']} />
            <Field label="Reason" span={2} type="textarea" value={form.reason} onChange={value => setForm({ ...form, reason: value })} />
            <Field label="Start" type="datetime-local" value={form.start} onChange={value => setForm({ ...form, start: value })} />
            <Field label="Expected restoration" type="datetime-local" value={form.expectedRestoration} onChange={value => setForm({ ...form, expectedRestoration: value })} />
          </div>
          <button
            className="btn btn--primary"
            disabled={!form.system.trim() || !form.reportedBy.trim() || !form.siteId}
            onClick={() => dispatch({ type: 'CREATE_IMPAIRMENT', payload: form })}
          >
            Open impairment record
          </button>
        </InfoCard>
      )}

      {impairments.length === 0 ? <EmptyState title="No impairment records" /> : (
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Impairment</th><th>Account</th><th>Site</th><th>System</th><th>Start</th><th>Expected restoration</th><th>Owner</th><th>Status</th></tr></thead>
            <tbody>
              {impairments.map(item => (
                <tr key={item.id}>
                  <td><button className="table-link" onClick={() => navigate('P37', { impairmentId: item.id })}>{item.id}</button></td>
                  <td>{accountName(item.accountId)}</td>
                  <td>{siteName(item.siteId)}</td>
                  <td>{item.system}</td>
                  <td>{item.start.replace('T', ' ')}</td>
                  <td>{item.expectedRestoration.replace('T', ' ')}</td>
                  <td>{userName(item.ownerId)}</td>
                  <td><Badge status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SyntheticFooter
        openDecisions={['Phase for the impairment module', 'Intake identity and public-channel verification']}
        sources={['F21 — Fire impairment', 'P36 /impairments']}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P37 — Impairment Detail
 * ------------------------------------------------------------------ */

export function ImpairmentDetail({ impairmentId }) {
  const { impairments, can } = useRep();
  const dispatch = useRepDispatch();
  const [evidenceDetail, setEvidenceDetail] = useState('');

  const record = impairments.find(item => item.id === impairmentId);
  if (!record) return <EmptyState title="Impairment not found" />;

  const canClose = Boolean(record.restorationEvidenceId) && record.status !== 'Restored';

  return (
    <div>
      <PageHeader
        pageId="P37"
        params={{ impairmentId }}
        title={`${record.id} — ${record.system}`}
        subtitle="Reported condition, responsible person, follow-up events, restoration evidence and controlled closure."
        breadcrumb={<><Crumb pageId="P36">Impairments</Crumb><span>/</span><span>{record.id}</span></>}
      />

      <div className="rep-grid rep-grid--two">
        <InfoCard title="Reported condition">
          <DefinitionList items={[
            { label: 'Account', value: `${accountName(record.accountId)} (${record.accountId})` },
            { label: 'Site', value: `${siteName(record.siteId)} (${record.siteId})` },
            { label: 'System', value: record.system },
            { label: 'Reason', value: record.reason },
            { label: 'Start', value: record.start.replace('T', ' ') },
            { label: 'Expected restoration', value: record.expectedRestoration.replace('T', ' ') },
            { label: 'Status', value: <Badge status={record.status} /> },
          ]} />
        </InfoCard>

        <InfoCard title="Responsibility and intake">
          <DefinitionList items={[
            { label: 'Responsible owner', value: userName(record.ownerId) },
            { label: 'Reported by', value: record.reportedBy },
            { label: 'Reported via', value: record.reportedVia },
            { label: 'Reporter verified', value: 'No — intake identity verification is an open decision' },
            { label: 'Safety assessment', value: record.safetyAssessment },
            { label: 'Restoration evidence', value: record.restorationEvidenceId ?? 'Not recorded' },
          ]} />
        </InfoCard>
      </div>

      {can(PERMISSIONS.impairmentManage) && (
        <InfoCard title="Follow-up and closure">
          {!record.restorationEvidenceId && record.status !== 'Restored' && (
            <div className="validation-banner" role="alert">
              Closure is denied until restoration evidence is recorded.
            </div>
          )}
          <div className="form-grid">
            <Field
              label="Restoration evidence detail"
              span={2}
              type="textarea"
              value={evidenceDetail}
              onChange={setEvidenceDetail}
              readOnly={record.status === 'Restored'}
              hint="Recording evidence here is a coordination record. This wireframe does not verify that a system was actually restored."
            />
          </div>
          <div className="rep-card-head__actions">
            <button
              className="btn"
              disabled={Boolean(record.restorationEvidenceId) || !evidenceDetail.trim()}
              onClick={() => { dispatch({ type: 'RECORD_IMPAIRMENT_EVIDENCE', payload: { impairmentId, detail: evidenceDetail } }); setEvidenceDetail(''); }}
            >
              Record restoration evidence
            </button>
            <button
              className="btn btn--primary"
              disabled={!canClose}
              onClick={() => dispatch({ type: 'CLOSE_IMPAIRMENT', payload: { impairmentId } })}
            >
              {record.status === 'Restored' ? 'Closed' : 'Close impairment'}
            </button>
          </div>
        </InfoCard>
      )}

      <InfoCard title="History">
        <ul className="rep-timeline">
          {record.history.map((entry, index) => (
            <li key={index} className="rep-timeline__item">
              <div className="rep-timeline__meta">{entry.at.replace('T', ' ').slice(0, 19)} · {userName(entry.actor)}</div>
              <strong>{entry.event}</strong> — {entry.detail}
            </li>
          ))}
        </ul>
        <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
          The history retains both the intake and the restoration events; closing does not erase the original report.
        </p>
      </InfoCard>

      <Disclosure label="Impairment safeguards (F21)">
        <ul className="rep-bullet-list">
          <li>Intake produces an open record; it does not assess fire safety.</li>
          <li>Closure fails without evidence and succeeds only after evidence has been recorded.</li>
          <li>A dedicated-team permission is required; general RE membership does not grant it.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter
        openDecisions={['Phase for the impairment module', 'Intake identity and public-channel verification']}
        sources={['F21 — Fire impairment', 'P37 /impairments/:impairmentId']}
      />
    </div>
  );
}
