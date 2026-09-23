import { useState } from 'react';
import { useRep, useRepDispatch } from '../state/repHooks';
import {
  PageHeader, Badge, InfoCard, DefinitionList, EmptyState, SyntheticFooter, Disclosure, Crumb, Field,
} from '../components/primitives';
import { userName } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

const CONTEXT_LABEL = {
  RecommendationFinding: 'Recommendation finding evidence',
  CustomerMessageAttachment: 'Customer message attachment',
  ReportAttachment: 'Report attachment',
  VendorReport: 'Vendor original report',
};

/* P12 — Evidence (/requests/:requestId/evidence) */
export function EvidencePage({ requestId }) {
  const { evidence, requests, can } = useRep();
  const dispatch = useRepDispatch();
  const [selectedId, setSelectedId] = useState(null);
  const [replacementName, setReplacementName] = useState('');

  const request = requests.find(item => item.id === requestId);
  const items = evidence.filter(item => item.requestId === requestId);
  const selected = items.find(item => item.id === selectedId) ?? items[0] ?? null;

  if (!request) return <EmptyState title="Request not found in this scope" />;

  const grouped = items.reduce((accumulator, item) => {
    accumulator[item.context] = [...(accumulator[item.context] ?? []), item];
    return accumulator;
  }, {});

  return (
    <div>
      <PageHeader
        pageId="P12"
        params={{ requestId }}
        subtitle="Version list, scan state, provenance and permitted audience. This panel is reused wherever evidence appears."
        breadcrumb={<><Crumb pageId="P06" params={{ requestId }}>{requestId}</Crumb><span>/</span><span>evidence</span></>}
      />

      {items.length === 0 ? <EmptyState title="No evidence on this request" /> : (
        <div className="rep-split">
          <div>
            {Object.entries(grouped).map(([context, contextItems]) => (
              <InfoCard key={context} title={CONTEXT_LABEL[context] ?? context}>
                <p className="rep-muted rep-section-intro">
                  {context === 'RecommendationFinding' && 'Attached to a specific finding. Classification follows the finding context.'}
                  {context === 'CustomerMessageAttachment' && 'Contributed through a targeted information request. A different context, and a different audience, from finding evidence.'}
                  {context === 'ReportAttachment' && 'Attached to the report package rather than to a finding.'}
                  {context === 'VendorReport' && 'The vendor original. Authorship is retained after an internal handoff.'}
                </p>
                <div className="rep-table-scroll">
                  <table className="data-table">
                    <thead><tr><th>File</th><th>Latest version</th><th>Scan</th><th>Classification</th><th>Audience</th><th>Linked to</th><th /></tr></thead>
                    <tbody>
                      {contextItems.map(item => (
                        <tr key={item.id} className={item.id === selected?.id ? 'data-table__row--active' : ''}>
                          <td>{item.fileName}</td>
                          <td>v{item.versions[0].version}</td>
                          <td><Badge status={item.versions[0].scanStatus} /></td>
                          <td>{item.classification}</td>
                          <td>{item.audience}</td>
                          <td className="rep-muted">{item.recommendationId ?? item.informationRequestId ?? '—'}</td>
                          <td><button className="btn" onClick={() => setSelectedId(item.id)}>Open</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </InfoCard>
            ))}
          </div>

          {selected && (
            <div>
              <InfoCard title={selected.fileName}>
                <DefinitionList items={[
                  { label: 'Evidence', value: selected.id },
                  { label: 'Context', value: CONTEXT_LABEL[selected.context] ?? selected.context },
                  { label: 'Classification', value: selected.classification },
                  { label: 'Permitted audience', value: selected.audience },
                  { label: 'Linked record', value: selected.recommendationId ?? selected.informationRequestId ?? 'Request level' },
                ]} />
              </InfoCard>

              <InfoCard title="Version history and provenance">
                <div className="rep-table-scroll">
                  <table className="data-table">
                    <thead><tr><th>Version</th><th>Uploaded by</th><th>Uploaded at</th><th>Size</th><th>Hash</th><th>Scan</th><th>Retrieval</th></tr></thead>
                    <tbody>
                      {selected.versions.map(version => (
                        <tr key={version.version}>
                          <td>v{version.version}</td>
                          <td>{userName(version.uploadedBy)}</td>
                          <td>{version.uploadedAt.replace('T', ' ').slice(0, 16)}</td>
                          <td>{version.sizeKb} KB</td>
                          <td><code className="rep-code">{version.hash}</code></td>
                          <td><Badge status={version.scanStatus} /></td>
                          <td>
                            {version.scanStatus === 'Clean'
                              ? <button className="btn" onClick={() => window.alert('Simulation only. In the engine this returns a short-lived authorized URL for this exact clean version from private storage.')}>Download</button>
                              : <span className="rep-muted">Blocked — {version.scanStatus.toLowerCase()}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className="rep-plain-list" style={{ marginTop: 'var(--space-3)' }}>
                  {selected.versions.map(version => <li key={`note-${version.version}`} className="rep-muted">v{version.version}: {version.note}</li>)}
                </ul>
              </InfoCard>

              {can(PERMISSIONS.evidenceUploadScoped) && (
                <InfoCard title="Replace with a new version">
                  <div className="form-grid">
                    <Field label="Replacement file name" span={2} value={replacementName} onChange={setReplacementName} hint="A replacement file is a new version requiring a new scan. Provenance of earlier versions is preserved." />
                  </div>
                  <button
                    className="btn"
                    disabled={!replacementName.trim()}
                    onClick={() => { dispatch({ type: 'ADD_EVIDENCE_VERSION', payload: { evidenceId: selected.id, fileName: replacementName, note: 'Replacement uploaded in this session' } }); setReplacementName(''); }}
                  >
                    Record new version
                  </button>
                </InfoCard>
              )}

              {selected.versions[0].scanStatus === 'Pending' && (
                <InfoCard title="Simulated scan result" tone="muted">
                  <p className="rep-muted">
                    Malware scanning is not implemented here. These controls only demonstrate how a pending version is
                    blocked until a result exists.
                  </p>
                  <div className="rep-card-head__actions">
                    <button className="btn" onClick={() => dispatch({ type: 'SET_SCAN_RESULT', payload: { evidenceId: selected.id, version: selected.versions[0].version, scanStatus: 'Clean' } })}>Record clean</button>
                    <button className="btn" onClick={() => dispatch({ type: 'SET_SCAN_RESULT', payload: { evidenceId: selected.id, version: selected.versions[0].version, scanStatus: 'Rejected' } })}>Record rejected</button>
                  </div>
                </InfoCard>
              )}
            </div>
          )}
        </div>
      )}

      <Disclosure label="Evidence safeguards (F06)">
        <ul className="rep-bullet-list">
          <li>An upload is authorized to a particular record, not to the account generally.</li>
          <li>Pending and rejected versions are blocked from retrieval; only the exact clean version is authorized.</li>
          <li>Finding evidence and message attachments are visibly different contexts with different audiences.</li>
          <li>Replacing a file creates a new version and preserves the provenance of the earlier ones.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F06 — Evidence and documents', 'P12 /requests/:requestId/evidence']} />
    </div>
  );
}
