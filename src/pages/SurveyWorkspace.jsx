import { useMemo, useState } from 'react';
import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';
import {
  PageHeader, Badge, InfoCard, EmptyState, SaveIndicator, SyntheticFooter, Disclosure, Crumb, Field,
} from '../components/primitives';
import ExternalRiskDataPanel from '../components/ExternalRiskDataPanel';
import { SURVEY_SECTIONS, TEMPLATES, accountName, siteName, userName } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

const currency = value => `$${Number(value || 0).toLocaleString()}`;

export default function SurveyWorkspace({ surveyId }) {
  const state = useRep();
  const { surveys, requests, packageRevisions, authenticatedUser, can, surveyDirty } = state;
  const dispatch = useRepDispatch();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('sec-site');
  const [showPreview, setShowPreview] = useState(true);

  const survey = surveys[surveyId];
  const request = survey ? requests.find(item => item.id === survey.requestId) : null;
  const template = survey ? TEMPLATES.find(item => item.id === survey.templateId) : null;
  const pinned = survey ? (packageRevisions[survey.requestId] ?? []).find(revision => revision.state === 'Pinned') : null;
  const requestQuestions = useMemo(() => pinned?.additionalQuestions ?? [], [pinned]);

  const isRespondent = survey?.respondentId === authenticatedUser.id;
  const editable = Boolean(survey) && can(PERMISSIONS.responseWriteOwn) && isRespondent && !survey.submitted && survey.state !== 'Locked';

  /* Validation mirrors the published output rules: a No answer requires a comment, and
     "No" is never treated as blank. Hooks run before any early return so the hook order
     stays identical on every render. */
  const validation = useMemo(() => {
    if (!survey) return [];
    const problems = [];
    SURVEY_SECTIONS.forEach(section => {
      section.fields.forEach(field => {
        const value = survey.answers[field.id];
        if (field.required && field.respondent !== 'Customer' && (value === undefined || value === '')) {
          problems.push({ sectionId: section.id, message: `${field.label} is required.` });
        }
        if (field.commentField && value === field.commentRequiredWhen && !survey.answers[field.commentField]) {
          problems.push({ sectionId: section.id, message: `${field.label} answered "${value}" requires a comment.` });
        }
      });
    });
    if (survey.buildings.length === 0) {
      problems.push({ sectionId: 'sec-values', message: 'At least one building row is required.' });
    }
    requestQuestions.filter(question => question.required && question.respondent === 'Engineer').forEach(question => {
      if (!survey.answers[question.id] && !survey.answers.loadingAreaChanges) {
        problems.push({ sectionId: 'sec-questions', message: `${question.id} is required.` });
      }
    });
    return problems;
  }, [survey, requestQuestions]);

  if (!survey) return <EmptyState title="Survey not found in this scope" detail="Only an authorized responder may open a response set." />;

  const sectionStatus = sectionId => {
    if (validation.some(problem => problem.sectionId === sectionId)) return 'Incomplete';
    return 'Complete';
  };

  const answeredCount = SURVEY_SECTIONS.filter(section => sectionStatus(section.id) === 'Complete').length;
  const progress = Math.round((answeredCount / SURVEY_SECTIONS.length) * 100);

  const totals = survey.buildings.reduce(
    (accumulator, building) => ({
      buildingValue: accumulator.buildingValue + Number(building.buildingValue || 0),
      contentsValue: accumulator.contentsValue + Number(building.contentsValue || 0),
      businessInterruptionValue: accumulator.businessInterruptionValue + Number(building.businessInterruptionValue || 0),
    }),
    { buildingValue: 0, contentsValue: 0, businessInterruptionValue: 0 },
  );
  const totalInsurableValue = totals.buildingValue + totals.contentsValue + totals.businessInterruptionValue;

  const section = SURVEY_SECTIONS.find(item => item.id === activeSection) ?? SURVEY_SECTIONS[0];

  function setAnswer(field, value) {
    dispatch({ type: 'UPDATE_SURVEY_ANSWER', payload: { surveyId, field, value } });
  }

  return (
    <div>
      <PageHeader
        pageId="P10"
        params={{ surveyId }}
        title={`${survey.id} — ${template?.name} v${survey.templateVersion}`}
        subtitle={`${accountName(request?.accountId)} · ${siteName(survey.siteId)} · package revision ${survey.packageRevision}`}
        breadcrumb={<>
          <Crumb pageId="P01">My work</Crumb><span>/</span>
          <Crumb pageId="P06" params={{ requestId: survey.requestId }}>{survey.requestId}</Crumb><span>/</span>
          <span>{survey.id}</span>
        </>}
        actions={(
          <>
            <SaveIndicator saveState={surveyDirty ? 'Unsaved' : survey.saveState} />
            <button className="btn" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? 'Hide output preview' : 'Show output preview'}
            </button>
            <button className="btn" disabled={!editable} onClick={() => dispatch({ type: 'SAVE_SURVEY_DRAFT', payload: { surveyId } })}>
              Save draft
            </button>
            <button
              className="btn btn--primary"
              disabled={!editable || validation.length > 0 || !can(PERMISSIONS.responseSubmit)}
              onClick={() => dispatch({ type: 'SUBMIT_SURVEY', payload: { surveyId } })}
              title={validation.length > 0 ? 'Resolve validation problems before submitting' : 'Submit an immutable revision'}
            >
              Submit revision
            </button>
          </>
        )}
      />

      {!editable && (
        <div className="rep-denial rep-denial--compact">
          <div className="rep-denial__title">Read-only</div>
          <p>
            {survey.submitted
              ? 'This revision is submitted and immutable. Corrections create a new revision after a review return.'
              : `Only the assigned responder (${userName(survey.respondentId)}) may edit this response set.`}
          </p>
        </div>
      )}

      {validation.length > 0 && editable && (
        <div className="validation-banner" role="alert">
          <strong>Validation is server-authoritative in the engine.</strong>
          <ul className="validation-banner__list">
            {validation.map((problem, index) => <li key={index}>{problem.message}</li>)}
          </ul>
          Incomplete drafts do not become submitted work.
        </div>
      )}

      <div className="rep-split rep-split--tree">
        <nav className="rep-section-tree" aria-label="Survey sections">
          <div className="wb-primary-nav__title" style={{ padding: '6px 10px' }}>Sections</div>
          {SURVEY_SECTIONS.map(item => (
            <button
              key={item.id}
              className={`rep-section-tree__item${activeSection === item.id ? ' active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span>{item.title}</span>
              <span className="rep-section-tree__status">{sectionStatus(item.id) === 'Complete' ? '✓' : '•'}</span>
            </button>
          ))}
          <div style={{ padding: '10px' }}>
            <div className="rep-muted">Progress {progress}%</div>
            <div className="rep-progress"><div className="rep-progress__bar" style={{ width: `${progress}%` }} /></div>
          </div>
        </nav>

        <div>
          <InfoCard title={section.title}>
            {section.id === 'sec-values' ? (
              <>
                <p className="rep-muted rep-section-intro">
                  Repeating rows keep a stable identity. Totals update deterministically from the entered values; the
                  engineer still records judgment rather than receiving an automated conclusion.
                </p>
                {survey.buildings.map((building, index) => (
                  <div key={building.id} className="rep-repeat-row">
                    <div className="rep-repeat-row__head">
                      <strong>Building {index + 1}</strong>
                      <span className="rep-repeat-row__id">{building.id}</span>
                      {editable && (
                        <button className="btn" onClick={() => dispatch({ type: 'REMOVE_BUILDING', payload: { surveyId, buildingId: building.id } })}>
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="form-grid">
                      <Field label="Name" value={building.name} readOnly={!editable} onChange={value => dispatch({ type: 'UPDATE_BUILDING', payload: { surveyId, buildingId: building.id, field: 'name', value } })} />
                      <Field label="Building value" type="number" value={building.buildingValue} readOnly={!editable} onChange={value => dispatch({ type: 'UPDATE_BUILDING', payload: { surveyId, buildingId: building.id, field: 'buildingValue', value } })} />
                      <Field label="Contents value" type="number" value={building.contentsValue} readOnly={!editable} onChange={value => dispatch({ type: 'UPDATE_BUILDING', payload: { surveyId, buildingId: building.id, field: 'contentsValue', value } })} />
                      <Field label="Business interruption value" type="number" value={building.businessInterruptionValue} readOnly={!editable} onChange={value => dispatch({ type: 'UPDATE_BUILDING', payload: { surveyId, buildingId: building.id, field: 'businessInterruptionValue', value } })} />
                    </div>
                  </div>
                ))}
                {editable && (
                  <button className="btn" onClick={() => dispatch({ type: 'ADD_BUILDING', payload: { surveyId } })}>Add building</button>
                )}
                <div className="rep-table-scroll" style={{ marginTop: 'var(--space-4)' }}>
                  <table className="data-table">
                    <thead><tr><th>Shared value</th><th>Amount</th><th>Derivation</th></tr></thead>
                    <tbody>
                      <tr><td>Total building value</td><td>{currency(totals.buildingValue)}</td><td className="rep-muted">Sum of building rows</td></tr>
                      <tr><td>Total contents value</td><td>{currency(totals.contentsValue)}</td><td className="rep-muted">Sum of building rows</td></tr>
                      <tr><td>Total business interruption value</td><td>{currency(totals.businessInterruptionValue)}</td><td className="rep-muted">Sum of building rows</td></tr>
                      <tr><td><strong>Total insurable value</strong></td><td><strong>{currency(totalInsurableValue)}</strong></td><td className="rep-muted">Building + contents + business interruption</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
                  No normal loss expectancy or probable maximum loss is calculated here. Selecting engineering assumptions
                  remains a human judgment.
                </p>
              </>
            ) : section.id === 'sec-questions' ? (
              requestQuestions.length === 0 ? <EmptyState title="No request-specific questions on this package" /> : (
                <div className="form-grid">
                  {requestQuestions.map(question => (
                    <Field
                      key={question.id}
                      span={2}
                      label={`${question.text} (${question.id})`}
                      type={question.type === 'longText' ? 'textarea' : 'text'}
                      required={question.required}
                      readOnly={!editable || question.respondent !== 'Engineer'}
                      value={question.respondent === 'Engineer' ? (survey.answers.loadingAreaChanges ?? survey.answers[question.id] ?? '') : (survey.answers.shiftPattern ?? '')}
                      onChange={value => setAnswer(question.respondent === 'Engineer' ? 'loadingAreaChanges' : 'shiftPattern', value)}
                      hint={`Intended respondent ${question.respondent} · audience ${question.audience}${question.respondent !== 'Engineer' ? ' — collected through a targeted information request, not edited here.' : ''}`}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="form-grid">
                {section.fields.map(field => {
                  const value = survey.answers[field.id] ?? '';
                  const readOnly = !editable || field.respondent === 'Customer';
                  return (
                    <div key={field.id} style={{ display: 'contents' }}>
                      {field.type === 'yesno' ? (
                        <Field
                          label={field.label}
                          required={field.required}
                          readOnly={readOnly}
                          value={value}
                          onChange={next => setAnswer(field.id, next)}
                          options={['Yes', 'No']}
                          hint={'A "No" answer is a recorded answer, not a blank. It stays visible in the output.'}
                        />
                      ) : (
                        <Field
                          label={field.label}
                          required={field.required}
                          readOnly={readOnly}
                          value={value}
                          type={field.type === 'textarea' ? 'textarea' : 'text'}
                          options={field.options}
                          span={field.type === 'textarea' ? 2 : 1}
                          onChange={next => setAnswer(field.id, next)}
                          hint={field.respondent === 'Customer' ? 'Customer-respondent question; collected through collaboration.' : undefined}
                        />
                      )}
                      {field.commentField && value === field.commentRequiredWhen && (
                        <Field
                          span={2}
                          label={`${field.label} — required comment`}
                          required
                          readOnly={readOnly}
                          type="textarea"
                          value={survey.answers[field.commentField] ?? ''}
                          onChange={next => setAnswer(field.commentField, next)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </InfoCard>

          {showPreview && (
            <InfoCard title="Synchronized output preview">
              <div className="rep-preview">
                <h4>{template?.name} — internal output extract</h4>
                <p><strong>Site:</strong> {siteName(survey.siteId)} · <strong>Occupancy:</strong> {survey.answers.occupancyDescription || <span className="rep-preview__omitted">not answered</span>}</p>
                <p>
                  <strong>Fire pump:</strong> {survey.answers.firePump || <span className="rep-preview__omitted">blank</span>}
                  {survey.answers.firePump === 'No' && survey.answers.firePumpComment && ` — ${survey.answers.firePumpComment}`}
                </p>
                <p className="rep-preview__rule">
                  Output rule: a fire-pump answer of <strong>No</strong> is printed with its comment. A blank answer is
                  omitted from the output. No and blank are not the same value.
                </p>
                <p><strong>Sprinkler coverage:</strong> {survey.answers.sprinklerCoverage || <span className="rep-preview__omitted">blank</span>}</p>
                <p><strong>Total insurable value:</strong> {currency(totalInsurableValue)} across {survey.buildings.length} building rows.</p>
                <p className="rep-preview__rule">
                  This is a layout illustration only. The approved property form and its calculation fixtures have not been
                  supplied, so wording, field fidelity and rules remain an open decision.
                </p>
              </div>
            </InfoCard>
          )}
        </div>
      </div>

      <ExternalRiskDataPanel siteId={survey.siteId} variant="survey" />

      <InfoCard title="Revision history">
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Revision</th><th>State</th><th>Saved</th><th>By</th><th>Note</th></tr></thead>
            <tbody>
              {survey.revisions.map(revision => (
                <tr key={`${revision.revision}-${revision.savedAt}`}>
                  <td>{revision.revision}</td>
                  <td><Badge status={revision.state} /></td>
                  <td>{revision.savedAt?.replace('T', ' ').slice(0, 16)}</td>
                  <td>{userName(revision.by)}</td>
                  <td className="rep-muted">{revision.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn" style={{ marginTop: 'var(--space-3)' }} onClick={() => navigate('P12', { requestId: survey.requestId })}>
          Open evidence for this request
        </button>
      </InfoCard>

      <Disclosure label="Concurrency, drafts and judgment (F05)">
        <ul className="rep-bullet-list">
          <li>Unsaved and saved status is always visible. Autosave never silently merges competing edits.</li>
          <li>A conflict in the engine offers reload or compare and explicit reapplication against the new row version.</li>
          <li>Submitted revisions are immutable; a returned revision produces a new editable one.</li>
          <li>Adding or removing buildings preserves the stable identity of the remaining rows.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter
        openDecisions={['Actual approved property form and calculation fixtures']}
        sources={['F05 — Survey workspace', 'P10 /surveys/:surveyId']}
      />
    </div>
  );
}
