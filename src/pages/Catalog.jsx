import { useState } from 'react';
import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';
import {
  PageHeader, Badge, InfoCard, DefinitionList, EmptyState, SyntheticFooter, Disclosure, Crumb, Tabs, Metric,
} from '../components/primitives';
import { userName } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

const KIND_TABS = [
  { id: 'InputForm', label: 'Input forms' },
  { id: 'OutputTemplate', label: 'Output templates' },
  { id: 'RecommendationWording', label: 'Recommendation wording' },
];

/* ------------------------------------------------------------------ *
 * P30 — Governed Catalog
 * ------------------------------------------------------------------ */

export function GovernedCatalog() {
  const { templates } = useRep();
  const navigate = useNavigate();
  const [kind, setKind] = useState('InputForm');

  const items = templates.filter(template => template.kind === kind);

  return (
    <div>
      <PageHeader
        pageId="P30"
        subtitle="A reviewed inventory of input forms, output templates and recommendation wording. Versions are imported, reviewed and published — this is not a drag-and-drop designer or a scripting environment."
      />

      <div className="rep-kpi-row">
        {KIND_TABS.map(tab => (
          <Metric
            key={tab.id}
            label={tab.label}
            value={templates.filter(template => template.kind === tab.id).length}
            detail={`${templates.filter(template => template.kind === tab.id && template.status === 'Published').length} published`}
            tone={kind === tab.id ? 'complete' : 'muted'}
          />
        ))}
      </div>

      <Tabs tabs={KIND_TABS.map(tab => ({ ...tab, count: templates.filter(template => template.kind === tab.id).length }))} active={kind} onChange={setKind} ariaLabel="Catalog inventories" />

      <p className="rep-muted rep-section-intro">
        The three inventories stay separate. A form is not an output template, and customer-facing wording approval is a
        distinct permission from publishing a form.
      </p>

      {items.length === 0 ? <EmptyState title="No entries in this inventory" /> : (
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Template</th><th>Owner</th><th>Current version</th><th>Business approved</th><th>Wording approved</th><th>Applicability</th><th>Status</th></tr></thead>
            <tbody>
              {items.map(template => (
                <tr key={template.id}>
                  <td>
                    <button className="table-link" onClick={() => navigate('P31', { templateId: template.id, versionId: String(template.currentVersion) })}>
                      {template.name}
                    </button>
                    <div className="rep-muted"><code className="rep-code">{template.id}</code></div>
                  </td>
                  <td className="rep-muted">{template.owner}</td>
                  <td>v{template.currentVersion}</td>
                  <td><Badge status={template.businessApproved ? 'Complete' : 'Blocked'} label={template.businessApproved ? 'Yes' : 'Outstanding'} /></td>
                  <td><Badge status={template.wordingApproved ? 'Complete' : 'Blocked'} label={template.wordingApproved ? 'Yes' : 'Outstanding'} /></td>
                  <td>{template.applicability.join(', ')}</td>
                  <td><Badge status={template.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Disclosure label="Catalog governance (F22)">
        <ul className="rep-bullet-list">
          <li>Template use, publication and customer-facing wording approval are distinct permissions.</li>
          <li>Missing approval blocks publication.</li>
          <li>Publishing a new version leaves previously pinned versions on existing work intact.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter
        openDecisions={['Approved structured templates have not been supplied as source artifacts']}
        sources={['F22 — Governed catalog', 'P30 /administration/catalog']}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P31 — Catalog Version
 * ------------------------------------------------------------------ */

export function CatalogVersion({ templateId, versionId }) {
  const { templates, can } = useRep();
  const dispatch = useRepDispatch();
  const [compareTo, setCompareTo] = useState(null);

  const template = templates.find(item => item.id === templateId);
  if (!template) return <EmptyState title="Template not found" />;

  const version = template.versions.find(item => String(item.version) === String(versionId)) ?? template.versions[0];
  const previous = template.versions.find(item => item.version === version.version - 1);
  const comparison = compareTo ? template.versions.find(item => String(item.version) === String(compareTo)) : previous;

  const publishable = template.businessApproved && template.wordingApproved && version.status === 'Draft';
  const blockingReasons = [
    !template.businessApproved && 'Business approval is outstanding.',
    !template.wordingApproved && 'Customer-facing wording approval is outstanding.',
  ].filter(Boolean);

  return (
    <div>
      <PageHeader
        pageId="P31"
        params={{ templateId, versionId: String(version.version) }}
        title={`${template.name} — version ${version.version}`}
        subtitle="Read the approved schema, UI metadata and wording, the validation results and the version difference. Publication and retirement happen through commands, not a general designer."
        breadcrumb={<><Crumb pageId="P30">Catalog</Crumb><span>/</span><span>{template.id}</span><span>/</span><span>v{version.version}</span></>}
      />

      <div className="rep-grid rep-grid--two">
        <InfoCard title="Version metadata">
          <DefinitionList items={[
            { label: 'Template', value: `${template.name} (${template.id})` },
            { label: 'Kind', value: template.kind },
            { label: 'Version', value: version.version },
            { label: 'Status', value: <Badge status={version.status} /> },
            { label: 'Published at', value: version.publishedAt ?? 'Not published' },
            { label: 'Published by', value: version.publishedBy ? userName(version.publishedBy) : '—' },
            { label: 'Content hash', value: <code className="rep-code">{version.hash}</code> },
            { label: 'Publication mode', value: template.publicationMode },
          ]} />
        </InfoCard>

        <InfoCard title="Validation results">
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Check</th><th>Result</th></tr></thead>
              <tbody>
                <tr><td>Schema parses and validates</td><td><Badge status="Complete" label="Pass (simulated)" /></td></tr>
                <tr><td>UI metadata references known fields</td><td><Badge status="Complete" label="Pass (simulated)" /></td></tr>
                <tr><td>Business approval recorded</td><td><Badge status={template.businessApproved ? 'Complete' : 'Blocked'} label={template.businessApproved ? 'Recorded' : 'Missing'} /></td></tr>
                <tr><td>Customer wording approval recorded</td><td><Badge status={template.wordingApproved ? 'Complete' : 'Blocked'} label={template.wordingApproved ? 'Recorded' : 'Missing'} /></td></tr>
                <tr><td>Test fixtures present</td><td>{template.testFixtures.length ? <Badge status="Complete" label={template.testFixtures.join(', ')} /> : <Badge status="Blocked" label="None" />}</td></tr>
              </tbody>
            </table>
          </div>
        </InfoCard>
      </div>

      <InfoCard
        title="Version difference"
        actions={(
          <select className="form-select" style={{ maxWidth: 180 }} value={compareTo ?? previous?.version ?? ''} onChange={event => setCompareTo(event.target.value)}>
            {template.versions.filter(item => item.version !== version.version).map(item => (
              <option key={item.version} value={item.version}>Compare with v{item.version}</option>
            ))}
          </select>
        )}
      >
        {!comparison ? <EmptyState title="No earlier version to compare" /> : (
          <div className="rep-compare">
            <div className="rep-compare__col">
              <div className="rep-compare__title">Version {comparison.version} — {comparison.status}</div>
              <p>{comparison.changeSummary}</p>
              <p className="rep-muted">Hash <code className="rep-code">{comparison.hash}</code></p>
            </div>
            <div className="rep-compare__col">
              <div className="rep-compare__title">Version {version.version} — {version.status}</div>
              <p className="rep-diff-added" style={{ padding: 4, borderRadius: 4 }}>{version.changeSummary}</p>
              <p className="rep-muted">Hash <code className="rep-code">{version.hash}</code></p>
            </div>
          </div>
        )}
      </InfoCard>

      <InfoCard title="Publication">
        {blockingReasons.length > 0 && (
          <div className="validation-banner" role="alert">
            Publication is blocked.
            <ul className="validation-banner__list">
              {blockingReasons.map((reason, index) => <li key={index}>{reason}</li>)}
            </ul>
          </div>
        )}
        {can(PERMISSIONS.templatePublish) ? (
          <div className="rep-card-head__actions">
            <button
              className="btn btn--primary"
              disabled={!publishable}
              onClick={() => dispatch({ type: 'PUBLISH_TEMPLATE_VERSION', payload: { templateId: template.id, version: version.version } })}
            >
              Publish version {version.version}
            </button>
            <button className="btn" disabled={version.status !== 'Published'} onClick={() => window.alert('Simulation only. Retiring a version stops new use but leaves versions already pinned to existing work untouched.')}>
              Retire version
            </button>
          </div>
        ) : (
          <p className="rep-muted">Publication requires <code>Template.Publish</code>. Using a template is a separate permission.</p>
        )}
        <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
          A published version cannot be edited in place. Work already pinned to an earlier version keeps that version.
        </p>
      </InfoCard>

      <InfoCard title="All versions">
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Version</th><th>Status</th><th>Published</th><th>By</th><th>Change summary</th></tr></thead>
            <tbody>
              {template.versions.map(item => (
                <tr key={item.version} className={item.version === version.version ? 'data-table__row--active' : ''}>
                  <td>v{item.version}</td>
                  <td><Badge status={item.status} /></td>
                  <td>{item.publishedAt ?? '—'}</td>
                  <td>{item.publishedBy ? userName(item.publishedBy) : '—'}</td>
                  <td className="rep-muted">{item.changeSummary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoCard>

      <SyntheticFooter sources={['F22 — Governed catalog', 'P31 /administration/catalog/:templateId/versions/:versionId']} />
    </div>
  );
}
