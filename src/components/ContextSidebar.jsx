import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';
import { ACCOUNTS, SITES, ENTITIES, POLICIES, CONTACTS, userName, badgeFor } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

const TABS = [
  { id: 'account', label: 'Account' },
  { id: 'sites', label: 'Sites & policies' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'documents', label: 'Evidence' },
  { id: 'notes', label: 'RE notes' },
];

/** Resolves the account/site/request context implied by the active page params. */
function useContextRecord() {
  const { page, requests } = useRep();
  const params = page.params ?? {};
  let accountId = params.accountId ?? null;
  let siteId = params.siteId ?? null;
  let request = null;

  if (params.requestId) {
    request = requests.find(item => item.id === params.requestId) ?? null;
    accountId = accountId ?? request?.accountId ?? null;
    siteId = siteId ?? request?.siteIds?.[0] ?? null;
  }
  return { accountId, siteId, request };
}

export default function ContextSidebar() {
  const state = useRep();
  const { sidebarOpen, sidebarTab, evidence, instructions, can } = state;
  const dispatch = useRepDispatch();
  const navigate = useNavigate();
  const { accountId, siteId, request } = useContextRecord();

  if (!accountId) return null;

  const account = ACCOUNTS.find(item => item.id === accountId);
  const accountSites = SITES.filter(item => item.accountId === accountId);
  const accountPolicies = POLICIES.filter(item => item.accountId === accountId);
  const accountContacts = CONTACTS.filter(item => item.accountId === accountId);
  const contextEvidence = request ? evidence.filter(item => item.requestId === request.id) : [];
  const accountInstructions = instructions.filter(item => item.accountId === accountId);

  return (
    <div className="wb-context-shell">
      <button
        className="wb-sidebar-toggle"
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        aria-label={sidebarOpen ? 'Collapse context sidebar' : 'Expand context sidebar'}
        title={sidebarOpen ? 'Collapse context sidebar' : 'Expand context sidebar'}
      >
        {sidebarOpen ? '▶' : '◀'}
      </button>

      <aside className={`wb-sidebar${sidebarOpen ? '' : ' collapsed'}`} aria-label="Account context">
        {sidebarOpen && (
          <>
            <div className="wb-sidebar__tabs" role="tablist">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={sidebarTab === tab.id}
                  className={`wb-sidebar__tab${sidebarTab === tab.id ? ' active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_SIDEBAR_TAB', payload: tab.id })}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="wb-sidebar__body">
              {sidebarTab === 'account' && (
                <>
                  <div className="wb-sidebar__panel-header">
                    <span className="wb-sidebar__panel-title">{account?.name}</span>
                    <span className={`badge badge--${badgeFor(account?.coverageStatus === 'Active' ? 'Active' : 'Blocked')}`}>
                      {account?.coverageStatus}
                    </span>
                  </div>
                  <dl className="rep-definition-list rep-definition-list--compact">
                    <div><dt>Account</dt><dd>{account?.id}</dd></div>
                    <div><dt>Source</dt><dd>{account?.sourceSystem} · {account?.externalId}</dd></div>
                    <div><dt>Refreshed</dt><dd>{account?.lastRefreshedAt?.slice(0, 10) ?? '—'}</dd></div>
                    <div><dt>Producer</dt><dd>{account?.producer}</dd></div>
                    <div><dt>Service tier</dt><dd>{account?.serviceTier}</dd></div>
                    <div><dt>Open recommendations</dt><dd>{account?.openRecommendations}</dd></div>
                  </dl>
                  {request && (
                    <>
                      <div className="wb-sidebar__panel-header"><span className="wb-sidebar__panel-title">Active request</span></div>
                      <dl className="rep-definition-list rep-definition-list--compact">
                        <div><dt>Request</dt><dd>{request.id}</dd></div>
                        <div><dt>State</dt><dd><span className={`badge badge--${badgeFor(request.state)}`}>{request.state}</span></dd></div>
                        <div><dt>Requested</dt><dd>{request.requestedDate}</dd></div>
                        <div><dt>Committed</dt><dd>{request.committedDate ?? 'Not committed'}</dd></div>
                        <div><dt>Assignee</dt><dd>{request.assigneeId ? userName(request.assigneeId) : 'Unassigned'}</dd></div>
                        <div><dt>Row version</dt><dd><code className="rep-code">{request.rowVersion}</code></dd></div>
                      </dl>
                    </>
                  )}
                  <p className="rep-muted rep-sidebar-note">
                    Reference context is a projection of the source systems. It is not an authoritative account, producer,
                    claims or policy master.
                  </p>
                </>
              )}

              {sidebarTab === 'sites' && (
                <>
                  {ENTITIES.filter(entity => entity.accountId === accountId).map(entity => (
                    <div key={entity.id} className="entity-card">
                      <div className="entity-card__name">{entity.name}</div>
                      <div className="entity-card__role">{entity.relationship} · {entity.id}</div>
                      <ul className="rep-plain-list">
                        {accountSites.filter(site => site.entityId === entity.id).map(site => (
                          <li key={site.id}>
                            <button
                              className={`table-link${site.id === siteId ? ' rep-link--active' : ''}`}
                              onClick={() => navigate('P04', { accountId, siteId: site.id })}
                            >
                              {site.name}
                            </button>
                            <span className="rep-muted"> · {site.id}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="wb-sidebar__panel-header"><span className="wb-sidebar__panel-title">Policies</span></div>
                  {accountPolicies.map(policy => (
                    <div key={policy.id} className="note-item">
                      <div className="note-item__meta">{policy.line} · {policy.source}</div>
                      <div>{policy.id} — {policy.effective} to {policy.expiration}</div>
                    </div>
                  ))}
                </>
              )}

              {sidebarTab === 'contacts' && (
                <>
                  {accountContacts.map(contact => (
                    <div key={contact.id} className="entity-card">
                      <div className="entity-card__name">{contact.name}</div>
                      <div className="entity-card__role">
                        {contact.role}{contact.siteId ? ` · ${contact.siteId}` : ' · Account level'}
                      </div>
                      <div className="rep-muted">{contact.email} · {contact.phone}</div>
                      <div className="rep-muted">
                        {contact.isApplicationUser ? 'Known application user' : 'Not an application user'}
                      </div>
                    </div>
                  ))}
                  <p className="rep-muted rep-sidebar-note">
                    Being a known application user does not make a contact an internal recipient. Recipient audience is
                    checked in the engine.
                  </p>
                </>
              )}

              {sidebarTab === 'documents' && (
                <>
                  {contextEvidence.length === 0 && <div className="wb-sidebar__empty">No evidence in this request context.</div>}
                  {contextEvidence.map(item => (
                    <div key={item.id} className="docs-ledger__item">
                      <div className="entity-card__name">{item.fileName}</div>
                      <div className="docs-ledger__meta">
                        {item.context} · v{item.versions[0].version} ·{' '}
                        <span className={`badge badge--${badgeFor(item.versions[0].scanStatus)}`}>{item.versions[0].scanStatus}</span>
                      </div>
                      <div className="rep-muted">Classification {item.classification} · audience {item.audience}</div>
                    </div>
                  ))}
                  {request && (
                    <button className="btn" onClick={() => navigate('P12', { requestId: request.id })}>
                      Open evidence page
                    </button>
                  )}
                </>
              )}

              {sidebarTab === 'notes' && (
                can(PERMISSIONS.serviceInstructionRead) ? (
                  <>
                    {accountInstructions.map(instruction => (
                      <div key={instruction.id} className="note-item">
                        <div className="note-item__meta">
                          {instruction.classification} · revision {instruction.revision} · {instruction.updatedAt}
                        </div>
                        <div>{instruction.text}</div>
                      </div>
                    ))}
                    <button className="btn" onClick={() => navigate('P20', { accountId })}>
                      Open RE instructions
                    </button>
                  </>
                ) : (
                  <div className="rep-denial rep-denial--compact">
                    <div className="rep-denial__title">RE-only content</div>
                    <p>
                      Service instructions are a separate authorization surface. An internal employee role alone is not
                      sufficient, and underwriting, marketing, vendor and customer audiences are excluded.
                    </p>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
