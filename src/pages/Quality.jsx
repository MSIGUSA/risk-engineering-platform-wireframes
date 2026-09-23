import { useState } from 'react';
import { useRep, useRepDispatch, useNavigate } from '../state/repHooks';
import {
  PageHeader, Badge, InfoCard, DefinitionList, EmptyState, SyntheticFooter, Disclosure, Crumb, Field, Metric,
} from '../components/primitives';
import { ORGANIZATIONS, userName } from '../data/repository';
import { PERMISSIONS } from '../config/repConfig';

function subjectLabel(review) {
  if (review.subjectType === 'Vendor') return ORGANIZATIONS.find(org => org.id === review.subjectId)?.name ?? review.subjectId;
  return userName(review.subjectId);
}

/* ------------------------------------------------------------------ *
 * P25 — Quality Reviews
 * ------------------------------------------------------------------ */

export function QualityReviews() {
  const { qualityReviews } = useRep();
  const navigate = useNavigate();
  const [subjectType, setSubjectType] = useState('');

  const filtered = qualityReviews.filter(review => !subjectType || review.subjectType === subjectType);

  return (
    <div>
      <PageHeader
        pageId="P25"
        subtitle="Restricted periodic employee and vendor reviews with their sampling list. This is separate from manager approval of an individual survey."
      />

      <div className="rep-kpi-row">
        <Metric label="Employee reviews" value={qualityReviews.filter(review => review.subjectType === 'Employee').length} detail="Monthly cadence" />
        <Metric label="Vendor reviews" value={qualityReviews.filter(review => review.subjectType === 'Vendor').length} detail="Quarterly cadence" />
        <Metric label="In progress" value={qualityReviews.filter(review => review.status === 'InProgress').length} tone="review" />
        <Metric label="Complete" value={qualityReviews.filter(review => review.status === 'Complete').length} tone="complete" />
      </div>

      <div className="rep-chip-row">
        <button className={`rep-chip${subjectType === '' ? ' active' : ''}`} onClick={() => setSubjectType('')}>All subjects</button>
        <button className={`rep-chip${subjectType === 'Employee' ? ' active' : ''}`} onClick={() => setSubjectType('Employee')}>Employee</button>
        <button className={`rep-chip${subjectType === 'Vendor' ? ' active' : ''}`} onClick={() => setSubjectType('Vendor')}>Vendor</button>
      </div>

      {filtered.length === 0 ? <EmptyState title="No reviews match this filter" /> : (
        <div className="rep-table-scroll">
          <table className="data-table">
            <thead><tr><th>Review</th><th>Subject type</th><th>Subject</th><th>Period</th><th>Cadence</th><th>Reviewer</th><th>Samples</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(review => (
                <tr key={review.id}>
                  <td><button className="table-link" onClick={() => navigate('P26', { reviewId: review.id })}>{review.id}</button></td>
                  <td>{review.subjectType}</td>
                  <td>{subjectLabel(review)}</td>
                  <td>{review.period}</td>
                  <td>{review.cadence}</td>
                  <td>{userName(review.reviewerId)}</td>
                  <td>{review.samples.length}</td>
                  <td><Badge status={review.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Disclosure label="Quality review boundary (F16)">
        <ul className="rep-bullet-list">
          <li>Employee and vendor cadences remain distinguishable rather than merged into one list.</li>
          <li>These are restricted management records: no customer, vendor self-review or general employee access.</li>
          <li>Recording a review requires the manager role; reading a team summary is a separate permission.</li>
        </ul>
      </Disclosure>

      <SyntheticFooter sources={['F16 — Quality reviews', 'P25 /quality-reviews']} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * P26 — Quality Review Detail
 * ------------------------------------------------------------------ */

export function QualityReviewDetail({ reviewId }) {
  const { qualityReviews, can } = useRep();
  const dispatch = useRepDispatch();
  const navigate = useNavigate();
  const [dimension, setDimension] = useState('Traceability');
  const [finding, setFinding] = useState('');

  const review = qualityReviews.find(item => item.id === reviewId);
  if (!review) return <EmptyState title="Review not found in this scope" />;

  const canManage = can(PERMISSIONS.qualityReviewManage);

  return (
    <div>
      <PageHeader
        pageId="P26"
        params={{ reviewId }}
        title={`${review.id} — ${subjectLabel(review)}`}
        subtitle={`${review.subjectType} review for ${review.period}, ${review.cadence.toLowerCase()} cadence.`}
        breadcrumb={<><Crumb pageId="P25">Quality reviews</Crumb><span>/</span><span>{review.id}</span></>}
      />

      <div className="rep-grid rep-grid--two">
        <InfoCard title="Version-pinned rubric">
          <DefinitionList items={[
            { label: 'Rubric', value: `${review.rubricId} v${review.rubricVersion}` },
            { label: 'Rubric status', value: review.rubricStatus },
            { label: 'Reviewer', value: userName(review.reviewerId) },
            { label: 'Status', value: <Badge status={review.status} /> },
            { label: 'Completed', value: review.completedAt ?? 'Not complete' },
          ]} />
          <p className="rep-muted" style={{ marginTop: 'var(--space-3)' }}>
            The rubric is pinned to the review, so a later rubric revision does not retroactively change a recorded
            assessment. The rubric content itself still requires business approval.
          </p>
        </InfoCard>

        <InfoCard title="Sampled work">
          {review.samples.length === 0 ? <EmptyState title="No sampled work" /> : (
            <div className="rep-table-scroll">
              <table className="data-table">
                <thead><tr><th>Sample</th><th>Survey</th><th>Request</th><th>Note</th></tr></thead>
                <tbody>
                  {review.samples.map(sample => (
                    <tr key={sample.id}>
                      <td><code className="rep-code">{sample.id}</code></td>
                      <td><button className="table-link" onClick={() => navigate('P10', { surveyId: sample.surveyId })}>{sample.surveyId}</button></td>
                      <td><button className="table-link" onClick={() => navigate('P06', { requestId: sample.requestId })}>{sample.requestId}</button></td>
                      <td className="rep-muted">{sample.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </InfoCard>
      </div>

      <InfoCard title="Observations">
        {review.observations.length === 0 ? <EmptyState title="No observations recorded" /> : (
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Dimension</th><th>Finding</th><th>Rating</th></tr></thead>
              <tbody>
                {review.observations.map((observation, index) => (
                  <tr key={index}>
                    <td>{observation.dimension}</td>
                    <td>{observation.finding}</td>
                    <td className="rep-muted">{observation.rating ?? 'Rating scale not approved'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {canManage && review.status !== 'Complete' && (
          <div className="form-grid" style={{ marginTop: 'var(--space-3)' }}>
            <Field label="Dimension" value={dimension} onChange={setDimension} options={['Traceability', 'Timeliness', 'Scope discipline', 'Evidence quality', 'Wording governance']} />
            <Field label="Finding" span={2} type="textarea" value={finding} onChange={setFinding} />
            <div className="form-field" style={{ justifyContent: 'flex-end' }}>
              <button className="btn" disabled={!finding.trim()} onClick={() => { dispatch({ type: 'ADD_QUALITY_OBSERVATION', payload: { reviewId, dimension, finding } }); setFinding(''); }}>
                Record observation
              </button>
            </div>
          </div>
        )}
      </InfoCard>

      <InfoCard title="Improvement actions">
        {review.actions.length === 0 ? <EmptyState title="No improvement actions" /> : (
          <div className="rep-table-scroll">
            <table className="data-table">
              <thead><tr><th>Action</th><th>Description</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                {review.actions.map(action => (
                  <tr key={action.id}>
                    <td><code className="rep-code">{action.id}</code></td>
                    <td>{action.description}</td>
                    <td>{userName(action.ownerId)}</td>
                    <td>{action.dueDate}</td>
                    <td><Badge status={action.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </InfoCard>

      {canManage ? (
        <InfoCard title="Completion">
          <button className="btn btn--primary" disabled={review.status === 'Complete'} onClick={() => dispatch({ type: 'COMPLETE_QUALITY_REVIEW', payload: { reviewId } })}>
            {review.status === 'Complete' ? 'Review complete' : 'Complete review'}
          </button>
        </InfoCard>
      ) : (
        <div className="rep-denial rep-denial--compact">
          <div className="rep-denial__title">Read-only</div>
          <p>Recording a review requires <code>QualityReview.Manage</code>. Team read access does not include recording.</p>
        </div>
      )}

      <SyntheticFooter
        openDecisions={['Approved rubric content and rating scale']}
        sources={['F16 — Quality reviews', 'P26 /quality-reviews/:reviewId']}
      />
    </div>
  );
}
