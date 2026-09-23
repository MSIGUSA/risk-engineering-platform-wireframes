import { useState } from 'react';
import { useRep, useNavigate } from '../state/repHooks';
import {
  PageHeader, Badge, InfoCard, DefinitionList, EmptyState, SyntheticFooter, Disclosure, Crumb, Metric, Field, PermissionGate,
} from '../components/primitives';
import { ACCOUNTS, CONTACTS, accountName, siteName, userName } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

/* ------------------------------------------------------------------ *
 * P18 — Service Plans
 * ------------------------------------------------------------------ */

export function ServicePlanList() {
  const { servicePlans, authenticatedUser, can } = useRep();
  const navigate = useNavigate();
  const [year, setYear] = useState('');
  const [status, setStatus] = useState('');

  const scoped = servicePlans.filter(plan => authenticatedUser.accountScope.includes(plan.accountId));
  const filtered = scoped.filter(plan => (!year || String(plan.year) === year) && (!status || plan.status === status));

  return (
    <div>
      <PageHeader
        pageId="P18"
        subtitle="Account, year and status list with authorized plan creation. Customer-safe plan content is released separately from internal instructions."
        actions={can(PERMISSIONS.servicePlanManage) && (
          <button className="btn btn--primary" onClick={() => window.alert('Simulation only. Creating a plan requires ServicePlan.Manage plus account scope; the wireframe does not persist new plans.')}>
            New service plan
          </button>
        )}
      />

      <div className="rep-kpi-row">
        <Metric label="Plans in scope" value={scoped.length} />
        <Metric label="Active" value={scoped.filter(plan => plan.status === 'Active').length} tone="complete" />
        <Metric label="Draft" value={scoped.filter(plan => plan.status === 'Draft').length} tone="muted" />
      </div>

      <div className="rep-toolbar">
        <div className="form-field">
          <label className="form-label" htmlFor="plan-year">Year</label>
          <select id="plan-year" className="form-select" value={year} onChange={event => setYear(event.target.value)}>
            <option value="">Any</option>
            {[...new Set(scoped.map(plan => plan.year))].map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="plan-status">Status</label>
          <select id="plan-status" className="form-select" value={status} onChange={event => setStatus(event.target.value)}>
            <option value="">Any</option>
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? <EmptyState title="No plans match this filter" /> : (
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Plan</th><th>Account</th><th>Year</th><th>Coordinator</th><th>Objectives</th><th>Actions complete</th><th>Customer release</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(plan => {
                const actions = plan.objectives.flatMap(objective => objective.actions);
                const complete = actions.filter(action => action.status === 'Complete').length;
                return (
                  <tr key={plan.id}>
                    <td><button className="table-link" onClick={() => navigate('P19', { planId: plan.id })}>{plan.id}</button></td>
                    <td>{accountName(plan.accountId)}</td>
                    <td>{plan.year}</td>
                    <td>{userName(plan.coordinatorId)}</td>
                    <td>{plan.objectives.length}</td>
                    <td>{complete} of {actions.length}</td>
                    <td className="rep-muted">{plan.customerReleaseId ?? 'Not released'}</td>
                    <td><Badge status={plan.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <SyntheticFooter sources={['F10 — Service plans', 'P18 /service-plans']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P19 — Service Plan Workspace
 * ------------------------------------------------------------------ */

export function ServicePlanWorkspace({ planId }) {
  const { servicePlans, can } = useRep();
  const navigate = useNavigate();
  const [showCustomerPreview, setShowCustomerPreview] = useState(false);

  const plan = servicePlans.find(item => item.id === planId);
  if (!plan) return <EmptyState title="Plan not found in this scope" />;

  const actions = plan.objectives.flatMap(objective => objective.actions);
  const complete = actions.filter(action => action.status === 'Complete').length;
  const progress = actions.length ? Math.round((complete / actions.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        pageId="P19"
        params={{ planId }}
        title={`${plan.id} — ${accountName(plan.accountId)} ${plan.year}`}
        subtitle="Location objectives, owners, dates and actions linked to real visits and work, with planned against actual completion."
        breadcrumb={<><Crumb pageId="P18">Service plans</Crumb><span>/</span><span>{plan.id}</span></>}
        actions={can(PERMISSIONS.servicePlanRelease) && (
          <button className="btn" onClick={() => setShowCustomerPreview(!showCustomerPreview)}>
            {showCustomerPreview ? 'Hide' : 'Preview'} customer-safe revision
          </button>
        )}
      />

      <div className="rep-kpi-row">
        <Metric label="Objectives" value={plan.objectives.length} />
        <Metric label="Actions complete" value={`${complete} of ${actions.length}`} tone={progress === 100 ? 'complete' : 'review'} detail={`${progress}% progress`} />
        <Metric label="Coordinator" value={userName(plan.coordinatorId)} />
        <Metric label="Status" value={plan.status} tone={plan.status === 'Active' ? 'complete' : 'muted'} />
      </div>

      {plan.objectives.map(objective => (
        <InfoCard key={objective.id} title={`${objective.description}`}>
          <DefinitionList items={[
            { label: 'Objective', value: objective.id },
            { label: 'Location', value: `${siteName(objective.siteId)} (${objective.siteId})` },
            { label: 'Owner', value: userName(objective.ownerId) },
          ]} />
          <div className="rep-table-scroll" style={{ marginTop: 'var(--space-3)' }}>
            <table className="data-table">
              <thead><tr><th>Action</th><th>Description</th><th>Assigned to</th><th>Target date</th><th>Actual date</th><th>Linked work</th><th>Status</th></tr></thead>
              <tbody>
                {objective.actions.map(action => (
                  <tr key={action.id}>
                    <td><code className="rep-code">{action.id}</code></td>
                    <td>{action.description}</td>
                    <td>{userName(action.assignedTo)}</td>
                    <td>{action.targetDate}</td>
                    <td>{action.actualDate ?? <span className="rep-muted">Not complete</span>}</td>
                    <td>
                      {action.requestId
                        ? <button className="table-link" onClick={() => navigate('P06', { requestId: action.requestId })}>{action.requestId}</button>
                        : <span className="rep-muted">No linked request</span>}
                      {action.visitId && <span className="rep-muted"> · {action.visitId}</span>}
                    </td>
                    <td><Badge status={action.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>
      ))}

      <div className="rep-grid rep-grid--two">
        <InfoCard title="Plan revisions">
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Revision</th><th>Date</th><th>By</th><th>Note</th><th>Customer safe</th></tr></thead>
              <tbody>
                {plan.revisions.map(revision => (
                  <tr key={revision.revision}>
                    <td>{revision.revision}</td><td>{revision.at}</td>
                    <td>{userName(revision.by)}</td><td className="rep-muted">{revision.note}</td>
                    <td>{revision.customerSafe ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>
        <InfoCard title="Contact directory and distribution">
          <ul className="rep-plain-list">
            {plan.contactDirectory.map(contactId => {
              const contact = CONTACTS.find(item => item.id === contactId);
              return <li key={contactId}>{contact?.name} <span className="rep-muted">· {contact?.role} · {contact?.email}</span></li>;
            })}
          </ul>
          <DefinitionList items={[
            { label: 'Distribution profile', value: plan.distributionProfileId },
            { label: 'Customer release', value: plan.customerReleaseId ?? 'Not released' },
          ]} />
        </InfoCard>
      </div>

      {showCustomerPreview && (
        <InfoCard title="Customer-safe revision preview">
          <div className="rep-preview">
            <h4>{accountName(plan.accountId)} — {plan.year} service plan</h4>
            {plan.objectives.map(objective => (
              <div key={objective.id} style={{ marginBottom: 12 }}>
                <p><strong>{siteName(objective.siteId)}:</strong> {objective.description}</p>
                <ul className="rep-bullet-list">
                  {objective.actions.map(action => (
                    <li key={action.id}>{action.description} — target {action.targetDate}{action.actualDate ? `, completed ${action.actualDate}` : ''}</li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="rep-preview__rule">
              Internal service instructions and sensitivities are excluded from this projection. Plan visibility and
              instruction visibility are separate authorization surfaces.
            </p>
          </div>
        </InfoCard>
      )}

      <Disclosure label="Plan safeguards (F10)">
        <ul className="rep-bullet-list">
          <li>Objectives and actions can each be traced to a location and an owner.</li>
          <li>Progress reflects completed actions, not intent.</li>
          <li>Published customer plans omit internal instruction content entirely.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F10 — Service plans', 'P19 /service-plans/:planId']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P20 — RE Instructions
 * ------------------------------------------------------------------ */

export function ReInstructions({ accountId }) {
  const { instructions, can, authenticatedUser } = useRep();
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState('');

  const account = ACCOUNTS.find(item => item.id === accountId);
  const items = instructions.filter(item => item.accountId === accountId);
  const selected = items.find(item => item.id === selectedId) ?? items[0] ?? null;

  return (
    <div>
      <PageHeader
        pageId="P20"
        params={{ accountId }}
        title={`RE instructions — ${account?.name ?? accountId}`}
        subtitle="Separate RE-only editor and history with optional site context, sensitive notes and controlled amendments."
        breadcrumb={<><Crumb pageId="P03" params={{ accountId }}>{account?.name}</Crumb><span>/</span><span>instructions</span></>}
      />

      <PermissionGate
        permission={PERMISSIONS.serviceInstructionRead}
        explanation="Service instructions carry an RE-only classification. Underwriting, marketing, vendor and customer audiences are excluded by default, and an internal employee role alone is not sufficient."
      >
        <div className="rep-consumer-banner">
          <div>
            <strong>RE-only content</strong>
            Stored and served separately from survey answers and releases. It never appears in a customer projection or a
            released snapshot.
          </div>
        </div>

        {items.length === 0 ? <EmptyState title="No instructions recorded for this account" /> : (
          <div className="rep-split">
            <div>
              <InfoCard title="Instructions">
                <div className="rep-table-scroll">
                  <table className="data-table">
                    <thead><tr><th>Instruction</th><th>Scope</th><th>Revision</th><th>Updated</th><th>Coordinator</th><th /></tr></thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id} className={item.id === selected?.id ? 'data-table__row--active' : ''}>
                          <td>{item.id}</td>
                          <td>{item.siteId ? siteName(item.siteId) : 'Account level'}</td>
                          <td>{item.revision}</td>
                          <td>{item.updatedAt}</td>
                          <td>{userName(item.coordinatorId)}</td>
                          <td><button className="btn" onClick={() => { setSelectedId(item.id); setDraft(item.text); }}>Open</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </InfoCard>

              {selected && (
                <InfoCard title={`${selected.id} — revision ${selected.revision}`}>
                  <div className="form-grid">
                    <Field
                      label="Instruction text"
                      span={2}
                      type="textarea"
                      value={draft || selected.text}
                      onChange={setDraft}
                      readOnly={!can(PERMISSIONS.serviceInstructionManage)}
                      hint={can(PERMISSIONS.serviceInstructionManage)
                        ? 'An amendment creates a new revision with an attributed author and reason.'
                        : 'Read access does not include management. Amendment requires ServiceInstruction.Manage.'}
                    />
                  </div>
                  {can(PERMISSIONS.serviceInstructionManage) && (
                    <button className="btn btn--primary" onClick={() => window.alert('Simulation only. A controlled amendment would create revision ' + (selected.revision + 1) + ' with the actor and reason recorded.')}>
                      Record amendment
                    </button>
                  )}
                </InfoCard>
              )}
            </div>

            {selected && (
              <div>
                <InfoCard title="Classification and audience">
                  <DefinitionList items={[
                    { label: 'Classification', value: selected.classification },
                    { label: 'Allowed roles', value: selected.allowedRoles.join(', ') },
                    { label: 'Excluded audiences', value: selected.excludedAudiences.join(', ') },
                    { label: 'Current viewer role', value: authenticatedUser.role },
                    { label: 'Customer projection', value: 'None — instruction text is never projected' },
                  ]} />
                </InfoCard>
                <InfoCard title="Revision metadata">
                  <ul className="rep-timeline">
                    {selected.revisions.map(revision => (
                      <li key={revision.revision} className="rep-timeline__item">
                        <div className="rep-timeline__meta">{revision.at} · {userName(revision.by)}</div>
                        Revision {revision.revision} — {revision.reason}
                      </li>
                    ))}
                  </ul>
                </InfoCard>
              </div>
            )}
          </div>
        )}

        <Disclosure label="Instruction safeguards (F11)">
          <ul className="rep-bullet-list">
            <li>Underwriter, customer and vendor personas receive an explicit denial explanation rather than an empty page.</li>
            <li>Authorized RE staff can view revision metadata as well as the current text.</li>
            <li>A release projection contains no instruction text at all.</li>
          </ul>
        </Disclosure>
      </PermissionGate>

      <SyntheticFooter sources={['F11 — Service instructions and notes', 'P20 /accounts/:accountId/instructions']} />
    </div>
  );
}
