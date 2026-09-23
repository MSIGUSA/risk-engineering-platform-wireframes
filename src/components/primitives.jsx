import { useState } from 'react';
import { PAGES, buildRoute } from '../config/repConfig';
import { badgeFor } from '../data/repository';
import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';

/** Page header with the design-reference page id, route and API groups. */
export function PageHeader({ pageId, params = {}, title, subtitle, actions, breadcrumb }) {
  const page = PAGES[pageId];
  return (
    <div className="page-header page-header--actions">
      <div>
        {breadcrumb && <nav className="rep-breadcrumb">{breadcrumb}</nav>}
        <h1 className="page-title">{title ?? page?.name}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        <div className="rep-page-meta">
          <span className="rep-page-meta__id">{page?.id}</span>
          <code className="rep-page-meta__route">{buildRoute(page, params)}</code>
          {page?.apiGroups && <span className="rep-page-meta__api">API {page.apiGroups}</span>}
          {page?.phase && <span className="badge badge--review">{page.phase}</span>}
          {page?.consumer && <span className="badge badge--new">Consumer surface: {page.consumer}</span>}
        </div>
      </div>
      {actions && <div className="rep-header-actions">{actions}</div>}
    </div>
  );
}

export function Crumb({ pageId, params, children }) {
  const navigate = useNavigate();
  return (
    <button className="table-link rep-breadcrumb__link" onClick={() => navigate(pageId, params)}>
      {children}
    </button>
  );
}

export function Badge({ status, label }) {
  if (!status) return null;
  return <span className={`badge badge--${badgeFor(status)}`}>{label ?? status}</span>;
}

export function InfoCard({ title, children, actions, tone }) {
  return (
    <div className={`info-card${tone ? ` info-card--${tone}` : ''}`}>
      {(title || actions) && (
        <div className="rep-card-head">
          {title && <div className="info-card__title">{title}</div>}
          {actions && <div className="rep-card-head__actions">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function FormSection({ title, description, children, actions }) {
  return (
    <div className="form-section">
      {(title || actions) && (
        <div className="rep-card-head">
          {title && <div className="form-section__title">{title}</div>}
          {actions && <div className="rep-card-head__actions">{actions}</div>}
        </div>
      )}
      {description && <p className="rep-muted rep-section-intro">{description}</p>}
      {children}
    </div>
  );
}

export function DefinitionList({ items }) {
  return (
    <dl className="rep-definition-list">
      {items.filter(Boolean).map(item => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Metric({ label, value, detail, tone }) {
  return (
    <div className={`rep-metric${tone ? ` rep-metric--${tone}` : ''}`}>
      <span className="rep-metric__label">{label}</span>
      <span className="rep-metric__value">{value}</span>
      {detail && <span className="rep-metric__detail">{detail}</span>}
    </div>
  );
}

export function Tabs({ tabs, active, onChange, ariaLabel = 'Workspace tabs' }) {
  return (
    <div className="tab-control">
      <div className="tab-list" role="tablist" aria-label={ariaLabel}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            className={`tab-button${active === tab.id ? ' active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            {tab.count != null && <span className="rep-tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Deny-by-default surface. The wireframe explains the boundary rather than hiding it silently. */
export function PermissionGate({ permission, children, explanation }) {
  const { can, authenticatedUser } = useRep();
  if (can(permission)) return children;
  return (
    <div className="rep-denial" role="note">
      <div className="rep-denial__title">Not available for this role</div>
      <p>
        {explanation ?? 'This content is a separate authorization surface.'} The signed-in demonstration user is{' '}
        <strong>{authenticatedUser.name}</strong> ({authenticatedUser.title}), whose role does not hold{' '}
        <code>{permission}</code>.
      </p>
      <p className="rep-muted">
        Access denied is distinct from no records. In the engine this decision is made server-side; hiding a menu item is
        never the security control.
      </p>
    </div>
  );
}

export function EmptyState({ title, detail }) {
  return (
    <div className="rep-empty">
      <div className="rep-empty__title">{title}</div>
      {detail && <p className="rep-muted">{detail}</p>}
    </div>
  );
}

export function SaveIndicator({ saveState }) {
  const map = {
    Saved: { label: 'All changes saved', tone: 'complete' },
    Unsaved: { label: 'Unsaved changes', tone: 'blocked' },
    Submitted: { label: 'Submitted — revision immutable', tone: 'review' },
    Released: { label: 'Released snapshot', tone: 'complete' },
    Locked: { label: 'Locked', tone: 'complete' },
    NotStarted: { label: 'Not started', tone: 'not-started' },
    Draft: { label: 'Draft', tone: 'not-started' },
  };
  const entry = map[saveState] ?? map.Draft;
  return <span className={`rep-save-indicator rep-save-indicator--${entry.tone}`}>{entry.label}</span>;
}

export function NoticeStack() {
  const { notices } = useRep();
  const dispatch = useRepDispatch();
  if (!notices.length) return null;
  return (
    <div className="rep-notices" role="status">
      {notices.map(item => (
        <div key={item.id} className={`rep-notice rep-notice--${item.tone}`}>
          <span>{item.text}</span>
          <button className="rep-notice__close" aria-label="Dismiss" onClick={() => dispatch({ type: 'DISMISS_NOTICE', payload: item.id })}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function SearchField({ id, label, value, onChange, placeholder }) {
  return (
    <div className="form-field rep-search-field">
      <label className="form-label" htmlFor={id}>{label}</label>
      <input id={id} className="form-input" value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} />
    </div>
  );
}

export function Field({ label, value, onChange, type = 'text', options, required, readOnly, span, hint, id }) {
  const fieldId = id ?? `f-${label.replace(/\W+/g, '-').toLowerCase()}`;
  const className = `form-field${span === 2 ? ' span-2' : ''}`;
  return (
    <div className={className}>
      <label className={`form-label${required ? ' required' : ''}`} htmlFor={fieldId}>{label}</label>
      {options ? (
        <select id={fieldId} className="form-select" value={value} disabled={readOnly} onChange={event => onChange?.(event.target.value)}>
          <option value="">— select —</option>
          {options.map(option => {
            const item = typeof option === 'string' ? { value: option, label: option } : option;
            return <option key={item.value} value={item.value}>{item.label}</option>;
          })}
        </select>
      ) : type === 'textarea' ? (
        <textarea id={fieldId} className="form-textarea" rows={3} value={value} readOnly={readOnly} onChange={event => onChange?.(event.target.value)} />
      ) : (
        <input id={fieldId} className="form-input" type={type} value={value} readOnly={readOnly} onChange={event => onChange?.(event.target.value)} />
      )}
      {hint && <span className="rep-field-hint">{hint}</span>}
    </div>
  );
}

/** Small disclosure used to keep discovery caveats visible without dominating a page. */
export function Disclosure({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rep-disclosure">
      <button className="rep-disclosure__toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? '▾' : '▸'} {label}
      </button>
      {open && <div className="rep-disclosure__body">{children}</div>}
    </div>
  );
}

/**
 * Marks a surface that shows an unapproved requirement. Used for F25, whose
 * providers are all blocked on procurement. The badge is deliberately loud:
 * a reviewer should never mistake one of these panels for working capability.
 */
export function GateBanner({ badge, title, children, reference }) {
  return (
    <div className="rep-gate" role="note">
      <div className="rep-gate__head">
        <span className="rep-gate__badge">{badge}</span>
        {title && <strong className="rep-gate__title">{title}</strong>}
      </div>
      <div className="rep-gate__body">{children}</div>
      {reference && <div className="rep-gate__ref">Requirement source: <code className="rep-code">{reference}</code></div>}
    </div>
  );
}

export function SyntheticFooter({ openDecisions = [], sources = [] }) {
  return (
    <div className="rep-footnote">
      <p>
        These are target system behaviours. This wireframe is an in-memory demonstration; it does not implement real
        authorization, persistence, scanning, sending, signing, migration, AI or external integrations.
      </p>
      {openDecisions.length > 0 && (
        <p>
          <strong>Open decisions:</strong> {openDecisions.join(' · ')}
        </p>
      )}
      {sources.length > 0 && (
        <p className="rep-muted">
          <strong>Discovery source:</strong> {sources.join(' · ')}
        </p>
      )}
    </div>
  );
}
