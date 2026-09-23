import { useState } from 'react';
import { useRep, useRepDispatch } from '../state/repHooks';
import { InfoCard, Badge, GateBanner, Disclosure, EmptyState } from './primitives';
import { PERMISSIONS } from '../config/repConfig';
import { siteName } from '../data/repository';
import {
  F25_STATUS, providersForSite, lookupBlockedReason, LOOKUP_SHAPE_PREVIEW, VOLUME_ESTIMATE,
} from '../data/externalRiskData';

/**
 * F25 — External risk data services. Shown on P04 (site context) and P10
 * (during a survey). Every provider is blocked; attempting a lookup explains
 * which contract is missing rather than returning an empty result, which is
 * the behaviour F25 specifies.
 */
export default function ExternalRiskDataPanel({ siteId, variant = 'site' }) {
  const { can } = useRep();
  const dispatch = useRepDispatch();
  const [lastAttempt, setLastAttempt] = useState(null);

  if (!can(PERMISSIONS.externalDataLookup)) return null;

  const providers = providersForSite(siteId);

  function attemptLookup(provider) {
    const reason = lookupBlockedReason(provider);
    setLastAttempt({ provider, reason });
    dispatch({
      type: 'PUSH_NOTICE',
      payload: {
        text: `Lookup unavailable — ${reason} No call was made and nothing was billed.`,
        tone: 'warning',
      },
    });
  }

  return (
    <InfoCard title={`External risk data${variant === 'survey' ? ' during this survey' : ''}`}>
      <GateBanner badge={F25_STATUS.badge} title="F25 — External risk data services" reference={F25_STATUS.reference}>
        <span>{F25_STATUS.gate}</span>
        <span>
          This panel shows the requirement and its blockers. It does not call any provider, and no value shown here came
          from one.
        </span>
      </GateBanner>

      {providers.length === 0 ? (
        <EmptyState title="No candidate providers mapped to this site" />
      ) : (
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Provider</th><th>Type</th><th>Category</th>
                <th>Contract status</th><th>API rights</th><th>Pricing model</th><th>Lookup</th>
              </tr>
            </thead>
            <tbody>
              {providers.map(provider => {
                const reason = lookupBlockedReason(provider);
                return (
                  <tr key={provider.id} className="rep-gate-row">
                    <td>
                      {provider.name}
                      <div className="rep-muted">{provider.note}</div>
                    </td>
                    <td>{provider.kind}</td>
                    <td>{provider.category}</td>
                    <td>
                      <Badge status="Blocked" label={provider.contractStatus} />
                      {provider.accessOwner && <span className="rep-blocked-reason">Owner: {provider.accessOwner}</span>}
                    </td>
                    <td>
                      <Badge
                        status="Blocked"
                        label={provider.apiRightsConfirmed === false ? 'Not licensed' : 'Not confirmed'}
                      />
                    </td>
                    <td className="rep-muted">{provider.pricingModel}</td>
                    <td>
                      <button className="btn" onClick={() => attemptLookup(provider)} title={reason}>
                        Look up
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {lastAttempt && (
        <div className="validation-banner" role="alert">
          <strong>Unavailable, not empty.</strong> {lastAttempt.reason}
          <div className="rep-muted" style={{ marginTop: 4 }}>
            A provider without an active API contract must render as explicitly unavailable, naming the missing contract.
            An empty result would wrongly suggest the site has no exposure.
          </div>
        </div>
      )}

      {variant === 'survey' && (
        <p className="rep-muted">
          Each successful call would be metered as one transaction against a volume tier, not against a named user.
          {' '}{VOLUME_ESTIMATE.meteringNote} A calls-per-report multiplier has not been established, so one survey may
          consume several transactions.
        </p>
      )}

      <Disclosure label="Preview the attribute shape a lookup would return">
        <p className="rep-muted">
          Schema illustration only. No call is made and no value below came from a provider.
        </p>
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Block</th><th>Field</th><th>Illustrative value</th></tr></thead>
            <tbody>
              {LOOKUP_SHAPE_PREVIEW.attributes.map(row => (
                <tr key={`attr-${row.field}`}>
                  <td>Attributes</td><td><code className="rep-code">{row.field}</code></td><td className="rep-muted">{row.illustrativeValue}</td>
                </tr>
              ))}
              {LOOKUP_SHAPE_PREVIEW.provenance.map(row => (
                <tr key={`prov-${row.field}`}>
                  <td>Provenance</td><td><code className="rep-code">{row.field}</code></td><td className="rep-muted">{row.value}</td>
                </tr>
              ))}
              {LOOKUP_SHAPE_PREVIEW.licence.map(row => (
                <tr key={`lic-${row.field}`}>
                  <td>Licence</td><td><code className="rep-code">{row.field}</code></td><td className="rep-muted">{row.value}</td>
                </tr>
              ))}
              {LOOKUP_SHAPE_PREVIEW.billing.map(row => (
                <tr key={`bill-${row.field}`}>
                  <td>Billing</td><td><code className="rep-code">{row.field}</code></td><td className="rep-muted">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="rep-bullet-list" style={{ marginTop: 'var(--space-3)' }}>
          <li>A lookup is scoped to {siteName(siteId)} only; it never widens account or site entitlement.</li>
          <li>Licence terms are unknown, so no attribute may appear in customer-facing released output yet.</li>
          <li>Third-party data informs engineering judgment. It produces no risk score and no underwriting decision.</li>
        </ul>
      </Disclosure>
    </InfoCard>
  );
}
