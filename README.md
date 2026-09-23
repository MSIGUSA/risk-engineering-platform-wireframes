# Risk Engineering Platform — wireframes

Navigable wireframes for the Risk Engineering Platform (REP), built from the discovery package in
[`../docs`](../docs). Every screen, route and permission name below comes from those documents; nothing
here was invented to fill a gap.

> **Illustrative discovery wireframe.** All operational data is synthetic. No real authorization,
> persistence, malware scanning, sending, signing, migration, AI or external integration is implemented.
> Role switching in the top bar is a test harness, not a security control.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

Requires Node.js 20 or newer. Verified on Node 24.21.0 LTS with npm 11.19.0.

## Tech stack and design system

Identical to the Claims Workbench wireframes repository:

| Concern | Choice |
|---|---|
| Build | Vite 8 |
| UI | React 19, plain JSX (no TypeScript) |
| Routing | State-driven page switching in a reducer — no router dependency |
| State | React Context + `useReducer` (`src/state/RepContext.jsx`) |
| Styling | Hand-written CSS with design tokens; no CSS framework |
| Fonts | Inter (400/500/600/700) via Google Fonts |
| Icons | Unicode glyphs and CSS shapes only — no icon library |

`src/index.css` and `src/App.css` are copied unchanged from Claims Workbench, so the brand palette
(navy `#10254d`, red `#c62845`), neutral ramp, status-chip colours, spacing scale, radii, shadows,
motion curves and typography are byte-for-byte the same. `src/rep.css` adds only REP-specific
components (page-identifier chips, section tree, wizard, calendar grid, metric tiles, denial panels)
using the same tokens.

## Application shell

The same four-region shell as Claims Workbench:

- **`TopNavigator`** — brand lockup, organization context chip, current page chip, user switcher, reset.
- **`WorkspaceNavigation`** — left navigation, grouped, filtered by the signed-in role's permissions.
- **`WorkspacePanel`** — lazy-loaded page router keyed on the design page identifier.
- **`ContextSidebar`** — right-hand account context (account, sites and policies, contacts, evidence,
  RE-only notes) shown whenever the active page carries an account or request.

## Page inventory

All 37 pages from [`docs/application-detailed-design.md` §4](../docs/application-detailed-design.md),
plus the two separate consumer surfaces and the F24 options register named in the same document.

| Page | Route | File |
|---|---|---|
| P01 My Work | `/workbench` | `pages/MyWork.jsx` |
| P02 Account Search | `/accounts` | `pages/Accounts.jsx` |
| P03 Account Workspace | `/accounts/:accountId` | `pages/Accounts.jsx` |
| P04 Site Workspace | `/accounts/:accountId/sites/:siteId` | `pages/Accounts.jsx` |
| P05 New Request | `/requests/new` | `pages/NewRequest.jsx` |
| P06 Request Workspace | `/requests/:requestId` | `pages/RequestWorkspace.jsx` |
| P07 Triage and Assignment | `/work/triage` | `pages/WorkPlanning.jsx` |
| P08 Calendar | `/work/calendar` | `pages/WorkPlanning.jsx` |
| P09 Task Detail | `/tasks/:taskId` | `pages/WorkPlanning.jsx` |
| P10 Survey Workspace | `/surveys/:surveyId` | `pages/SurveyWorkspace.jsx` |
| P11 Historical Copy | `/requests/:requestId/copy` | `pages/HistoricalCopy.jsx` |
| P12 Evidence | `/requests/:requestId/evidence` | `pages/Evidence.jsx` |
| P13 Recommendation Queue | `/recommendations` | `pages/Recommendations.jsx` |
| P14 Recommendation Detail | `/recommendations/:recommendationId` | `pages/Recommendations.jsx` |
| P15 Review Queue | `/reviews` | `pages/ReviewRelease.jsx` |
| P16 Review Workspace | `/requests/:requestId/review` | `pages/ReviewRelease.jsx` |
| P17 Correspondence | `/requests/:requestId/correspondence` | `pages/ReviewRelease.jsx` |
| P18 Service Plans | `/service-plans` | `pages/ServicePlans.jsx` |
| P19 Service Plan Workspace | `/service-plans/:planId` | `pages/ServicePlans.jsx` |
| P20 RE Instructions | `/accounts/:accountId/instructions` | `pages/ServicePlans.jsx` |
| P21 Messages and Information Requests | `/requests/:requestId/collaboration` | `pages/Collaboration.jsx` |
| P22 Vendor Handoff | `/requests/:requestId/vendor-work` | `pages/Collaboration.jsx` |
| P23 My Time | `/time` | `pages/Time.jsx` |
| P24 Team Time | `/time/team` | `pages/Time.jsx` |
| P25 Quality Reviews | `/quality-reviews` | `pages/Quality.jsx` |
| P26 Quality Review Detail | `/quality-reviews/:reviewId` | `pages/Quality.jsx` |
| P27 Management Insights | `/insights` | `pages/Insights.jsx` |
| P28 Organization Team Access | `/administration/organizations/:organizationId/team` | `pages/Administration.jsx` |
| P29 Permission Administration | `/administration/access` | `pages/Administration.jsx` |
| P30 Governed Catalog | `/administration/catalog` | `pages/Catalog.jsx` |
| P31 Catalog Version | `/administration/catalog/:templateId/versions/:versionId` | `pages/Catalog.jsx` |
| P32 Migration | `/operations/migrations` | `pages/Operations.jsx` |
| P33 Migration Batch | `/operations/migrations/:batchId` | `pages/Operations.jsx` |
| P34 Integration Operations | `/operations/integrations` | `pages/Operations.jsx` |
| P35 Audit and Jobs | `/operations/audit`, `/operations/jobs/:jobId` | `pages/Operations.jsx` |
| P36 Impairment Register | `/impairments` *(phase undecided)* | `pages/Impairment.jsx` |
| P37 Impairment Detail | `/impairments/:impairmentId` *(phase undecided)* | `pages/Impairment.jsx` |
| C01 Claims Connect — REP area | separate consumer surface | `pages/ConsumerSurfaces.jsx` |
| V01 Vendor Assigned Work | separate consumer surface | `pages/ConsumerSurfaces.jsx` |
| F24 Future Options Register | `/roadmap/options` | `pages/FutureOptions.jsx` |

Each page header displays its design identifier, route and API group so a reviewer can trace any screen
back to the design document.

## Unapproved scope shown as gated

Two areas appear in the wireframe without being approved for build. Both are badged so a reviewer cannot
mistake them for working capability.

| Area | Treatment |
|---|---|
| Fire impairment (P36, P37) | "Phase undecided" badge, per the design package |
| External risk data (F25) | "Not approved — procurement gated" badge on P04, P10, P34 and the F24 options register |

F25 covers in-platform lookup of catastrophe, weather, flood, earthquake, wildfire, mapping and property
intelligence from CatNet, Swiss Re, FEMA flood maps, Google Earth Pro, Global Weather/NOAA, NFPA Link and
RMS/Verisk. It was raised after the discovery package was sealed and is recorded in
[docs/discovery/addendum/f25-external-risk-data.md](../docs/discovery/addendum/f25-external-risk-data.md).
It adds no page or route.

The lookup buttons are deliberately live. Pressing one returns the explicit *unavailable, naming the
missing contract* response the requirement specifies, rather than an empty result that would wrongly
suggest a site has no exposure. No provider is called, nothing is billed, and no displayed value came
from a provider. P34 also shows the recorded transaction-volume estimate together with the discrepancy
in it — the meeting recorded both 168 reports/month and ~3,360 annual transactions, which do not
reconcile.

## Demonstration user profiles

Switch users from the top-right selector. Left navigation, page access and in-page controls all change
with the signed-in role.

| User | Role | What the role demonstrates |
|---|---|---|
| Dana Whitfield | Risk Engineer (Property) | Assigned work, survey execution, drafts, evidence, submit-but-not-approve |
| Marcus Oyelaran | Senior Risk Engineer (Casualty) | A second engineer for team views and workload |
| Priya Raghunathan | RE Manager | Triage, assignment, review, return, release, quality reviews, insights, migration |
| Tom Brennan | Service Coordinator | Scheduling, service plans, RE-only instructions, correspondence, impairments |
| Ellen Vasquez | Property Underwriter | Requester view — creates requests, reads released results, denied RE-only content |
| Hannah Ipswich | Fire Impairment Coordinator | Dedicated-team impairment access only |
| Devin Cross | Platform Operations Lead | Integration replay, migration reconciliation, audit and jobs |
| Rosa Delgado | Platform Access Administrator | Role catalog, group bindings, scoped decision simulator — no business content |
| Grant Sollers | Vendor Surveyor (Meridian) | Assignment-bound vendor surface and non-disclosing denial |
| Alicia Moreno | Customer Organization Administrator | Claims Connect REP area plus delegated team administration |
| Nate Kim | Customer Contributor | Responds to targeted questions and recommendations |
| Sofia Lindqvist | Customer Viewer | Read-only customer surface; posting is refused with an explanation |

## Things worth clicking

- **Survey workspace** (Dana → My Work → REQ-1042 → Open survey): nested sections, repeating building
  rows with stable identifiers, deterministic totals, the fire-pump *No vs blank* output rule, unsaved
  and saved indicators, and validation that blocks submission.
- **Review and return** (Priya → Review queue → REQ-1045): side-by-side response and output preview,
  return with a required reason, then approve and release as two separate actions.
- **Carry-forward** (Dana → REQ-1043 → Copy historical work): the 2024 source stays unchanged, lineage
  is recorded, recommendation identity is preserved and approval is reset.
- **Evidence quarantine** (any request → Evidence): a rejected version is blocked from retrieval; a
  replacement is a new version needing a new scan.
- **Correspondence guardrail** (Priya → REQ-1046 → Correspondence): switching an internal package to a
  customer audience is refused.
- **Access denial** (Ellen → any account → RE instructions): an explicit denial explaining the boundary,
  rather than a blank page.
- **Decision simulator** (Rosa → Permission Administration): cross-organization and internal-role
  escalation attempts are rejected with the resolution trace.
- **Migration gate** (Devin → Migrations → MIG-01): blocking exceptions, then a corrected sample manifest
  that simulates a ready gate — cutover approval stays separate.

## Discovery traceability

Every page footer lists the discovery feature it implements and any open decisions carried forward from
[`docs/discovery/decisions-and-gaps.md`](../docs/discovery/decisions-and-gaps.md). Permission names
throughout are the proposed names recorded in the feature documents (F01–F24); they are discovery
vocabulary, not a verbatim Spark catalog.

Source data shapes follow [`docs/discovery/artifacts/*.json`](../docs/discovery/artifacts/); the fixtures
in `src/data/repository.js` expand those shapes into enough synthetic records to navigate between
screens.

## Verification status

Verified on Node 24.21.0 / npm 11.19.0:

- `npm install` — 143 packages, no vulnerabilities reported.
- `npm run lint` — clean, no errors or warnings.
- `npm run build` — succeeds; 49 modules, 21 lazy page chunks, ~100 kB gzipped shared bundle.
- `npm run dev` — server boots and serves the module graph, including every page module, with no
  transform errors.

Not yet done: no browser-driven click-through of each screen, so runtime rendering has not been
exercised end to end.
