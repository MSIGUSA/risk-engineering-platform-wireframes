import { useState } from 'react';
import { useRep, useRepDispatch } from '../state/repHooks';
import { PageHeader, InfoCard, Field, Badge, DefinitionList, SyntheticFooter, Disclosure, EmptyState } from '../components/primitives';
import { ACCOUNTS, SITES, ENTITIES, TEMPLATES, accountName, siteName } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

const STEPS = [
  { id: 1, label: 'Account and sites', hint: 'Step 1' },
  { id: 2, label: 'Purpose and dates', hint: 'Step 2' },
  { id: 3, label: 'Templates', hint: 'Step 3' },
  { id: 4, label: 'Extra questions and evidence', hint: 'Step 4' },
  { id: 5, label: 'Review and submit', hint: 'Step 5' },
];

const ORIGIN_BY_ROLE = {
  underwriter: 'Underwriter',
  engineer: 'Engineer',
  manager: 'Manager',
  coordinator: 'Coordinator',
};

const QUESTION_LIMIT = 5;

export default function NewRequest() {
  const { authenticatedUser, can } = useRep();
  const dispatch = useRepDispatch();
  const [step, setStep] = useState(1);
  const [accountId, setAccountId] = useState('');
  const [siteIds, setSiteIds] = useState([]);
  const [serviceType, setServiceType] = useState('Property survey');
  const [priority, setPriority] = useState('Standard');
  const [purpose, setPurpose] = useState('');
  const [background, setBackground] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [primaryTemplate, setPrimaryTemplate] = useState('property-standard');
  const [supplements, setSupplements] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionDraft, setQuestionDraft] = useState({ text: '', type: 'longText', respondent: 'Engineer', audience: 'Internal', required: true });
  const [selfAssign, setSelfAssign] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState('');

  const scopedAccounts = ACCOUNTS.filter(account => authenticatedUser.accountScope.includes(account.id));
  const accountSites = SITES.filter(site => site.accountId === accountId);
  const inputForms = TEMPLATES.filter(template => template.kind === 'InputForm' && template.status === 'Published');
  const primary = TEMPLATES.find(template => template.id === primaryTemplate);

  const stepValid = {
    1: Boolean(accountId) && siteIds.length > 0,
    2: Boolean(purpose.trim()) && Boolean(requestedDate),
    3: Boolean(primaryTemplate),
    4: true,
    5: true,
  };

  function toggleSite(siteId) {
    setSiteIds(current => (current.includes(siteId) ? current.filter(id => id !== siteId) : [...current, siteId]));
  }

  function toggleSupplement(templateId) {
    setSupplements(current => (current.includes(templateId) ? current.filter(id => id !== templateId) : [...current, templateId]));
  }

  function addQuestion() {
    if (!questionDraft.text.trim() || questions.length >= QUESTION_LIMIT) return;
    const id = `Q-NEW-${String(questions.length + 1).padStart(2, '0')}`;
    setQuestions([...questions, { id, ...questionDraft }]);
    setQuestionDraft({ text: '', type: 'longText', respondent: 'Engineer', audience: 'Internal', required: true });
  }

  function buildComponents() {
    const components = [];
    let order = 1;
    siteIds.forEach(siteId => {
      components.push({ id: `PKG-NEW-${order}`, type: 'PrimaryTemplate', templateId: primaryTemplate, templateVersion: primary?.currentVersion ?? 1, siteId, order });
      order += 1;
      supplements.forEach(templateId => {
        const supplement = TEMPLATES.find(item => item.id === templateId);
        components.push({ id: `PKG-NEW-${order}`, type: 'SupplementalTemplate', templateId, templateVersion: supplement?.currentVersion ?? 1, siteId, order });
        order += 1;
      });
      if (questions.length) {
        components.push({ id: `PKG-NEW-${order}`, type: 'RequestQuestionSet', templateId: null, templateVersion: null, siteId, order });
        order += 1;
      }
    });
    return components;
  }

  function create(submit) {
    const account = ACCOUNTS.find(item => item.id === accountId);
    dispatch({
      type: 'CREATE_REQUEST',
      payload: {
        accountId,
        siteIds,
        customerOrganizationId: account.organizationId,
        origin: ORIGIN_BY_ROLE[authenticatedUser.role] ?? 'Manager',
        serviceType,
        priority,
        purpose,
        background,
        requestedDate,
        selfAssign: selfAssign && can(PERMISSIONS.surveyReadAssigned),
        submit,
        components: buildComponents(),
        additionalQuestions: questions,
      },
    });
  }

  return (
    <div>
      <PageHeader
        pageId="P05"
        subtitle="Compose work from an approved primary template, optional supplements and bounded request-specific questions. This is not a forms designer."
      />

      <div className="rep-wizard" role="tablist" aria-label="Request composition steps">
        {STEPS.map(item => (
          <button
            key={item.id}
            role="tab"
            aria-selected={step === item.id}
            className={`rep-wizard__step${step === item.id ? ' active' : ''}${step > item.id ? ' done' : ''}`}
            onClick={() => setStep(item.id)}
          >
            <span>{item.hint}</span>
            {item.label}
          </button>
        ))}
      </div>

      {step === 1 && (
        <InfoCard title="Account and sites">
          <div className="form-grid">
            <Field
              label="Account"
              required
              value={accountId}
              onChange={value => { setAccountId(value); setSiteIds([]); }}
              options={scopedAccounts.map(account => ({ value: account.id, label: `${account.name} (${account.id})` }))}
              hint="Only accounts in your entitled scope are offered. One customer organization per request in the proposed model."
            />
          </div>
          {accountId && (
            <>
              <div className="form-section__title" style={{ marginTop: 'var(--space-4)' }}>Sites</div>
              <div className="rep-table-scroll">
                <table className="data-table">
                  <thead><tr><th>Include</th><th>Site</th><th>Operating entity</th><th>Address</th><th>Last visited</th></tr></thead>
                  <tbody>
                    {accountSites.map(site => (
                      <tr key={site.id}>
                        <td><input type="checkbox" checked={siteIds.includes(site.id)} onChange={() => toggleSite(site.id)} aria-label={`Include ${site.name}`} /></td>
                        <td>{site.name} <span className="rep-muted">({site.id})</span></td>
                        <td>{ENTITIES.find(entity => entity.id === site.entityId)?.name}</td>
                        <td className="rep-muted">{site.address}</td>
                        <td>{site.lastVisited}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
                Multiple sites are supported without merging customers. Each site receives its own package components.
              </p>
            </>
          )}
        </InfoCard>
      )}

      {step === 2 && (
        <InfoCard title="Purpose, priority and dates">
          <div className="form-grid">
            <Field label="Service type" required value={serviceType} onChange={setServiceType} options={['Property survey', 'General liability survey', 'Workers compensation survey', 'Vendor property survey']} />
            <Field label="Priority" value={priority} onChange={setPriority} options={['Standard', 'Expedite']} />
            <Field label="Requested date" required type="date" value={requestedDate} onChange={setRequestedDate} hint="The requested date is what the requester asked for. The committed date is set separately at triage." />
            <Field label="Committed date" value="Set at triage" readOnly hint="Requested and committed dates remain distinguishable throughout the lifecycle." />
            <Field label="Purpose" required span={2} type="textarea" value={purpose} onChange={setPurpose} />
            <Field label="Background" span={2} type="textarea" value={background} onChange={setBackground} />
          </div>
          {can(PERMISSIONS.surveyReadAssigned) && (
            <label className="rep-muted" style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 'var(--space-3)' }}>
              <input type="checkbox" checked={selfAssign} onChange={event => setSelfAssign(event.target.checked)} />
              Self-assign this request (permitted for an engineer who may initiate work)
            </label>
          )}
        </InfoCard>
      )}

      {step === 3 && (
        <>
          <InfoCard title="Primary template">
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Select</th><th>Template</th><th>Version</th><th>Applicability</th><th>Owner</th><th>Status</th></tr></thead>
                <tbody>
                  {inputForms.map(template => (
                    <tr key={template.id}>
                      <td><input type="radio" name="primary" checked={primaryTemplate === template.id} onChange={() => setPrimaryTemplate(template.id)} aria-label={`Use ${template.name} as primary`} /></td>
                      <td>{template.name} <span className="rep-muted">({template.id})</span></td>
                      <td>v{template.currentVersion}</td>
                      <td>{template.applicability.join(', ')}</td>
                      <td className="rep-muted">{template.owner}</td>
                      <td><Badge status={template.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InfoCard>
          <InfoCard title="Supplemental templates">
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Include</th><th>Template</th><th>Version</th><th>Applicability</th></tr></thead>
                <tbody>
                  {inputForms.filter(template => template.id !== primaryTemplate).map(template => (
                    <tr key={template.id}>
                      <td><input type="checkbox" checked={supplements.includes(template.id)} onChange={() => toggleSupplement(template.id)} aria-label={`Include ${template.name}`} /></td>
                      <td>{template.name}</td>
                      <td>v{template.currentVersion}</td>
                      <td>{template.applicability.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
              Selected versions are pinned to the package revision. A later catalog publication does not change work already pinned.
            </p>
          </InfoCard>
        </>
      )}

      {step === 4 && (
        <>
          <InfoCard title={`Request-specific questions (${questions.length} of ${QUESTION_LIMIT})`}>
            <p className="rep-muted rep-section-intro">
              Bounded additional questions only. Each question has an explicit intended respondent and audience, and it is
              request-local — it is not added to the governed catalog.
            </p>
            <div className="form-grid">
              <Field label="Question text" span={2} type="textarea" value={questionDraft.text} onChange={value => setQuestionDraft({ ...questionDraft, text: value })} />
              <Field label="Answer type" value={questionDraft.type} onChange={value => setQuestionDraft({ ...questionDraft, type: value })} options={['shortText', 'longText', 'yesNo', 'number', 'choice']} />
              <Field label="Intended respondent" value={questionDraft.respondent} onChange={value => setQuestionDraft({ ...questionDraft, respondent: value, audience: value === 'Customer' ? 'Shared' : 'Internal' })} options={['Engineer', 'Customer', 'Vendor']} />
              <Field label="Audience" value={questionDraft.audience} readOnly hint="Audience follows the intended respondent; a customer question is shared, an engineer question stays internal." />
              <Field label="Required" value={questionDraft.required ? 'Yes' : 'No'} onChange={value => setQuestionDraft({ ...questionDraft, required: value === 'Yes' })} options={['Yes', 'No']} />
            </div>
            <button className="btn" disabled={!questionDraft.text.trim() || questions.length >= QUESTION_LIMIT} onClick={addQuestion}>
              Add question
            </button>
            {questions.length > 0 && (
              <div className="rep-table-scroll" style={{ marginTop: 'var(--space-4)' }}>
                <table className="data-table">
                  <thead><tr><th>Question ID</th><th>Text</th><th>Type</th><th>Respondent</th><th>Audience</th><th>Required</th></tr></thead>
                  <tbody>
                    {questions.map(question => (
                      <tr key={question.id}>
                        <td><code className="rep-code">{question.id}</code></td>
                        <td>{question.text}</td><td>{question.type}</td>
                        <td>{question.respondent}</td><td>{question.audience}</td><td>{question.required ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </InfoCard>
          <InfoCard title="Supporting evidence">
            <Field label="Evidence note" span={2} type="textarea" value={evidenceNote} onChange={setEvidenceNote} hint="Uploads are authorized against the created request. This wireframe records the intent only; no file is stored or scanned." />
          </InfoCard>
        </>
      )}

      {step === 5 && (
        <>
          <InfoCard title="Review">
            {!accountId ? <EmptyState title="Complete step 1 first" /> : (
              <DefinitionList items={[
                { label: 'Account', value: `${accountName(accountId)} (${accountId})` },
                { label: 'Sites', value: siteIds.map(id => `${siteName(id)} (${id})`).join(', ') || 'None selected' },
                { label: 'Origin', value: ORIGIN_BY_ROLE[authenticatedUser.role] ?? 'Manager' },
                { label: 'Service type', value: serviceType },
                { label: 'Priority', value: priority },
                { label: 'Requested date', value: requestedDate || 'Not set' },
                { label: 'Committed date', value: 'Set at triage' },
                { label: 'Purpose', value: purpose || 'Not set' },
                { label: 'Primary template', value: primary ? `${primary.name} v${primary.currentVersion}` : 'Not selected' },
                { label: 'Supplements', value: supplements.length ? supplements.map(id => TEMPLATES.find(template => template.id === id)?.name).join(', ') : 'None' },
                { label: 'Request-specific questions', value: questions.length },
                { label: 'Self-assignment', value: selfAssign ? 'Requested' : 'No' },
              ]} />
            )}
          </InfoCard>
          <InfoCard title="Package components that will be created">
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Component ID</th><th>Type</th><th>Template</th><th>Version</th><th>Site</th><th>Order</th></tr></thead>
                <tbody>
                  {buildComponents().map(component => (
                    <tr key={component.id}>
                      <td><code className="rep-code">{component.id}</code></td>
                      <td>{component.type}</td>
                      <td>{component.templateId ?? 'Request question snapshot'}</td>
                      <td>{component.templateVersion ? `v${component.templateVersion}` : '—'}</td>
                      <td>{siteName(component.siteId)}</td>
                      <td>{component.order}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
              One primary, multiple supplements and request-specific questions each receive stable identifiers on the
              package revision.
            </p>
          </InfoCard>
        </>
      )}

      <div className="rep-toolbar">
        <button className="btn" disabled={step === 1} onClick={() => setStep(step - 1)}>Back</button>
        <button className="btn" disabled={step === 5 || !stepValid[step]} onClick={() => setStep(step + 1)}>Next</button>
        <span style={{ flex: 1 }} />
        <button className="btn" disabled={!stepValid[1] || !stepValid[2]} onClick={() => create(false)}>Save draft</button>
        <button className="btn btn--primary" disabled={!stepValid[1] || !stepValid[2] || !stepValid[3]} onClick={() => create(true)}>Submit request</button>
      </div>

      <Disclosure label="Authorization and scope notes (F03)">
        <ul className="rep-bullet-list">
          <li>The referenced account, sites, templates, files and any proposed assignee are each authorized in the engine.</li>
          <li>An engineer may initiate and self-assign when permitted; origin is recorded either way.</li>
          <li>Submitted package revisions are immutable. A later scope change creates a new revision with a recorded reason.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F03 — Request intake and scope', 'P05 /requests/new']} />
    </div>
  );
}
