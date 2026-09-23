import { useState } from 'react';
import { useRep, useRepDispatch } from '../state/repHooks';
import {
  PageHeader, Badge, InfoCard, DefinitionList, EmptyState, SyntheticFooter, Disclosure, Field, Metric,
} from '../components/primitives';
import {
  ORGANIZATIONS, ROLE_CATALOG, ALLOWED_DELEGATED_ROLES, GROUP_ROLE_BINDINGS, userName, USERS,
} from '../data/repository';
import { PERMISSIONS, ROLE_PERMISSIONS, PAGES } from '../config/repConfig';

/* ------------------------------------------------------------------ *
 * P28 — Organization Team Access
 * ------------------------------------------------------------------ */

export function OrganizationTeamAccess({ organizationId }) {
  const { memberships, invitations, authenticatedUser, can } = useRep();
  const dispatch = useRepDispatch();
  const [orgId, setOrgId] = useState(organizationId ?? 'ORG-HARBOR');
  const [recipient, setRecipient] = useState('');
  const [proposedRole, setProposedRole] = useState('CustomerContributor');
  const [scope, setScope] = useState('SITE-01');

  const organization = ORGANIZATIONS.find(item => item.id === orgId);
  const orgMemberships = memberships.filter(item => item.organizationId === orgId);
  const orgInvitations = invitations.filter(item => item.organizationId === orgId);

  const delegable = ALLOWED_DELEGATED_ROLES[authenticatedUser.role] ?? [];
  const owners = orgMemberships.filter(item => item.roles.includes('CustomerOrganizationOwner') && item.status === 'Active');

  function invite() {
    if (!delegable.includes(proposedRole)) return;
    dispatch({ type: 'INVITE_MEMBER', payload: { organizationId: orgId, recipient, proposedRoles: [proposedRole], scope } });
    setRecipient('');
  }

  function removeAccess(membership) {
    const isLastOwner = membership.roles.includes('CustomerOrganizationOwner') && owners.length <= 1;
    if (isLastOwner) {
      dispatch({ type: 'PUSH_NOTICE', payload: { text: 'Denied: the last organization owner cannot be removed. Transfer ownership first.', tone: 'error' } });
      return;
    }
    dispatch({ type: 'REMOVE_REP_ACCESS', payload: { membershipId: membership.id } });
  }

  return (
    <div>
      <PageHeader
        pageId="P28"
        params={{ organizationId: orgId }}
        title={`Team access — ${organization?.name ?? orgId}`}
        subtitle="Membership context, invitations, allowed scoped roles, REP access removal and ownership transfer. This is the internal administration route; a customer administrator uses the separately owned Claims Connect experience."
      />

      <div className="rep-toolbar">
        <div className="form-field">
          <label className="form-label" htmlFor="org-select">Organization</label>
          <select id="org-select" className="form-select" value={orgId} onChange={event => setOrgId(event.target.value)}>
            {ORGANIZATIONS.filter(item => item.kind !== 'Workforce').map(item => (
              <option key={item.id} value={item.id}>{item.name} — {item.kind}</option>
            ))}
          </select>
        </div>
        <Metric label="Active members" value={orgMemberships.filter(item => item.status === 'Active').length} />
        <Metric label="Pending invitations" value={orgInvitations.filter(item => item.status === 'Pending').length} tone="review" />
      </div>

      <InfoCard title="Membership">
        {orgMemberships.length === 0 ? <EmptyState title="No REP memberships in this organization" /> : (
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Member</th><th>REP roles</th><th>Scope</th><th>Source of authority</th><th>Authorization version</th><th>Status</th><th /></tr></thead>
              <tbody>
                {orgMemberships.map(membership => (
                  <tr key={membership.id}>
                    <td>{userName(membership.principalId)}</td>
                    <td>{membership.roles.length ? membership.roles.join(', ') : <span className="rep-muted">None</span>}</td>
                    <td className="rep-muted">{membership.scope}</td>
                    <td className="rep-muted">{membership.source}</td>
                    <td>{membership.authorizationVersion}</td>
                    <td><Badge status={membership.status === 'Active' ? 'Active' : 'Blocked'} label={membership.status} /></td>
                    <td>
                      {can(PERMISSIONS.repTeamRemoveAccess) && membership.status === 'Active' && (
                        <button className="btn" onClick={() => removeAccess(membership)}>Remove REP access</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
          Removing REP access removes REP entitlements only. It must not disable the customer global portal identity or the
          membership used by unrelated services.
        </p>
      </InfoCard>

      <div className="rep-grid rep-grid--two">
        <InfoCard title="Invite a member">
          {can(PERMISSIONS.repTeamInvite) ? (
            <>
              <div className="form-grid">
                <Field label="Recipient" span={2} value={recipient} onChange={setRecipient} hint="The invitation is single-use and cannot grant rights the inviter no longer has authority to delegate." />
                <Field
                  label="Proposed role"
                  value={proposedRole}
                  onChange={setProposedRole}
                  options={ROLE_CATALOG.map(role => ({ value: role.id, label: `${role.id} (${role.audience})` }))}
                />
                <Field label="Scope" value={scope} onChange={setScope} hint="A grant restricts record access; it does not invent a permission that no role provides." />
              </div>
              {!delegable.includes(proposedRole) && (
                <div className="validation-banner" role="alert">
                  Denied: {proposedRole} is not delegable by {authenticatedUser.title}. Allowed delegated roles are{' '}
                  {delegable.join(', ') || 'none'}. Customers cannot assign internal roles or expand their own entitlements.
                </div>
              )}
              <button className="btn btn--primary" disabled={!recipient.trim() || !delegable.includes(proposedRole)} onClick={invite}>
                Create illustrative invitation
              </button>
            </>
          ) : <p className="rep-muted">Inviting requires <code>REPTeam.Invite</code>.</p>}
        </InfoCard>

        <InfoCard title="Pending invitations">
          {orgInvitations.length === 0 ? <EmptyState title="No invitations" /> : (
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Invitation</th><th>Recipient</th><th>Proposed roles</th><th>Scope</th><th>Invited by</th><th>Expires</th><th>Status</th></tr></thead>
                <tbody>
                  {orgInvitations.map(invitation => (
                    <tr key={invitation.id}>
                      <td><code className="rep-code">{invitation.id}</code></td>
                      <td>{invitation.recipient}</td>
                      <td>{invitation.proposedRoles.join(', ')}</td>
                      <td>{invitation.scope}</td>
                      <td>{userName(invitation.invitedById)}</td>
                      <td>{invitation.expiresAt}</td>
                      <td><Badge status="Pending" label={invitation.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </InfoCard>
      </div>

      <InfoCard title="Ownership">
        <DefinitionList items={[
          { label: 'Current owners', value: owners.length ? owners.map(item => userName(item.principalId)).join(', ') : 'None' },
          { label: 'Transfer rule', value: 'Ownership is a protected role assignment with explicit transfer rules, not an email field on an organization.' },
          { label: 'Owner reading rights', value: 'An owner is not automatically a reader of every record.' },
        ]} />
        {can(PERMISSIONS.repTeamAssignAllowedRole) && (
          <button className="btn" onClick={() => window.alert('Simulation only. A transfer requires an explicit target owner, an atomic transaction and an audit record. The last owner cannot simply be removed.')}>
            Transfer ownership
          </button>
        )}
      </InfoCard>

      <Disclosure label="Delegated administration boundaries (F13)">
        <ul className="rep-bullet-list">
          <li>Cross-organization and internal-role escalation attempts are rejected, not hidden.</li>
          <li>Last-owner removal is denied until ownership is transferred.</li>
          <li>REP role assignment and status are separate from global directory or portal membership status.</li>
          <li>Role switching in this wireframe is a synthetic test harness, not a security mechanism.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F13 — Access, roles and team administration', 'P28 /administration/organizations/:organizationId/team']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P29 — Permission Administration
 * ------------------------------------------------------------------ */

export function PermissionAdministration() {
  const { authenticatedUser } = useRep();
  const dispatch = useRepDispatch();
  const [principalId, setPrincipalId] = useState('u-alicia');
  const [targetOrganizationId, setTargetOrganizationId] = useState('ORG-HARBOR');
  const [permission, setPermission] = useState(PERMISSIONS.repTeamInvite);
  const [requestedRole, setRequestedRole] = useState('CustomerContributor');
  const [decision, setDecision] = useState(null);

  const principal = USERS.find(user => user.id === principalId);

  /* Illustrative decision trace following the resolution sequence in the blueprint. */
  function evaluate() {
    const steps = [];
    steps.push({ step: 'Validate token, trusted client and delegation context', outcome: 'Simulated pass' });
    steps.push({ step: 'Resolve external identity to an enabled principal', outcome: `${principal.name} (${principal.principalId})` });
    steps.push({ step: 'Read authoritative status and version stamps', outcome: 'Active membership; authorization version read' });

    const sameOrg = principal.organizationId === targetOrganizationId;
    steps.push({ step: 'Validate requested organization context', outcome: sameOrg ? 'In context' : 'Cross-organization request' });

    const holdsPermission = (ROLE_PERMISSIONS[principal.role] ?? []).includes(permission);
    steps.push({ step: 'Produce scoped role and permission bindings', outcome: holdsPermission ? `Holds ${permission}` : `Does not hold ${permission}` });

    const delegable = ALLOWED_DELEGATED_ROLES[principal.role] ?? [];
    const roleAllowed = delegable.includes(requestedRole);
    const roleDefinition = ROLE_CATALOG.find(role => role.id === requestedRole);
    steps.push({
      step: 'Check audience and delegability of the requested role',
      outcome: roleAllowed ? `${requestedRole} is delegable by this actor` : `${requestedRole} is ${roleDefinition?.audience ?? 'unknown'} audience and not delegable by this actor`,
    });

    let result = 'Allowed';
    let reason = 'All checks passed in this illustrative evaluation.';
    if (!sameOrg) {
      result = 'Not found';
      reason = 'Out-of-scope organization. A non-disclosing not-found result is returned rather than confirming another customer record exists.';
    } else if (!holdsPermission) {
      result = 'Forbidden';
      reason = 'The principal does not hold the requested permission within this scope.';
    } else if (!roleAllowed) {
      result = 'Forbidden';
      reason = 'Escalation refused: a customer administrator cannot assign an internal role or expand entitlements.';
    }

    steps.push({ step: 'Return decision', outcome: result });
    setDecision({ result, reason, steps });
    dispatch({ type: 'PUSH_NOTICE', payload: { text: `Simulated decision recorded: ${result}.`, tone: result === 'Allowed' ? 'success' : 'warning' } });
  }

  return (
    <div>
      <PageHeader
        pageId="P29"
        subtitle="Authorized role, permission and group-binding views with approved changes. Customers never edit the global catalog."
      />

      <div className="rep-grid rep-grid--two">
        <InfoCard title="Role catalog">
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Role</th><th>Audience</th><th>Delegable</th><th>Description</th></tr></thead>
              <tbody>
                {ROLE_CATALOG.map(role => (
                  <tr key={role.id}>
                    <td>{role.id}</td><td>{role.audience}</td>
                    <td>{role.delegable ? 'Yes' : 'No'}</td>
                    <td className="rep-muted">{role.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>

        <InfoCard title="Employee group bindings">
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Binding</th><th>Group</th><th>Role</th><th>Environment</th><th>Active</th></tr></thead>
              <tbody>
                {GROUP_ROLE_BINDINGS.map(binding => (
                  <tr key={binding.id}>
                    <td><code className="rep-code">{binding.id}</code></td>
                    <td>{binding.groupId}</td><td>{binding.roleId}</td>
                    <td>{binding.environment}</td>
                    <td><Badge status={binding.active ? 'Active' : 'Blocked'} label={binding.active ? 'Active' : 'Inactive'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
            Group mappings apply to employees only, and both the environment and the source authority are checked.
          </p>
        </InfoCard>
      </div>

      <InfoCard title="Scoped decision simulator">
        <p className="rep-muted rep-section-intro">
          Illustrative only. It shows the shape of the resolution sequence; it does not call an engine and it grants nothing.
        </p>
        <div className="form-grid">
          <Field label="Principal" value={principalId} onChange={setPrincipalId} options={USERS.map(user => ({ value: user.id, label: `${user.name} — ${user.title}` }))} />
          <Field label="Target organization" value={targetOrganizationId} onChange={setTargetOrganizationId} options={ORGANIZATIONS.map(org => ({ value: org.id, label: org.name }))} />
          <Field label="Permission" value={permission} onChange={setPermission} options={Object.values(PERMISSIONS).slice(0, 40)} />
          <Field label="Requested role" value={requestedRole} onChange={setRequestedRole} options={ROLE_CATALOG.map(role => role.id)} />
        </div>
        <button className="btn btn--primary" onClick={evaluate}>Evaluate</button>

        {decision && (
          <>
            <div className={decision.result === 'Allowed' ? 'rep-consumer-banner' : 'validation-banner'} style={{ marginTop: 'var(--space-4)' }}>
              <div><strong>{decision.result}</strong>{decision.reason}</div>
            </div>
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>#</th><th>Resolution step</th><th>Outcome</th></tr></thead>
                <tbody>
                  {decision.steps.map((step, index) => (
                    <tr key={index}><td>{index + 1}</td><td>{step.step}</td><td className="rep-muted">{step.outcome}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </InfoCard>

      <InfoCard title="Surfaces available to the signed-in role">
        <p className="rep-muted rep-section-intro">
          Menu visibility follows resolved permissions, but hiding a menu item is never the access control. The engine
          re-checks every operation.
        </p>
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Page</th><th>Route</th><th>Required permission</th><th>Available to {authenticatedUser.title}</th></tr></thead>
            <tbody>
              {Object.values(PAGES).map(page => {
                const held = (ROLE_PERMISSIONS[authenticatedUser.role] ?? []).includes(page.permission);
                return (
                  <tr key={page.id}>
                    <td>{page.id} — {page.name}</td>
                    <td><code className="rep-code">{page.route}</code></td>
                    <td><code className="rep-code">{page.permission}</code></td>
                    <td><Badge status={held ? 'Complete' : 'Blocked'} label={held ? 'Yes' : 'No'} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </InfoCard>

      <SyntheticFooter sources={['F13 — Access, roles and team administration', 'P29 /administration/access']} />
    </div>
  );
}
