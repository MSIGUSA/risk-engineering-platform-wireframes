import { useState } from 'react';
import { useRep, useRepDispatch } from '../state/repHooks';
import {
  PageHeader, InfoCard, EmptyState, SyntheticFooter, Disclosure, Field, Metric,
} from '../components/primitives';
import { TIME_ACTIVITIES, ACCOUNTS, accountName, userName, TODAY, USERS } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${String(remainder).padStart(2, '0')}m`;
}

/* ------------------------------------------------------------------ *
 * P23 — My Time
 * ------------------------------------------------------------------ */

export function MyTime() {
  const { timeEntries, requests, authenticatedUser, can } = useRep();
  const dispatch = useRepDispatch();
  const [date, setDate] = useState(TODAY);
  const [activity, setActivity] = useState('Survey');
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('30');
  const [requestId, setRequestId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');

  const myEntries = timeEntries.filter(entry => entry.principalId === authenticatedUser.id);
  const total = myEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const byActivity = TIME_ACTIVITIES.map(item => ({
    activity: item,
    minutes: myEntries.filter(entry => entry.activity === item).reduce((sum, entry) => sum + entry.durationMinutes, 0),
  })).filter(item => item.minutes > 0);

  const durationMinutes = Number(hours || 0) * 60 + Number(minutes || 0);
  const myRequests = requests.filter(request => request.assigneeId === authenticatedUser.id);

  function add() {
    dispatch({
      type: 'ADD_TIME_ENTRY',
      payload: { date, activity, durationMinutes, requestId: requestId || null, accountId: accountId || null, note },
    });
    setNote('');
  }

  return (
    <div>
      <PageHeader
        pageId="P23"
        subtitle="Record survey, travel, reporting and administrative or account work. General administration does not need a survey reference, so no dummy survey is created."
      />

      <div className="rep-kpi-row">
        <Metric label="Recorded total" value={formatDuration(total)} detail={`${myEntries.length} entries`} />
        {byActivity.slice(0, 3).map(item => (
          <Metric key={item.activity} label={item.activity} value={formatDuration(item.minutes)} tone="muted" />
        ))}
      </div>

      <InfoCard title="Record time">
        <div className="form-grid">
          <Field label="Date" type="date" required value={date} onChange={setDate} />
          <Field label="Activity" required value={activity} onChange={setActivity} options={TIME_ACTIVITIES} />
          <Field label="Hours" type="number" value={hours} onChange={setHours} />
          <Field label="Minutes" type="number" value={minutes} onChange={setMinutes} hint={`Total ${formatDuration(durationMinutes)}`} />
          <Field
            label="Request (optional)"
            value={requestId}
            onChange={setRequestId}
            options={myRequests.map(request => ({ value: request.id, label: `${request.id} — ${accountName(request.accountId)}` }))}
            hint="Leave blank for general administration. No dummy survey is required."
          />
          <Field
            label="Account (optional)"
            value={accountId}
            onChange={setAccountId}
            options={ACCOUNTS.filter(account => authenticatedUser.accountScope.includes(account.id)).map(account => ({ value: account.id, label: account.name }))}
            hint="Account work without a specific request is recorded against the account."
          />
          <Field label="Note" span={2} type="textarea" value={note} onChange={setNote} />
        </div>
        <button className="btn btn--primary" disabled={durationMinutes <= 0} onClick={add}>Record entry</button>
        <p className="rep-muted" style={{ marginTop: 'var(--space-2)' }}>
          This is activity capture for operational visibility. It carries no payroll or billing implication.
        </p>
      </InfoCard>

      <InfoCard title="My entries">
        {myEntries.length === 0 ? <EmptyState title="No entries recorded" /> : (
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Entry</th><th>Date</th><th>Activity</th><th>Context</th><th>Duration</th><th>Note</th><th /></tr></thead>
              <tbody>
                {myEntries.map(entry => (
                  <tr key={entry.id}>
                    <td><code className="rep-code">{entry.id}</code></td>
                    <td>{entry.date}</td>
                    <td>{entry.activity}</td>
                    <td className="rep-muted">{entry.requestId ?? (entry.accountId ? accountName(entry.accountId) : 'General administration')}</td>
                    <td>{formatDuration(entry.durationMinutes)}</td>
                    <td className="rep-muted">{entry.note}</td>
                    <td>
                      {can(PERMISSIONS.timeWriteOwn) && (
                        <button className="btn" onClick={() => dispatch({ type: 'DELETE_TIME_ENTRY', payload: { entryId: entry.id } })}>Correct</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={4}><strong>Total</strong></td><td><strong>{formatDuration(total)}</strong></td><td colSpan={2} /></tr>
              </tfoot>
            </table>
          </div>
        )}
      </InfoCard>

      <Disclosure label="Time capture scope (F15)">
        <ul className="rep-bullet-list">
          <li>A general-administration entry saves without a survey identifier.</li>
          <li>Hours and minutes total correctly across the recorded entries.</li>
          <li>Own-entry editing and team reporting are distinct permissions.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F15 — Time and activity capture', 'P23 /time']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P24 — Team Time
 * ------------------------------------------------------------------ */

export function TeamTime() {
  const { timeEntries, can } = useRep();
  const [principal, setPrincipal] = useState('');
  const [activity, setActivity] = useState('');
  const [from, setFrom] = useState('2026-09-01');
  const [to, setTo] = useState('2026-09-30');

  const filtered = timeEntries.filter(entry => {
    if (principal && entry.principalId !== principal) return false;
    if (activity && entry.activity !== activity) return false;
    if (from && entry.date < from) return false;
    if (to && entry.date > to) return false;
    return true;
  });

  const total = filtered.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const principals = [...new Set(timeEntries.map(entry => entry.principalId))];

  const byPrincipal = principals.map(id => ({
    id,
    minutes: filtered.filter(entry => entry.principalId === id).reduce((sum, entry) => sum + entry.durationMinutes, 0),
  })).filter(row => row.minutes > 0);

  const byActivity = TIME_ACTIVITIES.map(item => ({
    activity: item,
    minutes: filtered.filter(entry => entry.activity === item).reduce((sum, entry) => sum + entry.durationMinutes, 0),
  })).filter(row => row.minutes > 0);

  return (
    <div>
      <PageHeader
        pageId="P24"
        subtitle="Authorized team, date and activity filters with totals and export. There are no payroll or billing controls here."
        actions={can(PERMISSIONS.timeExport) && (
          <button className="btn" onClick={() => window.alert(`Simulation only. The export would contain the ${filtered.length} entries in the current server-authorized scope, with the audience context recorded on the job.`)}>
            Export current scope
          </button>
        )}
      />

      <div className="rep-toolbar">
        <div className="form-field">
          <label className="form-label" htmlFor="team-principal">Person</label>
          <select id="team-principal" className="form-select" value={principal} onChange={event => setPrincipal(event.target.value)}>
            <option value="">Whole authorized team</option>
            {principals.map(id => <option key={id} value={id}>{userName(id)}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="team-activity">Activity</label>
          <select id="team-activity" className="form-select" value={activity} onChange={event => setActivity(event.target.value)}>
            <option value="">Any</option>
            {TIME_ACTIVITIES.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="team-from">From</label>
          <input id="team-from" className="form-input" type="date" value={from} onChange={event => setFrom(event.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="team-to">To</label>
          <input id="team-to" className="form-input" type="date" value={to} onChange={event => setTo(event.target.value)} />
        </div>
      </div>

      <div className="rep-grid rep-grid--two">
        <InfoCard title="By person">
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Person</th><th>Role</th><th>Recorded</th></tr></thead>
              <tbody>
                {byPrincipal.map(row => (
                  <tr key={row.id}>
                    <td>{userName(row.id)}</td>
                    <td className="rep-muted">{USERS.find(user => user.id === row.id)?.title}</td>
                    <td>{formatDuration(row.minutes)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan={2}><strong>Total</strong></td><td><strong>{formatDuration(total)}</strong></td></tr></tfoot>
            </table>
          </div>
        </InfoCard>
        <InfoCard title="By activity classification">
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Activity</th><th>Recorded</th><th>Share</th></tr></thead>
              <tbody>
                {byActivity.map(row => (
                  <tr key={row.activity}>
                    <td>{row.activity}</td>
                    <td>{formatDuration(row.minutes)}</td>
                    <td>{total ? Math.round((row.minutes / total) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>
      </div>

      <InfoCard title="Entries in scope">
        {filtered.length === 0 ? <EmptyState title="No entries in this filter" /> : (
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Entry</th><th>Person</th><th>Date</th><th>Activity</th><th>Context</th><th>Duration</th></tr></thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry.id}>
                    <td><code className="rep-code">{entry.id}</code></td>
                    <td>{userName(entry.principalId)}</td>
                    <td>{entry.date}</td>
                    <td>{entry.activity}</td>
                    <td className="rep-muted">{entry.requestId ?? (entry.accountId ? accountName(entry.accountId) : 'General administration')}</td>
                    <td>{formatDuration(entry.durationMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </InfoCard>

      <Disclosure label="Reporting boundary (F15, F17)">
        <ul className="rep-bullet-list">
          <li>Sensitive employee metrics are never projected to customers.</li>
          <li>An export reproduces the server-authorized filter, not whatever rows happen to be loaded in the browser.</li>
          <li>This is operational visibility only. It is not payroll, billing or a performance target.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F15 — Time and activity capture', 'P24 /time/team']} />
    </div>
  );
}
