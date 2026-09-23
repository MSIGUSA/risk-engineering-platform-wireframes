import { useState } from 'react';
import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';
import {
  PageHeader, Badge, InfoCard, DefinitionList, EmptyState, SyntheticFooter, Disclosure, Crumb,
} from '../components/primitives';
import { accountName, siteName, userName, TEMPLATES } from '../data/repository';

/* P11 — Historical Copy (/requests/:requestId/copy) */
export function HistoricalCopy({ requestId }) {
  const { requests, surveys, recommendations, authenticatedUser } = useRep();
  const dispatch = useRepDispatch();
  const navigate = useNavigate();
  const [sourceId, setSourceId] = useState(null);

  const request = requests.find(item => item.id === requestId);
  if (!request) return <EmptyState title="Request not found in this scope" />;

  /* Only one authorized historical package may be chosen; fragments from different years
     are never combined. */
  const candidates = Object.values(surveys).filter(survey => {
    if (survey.requestId === requestId) return false;
    if (!['Locked', 'Released', 'Approved'].includes(survey.state)) return false;
    const sourceRequest = requests.find(item => item.id === survey.requestId);
    if (!sourceRequest) return false;
    if (!authenticatedUser.accountScope.includes(sourceRequest.accountId)) return false;
    return sourceRequest.accountId === request.accountId;
  });

  const source = candidates.find(survey => survey.id === sourceId) ?? null;
  const sourceRequest = source ? requests.find(item => item.id === source.requestId) : null;
  const sourceRecommendations = source ? recommendations.filter(rec => rec.surveyLinks.includes(source.id)) : [];

  const mappingExceptions = source
    ? [
      source.templateVersion !== 3 && {
        field: 'Template version',
        detail: `Source used v${source.templateVersion}; the current pinned version is v3. Fields added after v${source.templateVersion} start blank.`,
      },
      { field: 'Approval state', detail: 'Approval is not inherited. The new work starts unapproved.' },
      { field: 'Evidence audience', detail: 'Copied evidence references keep their original audience; copying never widens it.' },
    ].filter(Boolean)
    : [];

  return (
    <div>
      <PageHeader
        pageId="P11"
        params={{ requestId }}
        subtitle="Choose one authorized historical package, preview the source and its recommendations, review mapping exceptions, and create new unapproved editable work."
        breadcrumb={<>
          <Crumb pageId="P06" params={{ requestId }}>{requestId}</Crumb><span>/</span><span>copy</span>
        </>}
      />

      <InfoCard title="Authorized historical packages">
        {candidates.length === 0 ? (
          <EmptyState title="No authorized historical package for this account" detail="Both the source and the destination must be authorized. No records is distinct from access denied." />
        ) : (
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Select</th><th>Survey</th><th>Request</th><th>Site</th><th>Template version</th><th>Revision</th><th>State</th></tr></thead>
              <tbody>
                {candidates.map(survey => (
                  <tr key={survey.id} className={survey.id === sourceId ? 'data-table__row--active' : ''}>
                    <td><input type="radio" name="source" checked={sourceId === survey.id} onChange={() => setSourceId(survey.id)} aria-label={`Select ${survey.id}`} /></td>
                    <td>{survey.id}</td>
                    <td>{survey.requestId}</td>
                    <td>{siteName(survey.siteId)}</td>
                    <td>v{survey.templateVersion}</td>
                    <td>{survey.currentRevision}</td>
                    <td><Badge status={survey.state} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </InfoCard>

      {source && (
        <div className="rep-compare">
          <div className="rep-compare__col">
            <div className="rep-compare__title">Source — unchanged</div>
            <DefinitionList items={[
              { label: 'Survey', value: source.id },
              { label: 'Request', value: `${source.requestId} (${sourceRequest?.requestedDate})` },
              { label: 'Account', value: accountName(sourceRequest?.accountId) },
              { label: 'Site', value: siteName(source.siteId) },
              { label: 'Template', value: `${TEMPLATES.find(item => item.id === source.templateId)?.name} v${source.templateVersion}` },
              { label: 'Locked revision', value: source.currentRevision },
              { label: 'Respondent', value: userName(source.respondentId) },
            ]} />
            <div className="form-section__title" style={{ marginTop: 'var(--space-3)' }}>Answers that would be copied</div>
            <ul className="rep-bullet-list">
              {Object.entries(source.answers).filter(([, value]) => value).map(([key, value]) => (
                <li key={key}><strong>{key}:</strong> {String(value)}</li>
              ))}
            </ul>
            <div className="form-section__title" style={{ marginTop: 'var(--space-3)' }}>Recommendations</div>
            {sourceRecommendations.length === 0 ? <p className="rep-muted">None linked.</p> : (
              <ul className="rep-bullet-list">
                {sourceRecommendations.map(rec => (
                  <li key={rec.id}><code className="rep-code">{rec.id}</code> — {rec.title} <Badge status={rec.status} /></li>
                ))}
              </ul>
            )}
          </div>
          <div className="rep-compare__col">
            <div className="rep-compare__title">Destination — new unapproved work</div>
            <DefinitionList items={[
              { label: 'Destination request', value: request.id },
              { label: 'Destination survey', value: request.surveyId ?? 'Created on copy' },
              { label: 'Mode', value: 'Whole chosen survey' },
              { label: 'Approval', value: 'Reset — not inherited' },
              { label: 'Recommendation identity', value: 'Preserved across the copy' },
              { label: 'Lineage', value: `Source ${source.id} revision ${source.currentRevision}` },
            ]} />
            <div className="form-section__title" style={{ marginTop: 'var(--space-3)' }}>Mapping exceptions</div>
            <ul className="rep-bullet-list">
              {mappingExceptions.map(exception => (
                <li key={exception.field}><strong>{exception.field}:</strong> {exception.detail}</li>
              ))}
            </ul>
            <button
              className="btn btn--primary"
              style={{ marginTop: 'var(--space-3)' }}
              disabled={Boolean(request.surveyId)}
              onClick={() => {
                dispatch({ type: 'COPY_FORWARD', payload: { sourceSurveyId: source.id, requestId } });
                navigate('P06', { requestId });
              }}
            >
              {request.surveyId ? 'A survey instance already exists on this request' : 'Create new editable work from this source'}
            </button>
          </div>
        </div>
      )}

      <Disclosure label="Carry-forward safeguards (F18)">
        <ul className="rep-bullet-list">
          <li>The original artifact is unchanged: copying reads the locked source and writes a new destination.</li>
          <li>A new identifier and the source lineage are both recorded on the destination.</li>
          <li>Recommendation identifiers are preserved so continuity survives the copy; approval is reset.</li>
          <li>Fragments from different years are never combined into one package.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F18 — Historical carry-forward', 'P11 /requests/:requestId/copy']} />
    </div>
  );
}
