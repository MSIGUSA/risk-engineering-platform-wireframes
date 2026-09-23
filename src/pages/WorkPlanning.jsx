import { useState } from 'react';
import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';
import {
  PageHeader, Badge, InfoCard, DefinitionList, EmptyState, Field, SyntheticFooter, Disclosure, Crumb, Metric,
} from '../components/primitives';
import { ENGINEER_PROFILES, ACCOUNTS, accountName, siteName, userName, TODAY, USERS } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

/* ------------------------------------------------------------------ *
 * P07 — Triage and Assignment
 * ------------------------------------------------------------------ */

export function TriageAndAssignment() {
  const { requests } = useRep();
  const dispatch = useRepDispatch();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [disposition, setDisposition] = useState('Accept');
  const [assigneeId, setAssigneeId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [committedDate, setCommittedDate] = useState('');

  const queue = requests.filter(request => ['Submitted', 'Triaged', 'Draft'].includes(request.state));
  const selected = queue.find(request => request.id === selectedId) ?? null;
  const account = selected ? ACCOUNTS.find(item => item.id === selected.accountId) : null;

  function openDrawer(request) {
    setSelectedId(request.id);
    setDisposition('Accept');
    setAssigneeId(request.assigneeId ?? '');
    setOwnerId(request.accountableOwnerId ?? '');
    setCommittedDate(request.committedDate ?? request.requestedDate);
  }

  function apply() {
    dispatch({
      type: 'TRIAGE_REQUEST',
      payload: { requestId: selected.id, disposition, assigneeId: assigneeId || null, accountableOwnerId: ownerId || null, committedDate },
    });
    setSelectedId(null);
  }

  const eligible = ENGINEER_PROFILES.filter(profile => {
    if (!selected) return true;
    const user = USERS.find(item => item.id === profile.principalId);
    if (!user) return false;
    if (user.role === 'vendor') return selected.serviceType.startsWith('Vendor');
    return true;
  });

  return (
    <div>
      <PageHeader
        pageId="P07"
        subtitle="Queue with a side drawer for disposition, engineer eligibility and capacity, assignee, accountable owner, and the distinction between requested and committed dates."
      />

      <div className="rep-kpi-row">
        <Metric label="Awaiting triage" value={queue.filter(request => request.state === 'Submitted').length} tone="review" />
        <Metric label="Drafts not submitted" value={queue.filter(request => request.state === 'Draft').length} tone="muted" />
        <Metric label="Unassigned after triage" value={queue.filter(request => request.state === 'Triaged').length} />
      </div>

      <div className={selected ? 'rep-split' : ''}>
        <div>
          {queue.length === 0 ? <EmptyState title="Nothing in the triage queue" /> : (
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Request</th><th>Account</th><th>Site</th><th>Origin</th><th>Priority</th><th>Requested</th><th>State</th><th>Action</th></tr></thead>
                <tbody>
                  {queue.map(request => (
                    <tr key={request.id} className={request.id === selectedId ? 'data-table__row--active' : ''}>
                      <td><button className="table-link" onClick={() => navigate('P06', { requestId: request.id })}>{request.id}</button></td>
                      <td>{accountName(request.accountId)}</td>
                      <td>{request.siteIds.map(siteName).join(', ')}</td>
                      <td>{request.origin}</td>
                      <td>{request.priority}</td>
                      <td>{request.requestedDate}</td>
                      <td><Badge status={request.state} /></td>
                      <td><button className="btn" onClick={() => openDrawer(request)}>Triage</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected && (
          <div>
            <InfoCard title={`Triage ${selected.id}`} actions={<button className="btn" onClick={() => setSelectedId(null)}>Close</button>}>
              <DefinitionList items={[
                { label: 'Account', value: `${account?.name} (${selected.accountId})` },
                { label: 'Coverage status', value: <Badge status={account?.coverageStatus === 'Active' ? 'Active' : 'Blocked'} label={account?.coverageStatus} /> },
                { label: 'Purpose', value: selected.purpose },
                { label: 'Requested date', value: selected.requestedDate },
              ]} />
              {account?.coverageStatus !== 'Active' && (
                <div className="validation-banner" role="alert">
                  Coverage is not active for this account. Recurring work cannot silently proceed for an inactive account.
                </div>
              )}
              <div className="form-grid" style={{ marginTop: 'var(--space-4)' }}>
                <Field label="Disposition" value={disposition} onChange={setDisposition} options={['Accept', 'Cancel']} required />
                <Field
                  label="Committed date"
                  type="date"
                  value={committedDate}
                  onChange={setCommittedDate}
                  hint={`Requested ${selected.requestedDate}. The committed date is recorded separately and never overwrites it.`}
                />
                <Field
                  label="Assignee"
                  value={assigneeId}
                  onChange={setAssigneeId}
                  options={eligible.map(profile => ({ value: profile.principalId, label: `${userName(profile.principalId)} — ${profile.coverage}` }))}
                />
                <Field
                  label="Accountable owner"
                  value={ownerId}
                  onChange={setOwnerId}
                  options={USERS.filter(user => user.role === 'manager').map(user => ({ value: user.id, label: user.name }))}
                  hint="Assignment authority and accountable ownership are separate records."
                />
              </div>
              <button className="btn btn--primary" onClick={apply}>Record triage decision</button>
            </InfoCard>

            <InfoCard title="Engineer eligibility and capacity">
              <div className="rep-table-scroll">
                <table className="data-table">
                  <thead><tr><th>Engineer</th><th>Skills</th><th>Coverage</th><th>Open</th><th>Visits</th><th>Capacity</th></tr></thead>
                  <tbody>
                    {eligible.map(profile => (
                      <tr key={profile.principalId}>
                        <td>{userName(profile.principalId)}</td>
                        <td className="rep-muted">{profile.skills.join(', ')}</td>
                        <td>{profile.coverage}</td>
                        <td>{profile.openRequests}</td>
                        <td>{profile.scheduledVisits}</td>
                        <td className="rep-muted">{profile.capacityNote}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
                A profile alone infers no access. Assignment authority, engineer eligibility, site access and workload
                visibility are separate checks.
              </p>
            </InfoCard>
          </div>
        )}
      </div>

      <Disclosure label="Assignment and scheduling safeguards (F04)">
        <ul className="rep-bullet-list">
          <li>Assignment updates the lifecycle and the assignment history, with a recorded reason.</li>
          <li>Requested and committed dates keep distinct meanings across the whole lifecycle.</li>
          <li>No autonomous dispatch is assumed; a person records every assignment decision.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F04 — Assignment, scheduling and workload', 'P07 /work/triage']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P08 — Calendar
 * ------------------------------------------------------------------ */

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function Calendar() {
  const { visits, requests, authenticatedUser, can } = useRep();
  const dispatch = useRepDispatch();
  const navigate = useNavigate();
  const [engineerFilter, setEngineerFilter] = useState('');
  const [month, setMonth] = useState('2026-09');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [newStart, setNewStart] = useState('');

  const teamView = can(PERMISSIONS.workReadTeam);
  const scopedVisits = visits.filter(visit => {
    if (!teamView && visit.engineerId !== authenticatedUser.id) return false;
    if (engineerFilter && visit.engineerId !== engineerFilter) return false;
    return visit.start.startsWith(month);
  });

  const dueItems = requests.filter(request => request.requestedDate?.startsWith(month) && (teamView || request.assigneeId === authenticatedUser.id));

  const [year, monthIndex] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, monthIndex - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const leadingBlanks = (first.getUTCDay() + 6) % 7;

  const cells = [];
  for (let index = 0; index < leadingBlanks; index += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(`${month}-${String(day).padStart(2, '0')}`);

  function reschedule() {
    if (!selectedVisit || !newStart) return;
    const end = `${newStart.slice(0, 11)}${String(Number(newStart.slice(11, 13)) + 5).padStart(2, '0')}${newStart.slice(13)}`;
    dispatch({ type: 'SCHEDULE_VISIT', payload: { visitId: selectedVisit.id, start: newStart, end, status: 'Scheduled' } });
    setSelectedVisit(null);
    setNewStart('');
  }

  return (
    <div>
      <PageHeader
        pageId="P08"
        subtitle="Team and date filters over visits and workload. Scheduled visit windows and requested due dates are shown distinctly. No map dependency."
      />

      <div className="rep-toolbar">
        <div className="form-field">
          <label className="form-label" htmlFor="cal-month">Month</label>
          <input id="cal-month" className="form-input" type="month" value={month} onChange={event => setMonth(event.target.value)} />
        </div>
        {teamView && (
          <div className="form-field">
            <label className="form-label" htmlFor="cal-engineer">Engineer</label>
            <select id="cal-engineer" className="form-select" value={engineerFilter} onChange={event => setEngineerFilter(event.target.value)}>
              <option value="">Whole team</option>
              {ENGINEER_PROFILES.map(profile => <option key={profile.principalId} value={profile.principalId}>{userName(profile.principalId)}</option>)}
            </select>
          </div>
        )}
        <div className="rep-chip-row" style={{ margin: 0 }}>
          <span className="rep-chip"><span className="rep-chip__count">{scopedVisits.length}</span> visits</span>
          <span className="rep-chip"><span className="rep-chip__count">{dueItems.length}</span> due dates</span>
        </div>
      </div>

      <div className="rep-calendar">
        {WEEKDAYS.map(day => <div key={day} className="rep-calendar__head">{day}</div>)}
        {cells.map((date, index) => (
          <div key={date ?? `blank-${index}`} className={`rep-calendar__cell${date ? '' : ' rep-calendar__cell--muted'}${date === TODAY ? ' rep-calendar__cell--today' : ''}`}>
            {date && <span className="rep-calendar__date">{Number(date.slice(8))}</span>}
            {date && scopedVisits.filter(visit => visit.start.startsWith(date)).map(visit => (
              <button
                key={visit.id}
                className={`rep-calendar__event rep-calendar__event--${visit.status.toLowerCase()}`}
                onClick={() => { setSelectedVisit(visit); setNewStart(visit.start); }}
              >
                {visit.start.slice(11, 16)} {siteName(visit.siteId)}
              </button>
            ))}
            {date && dueItems.filter(request => request.requestedDate === date).map(request => (
              <button key={`due-${request.id}`} className="rep-calendar__event rep-calendar__event--due" onClick={() => navigate('P06', { requestId: request.id })}>
                Due: {request.id}
              </button>
            ))}
          </div>
        ))}
      </div>

      {selectedVisit && (
        <InfoCard title={`Visit ${selectedVisit.id}`} actions={<button className="btn" onClick={() => setSelectedVisit(null)}>Close</button>}>
          <DefinitionList items={[
            { label: 'Request', value: selectedVisit.requestId },
            { label: 'Site', value: `${siteName(selectedVisit.siteId)} (${selectedVisit.siteId})` },
            { label: 'Window', value: `${selectedVisit.start.replace('T', ' ')} to ${selectedVisit.end.replace('T', ' ')}` },
            { label: 'Time zone', value: selectedVisit.timeZone },
            { label: 'Engineer', value: userName(selectedVisit.engineerId) },
            { label: 'Status', value: <Badge status={selectedVisit.status} /> },
          ]} />
          {can(PERMISSIONS.visitSchedule) && (
            <div className="form-grid" style={{ marginTop: 'var(--space-3)' }}>
              <Field label="New start" type="datetime-local" value={newStart} onChange={setNewStart} hint="Instants are stored in UTC; the site time zone is preserved for the appointment." />
              <div className="form-field" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn--primary" onClick={reschedule}>Reschedule</button>
              </div>
            </div>
          )}
        </InfoCard>
      )}

      <InfoCard title="Workload in the selected scope">
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Engineer</th><th>Visits this month</th><th>Open requests</th><th>Coverage</th><th>Capacity note</th></tr></thead>
            <tbody>
              {ENGINEER_PROFILES.filter(profile => teamView || profile.principalId === authenticatedUser.id).map(profile => (
                <tr key={profile.principalId}>
                  <td>{userName(profile.principalId)}</td>
                  <td>{scopedVisits.filter(visit => visit.engineerId === profile.principalId).length}</td>
                  <td>{profile.openRequests}</td>
                  <td>{profile.coverage}</td>
                  <td className="rep-muted">{profile.capacityNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoCard>

      <SyntheticFooter sources={['F04 — Assignment, scheduling and workload', 'P08 /work/calendar']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P09 — Task Detail
 * ------------------------------------------------------------------ */

export function TaskDetail({ taskId }) {
  const { tasks } = useRep();
  const dispatch = useRepDispatch();
  const navigate = useNavigate();
  const task = tasks.find(item => item.id === taskId);

  if (!task) return <EmptyState title="Task not found in this scope" />;

  const dependencies = tasks.filter(item => task.dependencies.includes(item.id));
  const blocked = dependencies.some(item => item.status !== 'Complete');

  return (
    <div>
      <PageHeader
        pageId="P09"
        params={{ taskId }}
        title={task.title}
        subtitle="The same content is available as a drawer from the queues. Completion respects dependencies."
        breadcrumb={<><Crumb pageId="P01">My work</Crumb><span>/</span><span>{task.id}</span></>}
      />

      <div className="rep-grid rep-grid--two">
        <InfoCard title="Task">
          <DefinitionList items={[
            { label: 'Task', value: task.id },
            { label: 'Type', value: task.type },
            { label: 'Owner', value: userName(task.ownerId) },
            { label: 'Due date', value: task.dueDate },
            { label: 'Status', value: <Badge status={task.status} /> },
            { label: 'Linked request', value: task.requestId ?? 'Account work — no request reference' },
          ]} />
          <p style={{ marginTop: 'var(--space-3)' }}>{task.description}</p>
        </InfoCard>

        <InfoCard title="Dependencies">
          {dependencies.length === 0 ? <EmptyState title="No dependencies" /> : (
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Task</th><th>Title</th><th>Status</th></tr></thead>
                <tbody>
                  {dependencies.map(item => (
                    <tr key={item.id}>
                      <td><button className="table-link" onClick={() => navigate('P09', { taskId: item.id })}>{item.id}</button></td>
                      <td>{item.title}</td><td><Badge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {blocked && <div className="validation-banner" role="alert">A dependency is not complete. Completion is blocked until it is resolved.</div>}
        </InfoCard>
      </div>

      <InfoCard title="Completion">
        <div className="rep-chip-row">
          {['NotStarted', 'InProgress', 'Blocked', 'Complete'].map(status => (
            <button
              key={status}
              className={`rep-chip${task.status === status ? ' active' : ''}`}
              disabled={status === 'Complete' && blocked}
              onClick={() => dispatch({ type: 'SET_TASK_STATUS', payload: { taskId: task.id, status } })}
            >
              {status}
            </button>
          ))}
        </div>
        {task.requestId && (
          <button className="btn" onClick={() => navigate('P06', { requestId: task.requestId })}>Open linked request</button>
        )}
      </InfoCard>

      <SyntheticFooter sources={['F04 — Assignment, scheduling and workload', 'P09 /tasks/:taskId']} />
    </div>
  );
}
