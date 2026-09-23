/**
 * F25 — External risk data services. ADDENDUM SCOPE, NOT APPROVED FOR BUILD.
 *
 * Source: docs/discovery/addendum/f25-external-risk-data.md, raised in the
 * future-state scope lockdown meeting after the discovery package was sealed.
 *
 * Every provider below is gated: the meeting converted this topic into a
 * procurement and cost-feasibility exercise that must complete before any
 * implementation is planned. No provider has confirmed API rights, so no
 * lookup can be performed. That is the current truth, and the wireframe shows
 * it rather than faking a successful result.
 */

export const F25_STATUS = {
  approvedForBuild: false,
  badge: 'Not approved — procurement gated',
  gate: 'Contract inventory, API rights, pricing model, transaction volume and FEMA licensing ownership are all unresolved. The meeting placed cost analysis before implementation planning.',
  reference: 'docs/discovery/addendum/f25-external-risk-data.md',
};

/* The seven sources named in the meeting. Status values are what the meeting
   recorded — not a later assessment. "Not assessed" means exactly that. */
export const EXTERNAL_DATA_PROVIDERS = [
  {
    id: 'CATNET',
    name: 'CatNet',
    kind: 'Commercial',
    category: 'Flood, earthquake, wildfire exposure',
    contractStatus: 'Not assessed',
    apiRightsConfirmed: null,
    pricingModel: 'Unknown',
    licenceTermsKnown: false,
    accessOwner: 'Not identified',
    note: 'Named as a source for exposure information. Contract position not stated in the meeting.',
  },
  {
    id: 'SWISSRE',
    name: 'Swiss Re',
    kind: 'Commercial',
    category: 'Multiple risk categories',
    contractStatus: 'Not assessed',
    apiRightsConfirmed: null,
    pricingModel: 'Unknown',
    licenceTermsKnown: false,
    accessOwner: 'Not identified',
    note: 'Identified as potentially the largest integration challenge because of the variety of risk categories available.',
  },
  {
    id: 'FEMA',
    name: 'FEMA Flood Maps',
    kind: 'Government',
    category: 'Flood mapping',
    contractStatus: 'Not applicable — government source; licensing position unknown',
    apiRightsConfirmed: null,
    pricingModel: 'Not applicable / unknown',
    licenceTermsKnown: false,
    accessOwner: 'Unidentified — offline follow-up recorded',
    note: 'One of the top external sources Risk Engineering uses today. A government source is still not exempt from a licensing determination.',
  },
  {
    id: 'GEPRO',
    name: 'Google Earth Pro',
    kind: 'Commercial',
    category: 'Measurement, property visualisation, permits',
    contractStatus: 'Not licensed',
    apiRightsConfirmed: false,
    pricingModel: 'Unknown — new procurement required',
    licenceTermsKnown: false,
    accessOwner: 'Procurement',
    note: 'Preferred over Google Maps because consultants need distance measurement, property visualisation and building or permit visibility.',
  },
  {
    id: 'NOAA',
    name: 'Global Weather / NOAA',
    kind: 'Government and commercial mix',
    category: 'Predictive weather, storm awareness',
    contractStatus: 'Not licensed',
    apiRightsConfirmed: false,
    pricingModel: 'Unknown — new procurement required',
    licenceTermsKnown: false,
    accessOwner: 'Procurement',
    note: 'Wanted for weather alerts, hurricane tracking and severe-weather awareness, including identifying affected customers for outreach.',
  },
  {
    id: 'NFPA',
    name: 'NFPA Link',
    kind: 'Commercial',
    category: 'Fire protection and sprinkler reference',
    contractStatus: 'In use by consultants; API rights not confirmed',
    apiRightsConfirmed: null,
    pricingModel: 'Unknown',
    licenceTermsKnown: false,
    accessOwner: 'Not identified',
    note: 'Already used by consultants for fire-protection and sprinkler information.',
  },
  {
    id: 'RMSVERISK',
    name: 'RMS / Verisk',
    kind: 'Commercial',
    category: 'Catastrophe modelling',
    contractStatus: 'Existing source; API rights not confirmed',
    apiRightsConfirmed: null,
    pricingModel: 'Unknown',
    licenceTermsKnown: false,
    accessOwner: 'Not identified',
    note: 'Existing catastrophe-modelling sources referenced during the discussion.',
  },
];

/* Recorded volume estimates. The two figures do not reconcile; the wireframe
   shows the discrepancy rather than silently choosing one. */
export const VOLUME_ESTIMATE = {
  consultants: 20,
  reportsPerConsultantPerMonth: 14,
  statedReportsPerMonth: 168,
  statedAnnualTransactions: 3360,
  derivedPerMonth: 280,
  callsPerReportMultiplier: null,
  reconciles: false,
  discrepancy:
    '20 consultants x 14 reports/month = 280 per month = 3,360 per year, which matches the annual figure but not the stated 168 per month. 168 is 14 x 12, which is one consultant’s annual output. Confirm before using either number in a negotiation.',
  meteringNote: 'API pricing is generally metered by transaction volume rather than by named account.',
};

/* The shape a lookup WOULD return. This is a schema illustration, not a result:
   no call is made, and no value here came from a provider. */
export const LOOKUP_SHAPE_PREVIEW = {
  lookupId: 'LOOKUP-DEMO-01',
  provider: 'FEMA Flood Map Service Center',
  scopeResolvedBy: 'REP engine',
  entitlementWidened: false,
  attributes: [
    { field: 'floodZone', illustrativeValue: 'Illustrative only — no determination made', required: 'Provider' },
    { field: 'panelReference', illustrativeValue: 'Illustrative only', required: 'Provider' },
    { field: 'panelEffectiveDate', illustrativeValue: 'Illustrative only', required: 'Provider' },
  ],
  provenance: [
    { field: 'sourceCitation', value: 'Required on every returned attribute' },
    { field: 'retrievedAt', value: 'Required — an undated attribute is not usable as evidence' },
  ],
  licence: [
    { field: 'permitsAutomatedAccess', value: 'Unknown' },
    { field: 'permitsStorage', value: 'Unknown' },
    { field: 'permitsCustomerRedistribution', value: 'Unknown — blocks release until answered' },
    { field: 'retentionOnTermination', value: 'Unknown' },
  ],
  billing: [
    { field: 'countedAs', value: '1 transaction' },
    { field: 'pricingModel', value: 'Unknown' },
  ],
  producesRiskScore: false,
  producesUnderwritingDecision: false,
};

/* Which providers a given site would plausibly be queried against. Used only to
   scope the disabled controls; no data is retrieved. */
export const SITE_PROVIDER_RELEVANCE = {
  'SITE-01': ['FEMA', 'CATNET', 'NOAA', 'GEPRO'],
  'SITE-02': ['FEMA', 'CATNET', 'NOAA'],
  'SITE-03': ['FEMA', 'NFPA', 'CATNET'],
  'SITE-04': ['CATNET', 'RMSVERISK', 'NOAA', 'NFPA'],
  'SITE-05': ['CATNET', 'NOAA', 'GEPRO'],
  'SITE-06': ['FEMA', 'NOAA', 'GEPRO'],
};

export function providersForSite(siteId) {
  const ids = SITE_PROVIDER_RELEVANCE[siteId] ?? [];
  return EXTERNAL_DATA_PROVIDERS.filter(provider => ids.includes(provider.id));
}

/** Why a lookup cannot run. Returns null only if a provider is genuinely available. */
export function lookupBlockedReason(provider) {
  if (provider.apiRightsConfirmed === false) {
    return `${provider.name} is not licensed. New procurement is required before any API access.`;
  }
  if (provider.apiRightsConfirmed === null) {
    return `${provider.name} has no confirmed API rights. The contract position is "${provider.contractStatus}".`;
  }
  return null;
}
