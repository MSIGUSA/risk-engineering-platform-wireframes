import { REP_BRANDING, ROLES, PAGES } from '../config/repConfig';
import { USERS, ORGANIZATIONS } from '../data/repository';
import { useRep, useRepDispatch } from '../state/repHooks';

const ROLE_ORDER = [
  'engineer', 'manager', 'coordinator', 'underwriter',
  'impairment_team', 'operations', 'access_admin',
  'vendor', 'customer_admin', 'customer_contributor', 'customer_viewer',
];

export default function TopNavigator() {
  const { authenticatedUser, page, organizationContextId, surveyDirty, history } = useRep();
  const dispatch = useRepDispatch();
  const organization = ORGANIZATIONS.find(item => item.id === organizationContextId);
  const activePage = PAGES[page.id];

  const orderedUsers = [...USERS].sort(
    (left, right) => ROLE_ORDER.indexOf(left.role) - ROLE_ORDER.indexOf(right.role) || left.name.localeCompare(right.name),
  );

  function confirmDiscard() {
    if (!surveyDirty) return true;
    return window.confirm('Unsaved survey answers will be discarded. Continue?');
  }

  function switchUser(userId) {
    if (!confirmDiscard()) return;
    dispatch({ type: 'SET_USER', payload: userId });
  }

  function resetDemo() {
    if (window.confirm('Reset all wireframe requests, surveys, recommendations, releases, access records and operational fixtures?')) {
      dispatch({ type: 'RESET_DEMO' });
    }
  }

  return (
    <nav className="wb-nav" aria-label="Platform navigation">
      <div className="wb-brand" aria-label={`${REP_BRANDING.carrierName} ${REP_BRANDING.productName}`}>
        <div className="wb-brand__mark">
          <img className="wb-brand__logo" src={REP_BRANDING.logoSrc} alt={REP_BRANDING.logoAlt} />
        </div>
        <div className="wb-brand__text">
          <span className="wb-brand__eyebrow">{REP_BRANDING.carrierName}</span>
          <span className="wb-brand__title">{REP_BRANDING.productName}</span>
        </div>
      </div>

      <span className="wb-claim-chip" aria-label="Active organization context">
        {organization ? `${organization.name} · ${organization.kind}` : 'No organization context'}
      </span>

      <span className="wb-profile-chip" title="Current page identifier from the detailed design page inventory">
        {activePage ? `${activePage.id} · ${activePage.name}` : 'Page'}
      </span>

      {surveyDirty && <span className="wf-inline-warning">⚠ Unsaved survey answers</span>}

      <div className="wf-controls">
        {history.length > 0 && (
          <button className="btn" onClick={() => dispatch({ type: 'BACK' })}>
            Back
          </button>
        )}
        <select
          className="lob-select"
          value={authenticatedUser.id}
          onChange={event => switchUser(event.target.value)}
          aria-label="Simulated signed-in user"
        >
          {orderedUsers.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} — {ROLES[user.role]?.label ?? user.role}
            </option>
          ))}
        </select>
        <button className="btn" onClick={resetDemo} title="Restore the initial wireframe fixtures">
          Reset Demo Data
        </button>
      </div>
    </nav>
  );
}
