import { NAV_GROUPS, PAGES, roleHas } from '../config/repConfig';
import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';

export default function WorkspaceNavigation() {
  const { authenticatedUser, page, leftNavOpen, surveyDirty } = useRep();
  const dispatch = useRepDispatch();
  const navigate = useNavigate();

  const groups = NAV_GROUPS
    .map(group => ({
      ...group,
      pages: group.items
        .map(id => PAGES[id])
        .filter(item => item && roleHas(authenticatedUser.role, item.permission)),
    }))
    .filter(group => group.pages.length > 0);

  function go(pageId) {
    if (surveyDirty && !window.confirm('Unsaved survey answers will be discarded. Continue?')) return;
    navigate(pageId);
  }

  return (
    <aside className={`wb-primary-nav${leftNavOpen ? '' : ' collapsed'}`} aria-label="Risk engineering navigation">
      <button
        className="wb-primary-nav__toggle"
        onClick={() => dispatch({ type: 'TOGGLE_LEFT_NAV' })}
        aria-label={leftNavOpen ? 'Collapse left navigation' : 'Expand left navigation'}
        title={leftNavOpen ? 'Collapse left navigation' : 'Expand left navigation'}
      >
        {leftNavOpen ? '◀' : '▶'}
      </button>

      {leftNavOpen && (
        <>
          {groups.map(group => (
            <div key={group.id}>
              <div className="wb-primary-nav__title">{group.label}</div>
              {group.pages.map(item => (
                <button
                  key={item.id}
                  className={`wb-primary-nav__item${page.id === item.id ? ' active' : ''}`}
                  onClick={() => go(item.id)}
                  title={`${item.id} · ${item.route}`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          ))}
          {groups.length === 0 && (
            <div className="wb-primary-nav__title">No scoped surfaces for this role</div>
          )}
        </>
      )}
    </aside>
  );
}
