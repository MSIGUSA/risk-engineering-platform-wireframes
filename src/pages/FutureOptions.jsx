import { useState } from 'react';
import { useRep, useRepDispatch } from '../state/repHooks';
import { PageHeader, Badge, InfoCard, EmptyState, SyntheticFooter, Disclosure, Field, GateBanner } from '../components/primitives';
import { F25_STATUS } from '../data/externalRiskData';

/* F24 — Future Options Register (/roadmap/options) */
export function FutureOptions() {
  const { futureOptions } = useRep();
  const dispatch = useRepDispatch();
  const [draft, setDraft] = useState({});

  return (
    <div>
      <PageHeader
        pageId="F24"
        subtitle="Options kept visible with their evidence and decision gates. Recording a note here does not execute, approve or schedule anything."
      />

      <div className="rep-consumer-banner">
        <div>
          <strong>Options only</strong>
          No F24 tables or runtime features are introduced by the design package. Any future assistant or broker access
          would inherit REP authorization and source boundaries; no autonomous underwriting or cross-customer aggregation is
          implied.
        </div>
      </div>

      {futureOptions.length === 0 ? <EmptyState title="No options recorded" /> : futureOptions.map(option => (
        <InfoCard
          key={option.id}
          title={option.title}
          actions={<Badge status={option.status === 'Out of REP scope' ? 'Blocked' : 'Review'} label={option.status} />}
        >
          {option.isRequirement && (
            <GateBanner badge={F25_STATUS.badge} reference={F25_STATUS.reference}>
              <span>
                This is a stated business requirement, not a parked idea. It was raised after the discovery package was
                sealed, so it is recorded as an addendum rather than as one of the 24 sealed feature areas.
              </span>
              <span>{F25_STATUS.gate}</span>
            </GateBanner>
          )}
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Option</th><th>Status</th><th>Decision owner</th><th>Evidence</th></tr></thead>
              <tbody>
                <tr>
                  <td><code className="rep-code">{option.id}</code></td>
                  <td>{option.status}</td>
                  <td>{option.decisionOwner}</td>
                  <td className="rep-muted">{option.evidence}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="form-grid" style={{ marginTop: 'var(--space-3)' }}>
            <Field
              label="Prioritisation note"
              span={2}
              type="textarea"
              value={draft[option.id] ?? option.note}
              onChange={value => setDraft({ ...draft, [option.id]: value })}
              hint="Approved for build: no. A note records intent for the decision owner; it does not authorize work."
            />
          </div>
          <button
            className="btn"
            disabled={!(draft[option.id] ?? '').trim()}
            onClick={() => { dispatch({ type: 'SET_OPTION_NOTE', payload: { optionId: option.id, note: draft[option.id] } }); setDraft({ ...draft, [option.id]: '' }); }}
          >
            Record note
          </button>
          {option.note && <p className="rep-muted" style={{ marginTop: 'var(--space-2)' }}>Recorded note: {option.note}</p>}
        </InfoCard>
      ))}

      <Disclosure label="Option handling (F24)">
        <ul className="rep-bullet-list">
          <li>Each option shows its unapproved or deferred status together with the decision owner.</li>
          <li>Generic vendor claims and CSAT features are not imported into REP scope.</li>
          <li>Map thumbnails, AI concepts and vendor demonstration controls are not proof of an approved integration.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter
        openDecisions={['Every option on this page is an open decision by definition']}
        sources={['F24 — Future options']}
      />
    </div>
  );
}
