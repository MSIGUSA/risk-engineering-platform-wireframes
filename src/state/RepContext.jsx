import { useMemo, useReducer } from 'react';
import { createInitialState, USERS, TODAY } from '../data/repository';
import { DEFAULT_PAGE_BY_ROLE, PAGES, roleHas, PERMISSIONS } from '../config/repConfig';
import { RepStateContext, RepDispatchContext } from './repContexts';

const DEFAULT_USER = 'u-dana';

function initialState() {
  return {
    ...createInitialState(),
    authenticatedUserId: DEFAULT_USER,
    organizationContextId: 'ORG-MSIG-RE',
    page: { id: DEFAULT_PAGE_BY_ROLE.engineer, params: {} },
    history: [],
    savedViewId: null,
    workScope: 'personal',
    leftNavOpen: true,
    sidebarOpen: true,
    sidebarTab: 'account',
    surveyDirty: false,
    notices: [],
  };
}

let auditSequence = 1000;

function audit(state, { actorId, operation, resource, outcome, summary, consumer = 'REP', organizationId = 'ORG-HARBOR' }) {
  auditSequence += 1;
  return [
    {
      id: `AUD-${auditSequence}`,
      at: new Date().toISOString(),
      actorId,
      consumer,
      organizationId,
      operation,
      resource,
      outcome,
      correlationId: `CORR-${resource}`,
      summary,
      simulated: true,
    },
    ...state.auditEvents,
  ];
}

function notice(state, text, tone = 'info') {
  return [{ id: `N-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`, text, tone }, ...state.notices].slice(0, 4);
}

function replace(list, predicate, updater) {
  return list.map(item => (predicate(item) ? updater(item) : item));
}

function repReducer(state, action) {
  const actor = state.authenticatedUserId;

  switch (action.type) {
    case 'RESET_DEMO':
      return initialState();

    case 'SET_USER': {
      const nextUser = USERS.find(user => user.id === action.payload);
      if (!nextUser) return state;
      return {
        ...state,
        authenticatedUserId: nextUser.id,
        organizationContextId: nextUser.organizationId,
        page: { id: DEFAULT_PAGE_BY_ROLE[nextUser.role] ?? 'P01', params: {} },
        history: [],
        savedViewId: null,
        surveyDirty: false,
        notices: [],
      };
    }

    case 'NAVIGATE': {
      const target = PAGES[action.payload.id];
      if (!target) return state;
      return {
        ...state,
        page: { id: action.payload.id, params: action.payload.params ?? {} },
        history: [...state.history, state.page].slice(-20),
      };
    }

    case 'BACK': {
      if (!state.history.length) return state;
      const previous = state.history[state.history.length - 1];
      return { ...state, page: previous, history: state.history.slice(0, -1) };
    }

    case 'SET_SAVED_VIEW':
      return { ...state, savedViewId: action.payload };

    case 'SET_WORK_SCOPE':
      return { ...state, workScope: action.payload };

    case 'TOGGLE_LEFT_NAV':
      return { ...state, leftNavOpen: !state.leftNavOpen };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_SIDEBAR_TAB':
      return { ...state, sidebarTab: action.payload };

    /* --------------------------- surveys --------------------------- */

    case 'UPDATE_SURVEY_ANSWER': {
      const { surveyId, field, value } = action.payload;
      const survey = state.surveys[surveyId];
      if (!survey) return state;
      return {
        ...state,
        surveyDirty: true,
        surveys: {
          ...state.surveys,
          [surveyId]: { ...survey, answers: { ...survey.answers, [field]: value }, saveState: 'Unsaved' },
        },
      };
    }

    case 'UPDATE_BUILDING': {
      const { surveyId, buildingId, field, value } = action.payload;
      const survey = state.surveys[surveyId];
      if (!survey) return state;
      return {
        ...state,
        surveyDirty: true,
        surveys: {
          ...state.surveys,
          [surveyId]: {
            ...survey,
            saveState: 'Unsaved',
            buildings: replace(survey.buildings, building => building.id === buildingId, building => ({
              ...building,
              [field]: field === 'name' ? value : Number(value) || 0,
            })),
          },
        },
      };
    }

    case 'ADD_BUILDING': {
      const { surveyId } = action.payload;
      const survey = state.surveys[surveyId];
      if (!survey) return state;
      const nextIndex = survey.buildings.length + 1;
      return {
        ...state,
        surveyDirty: true,
        surveys: {
          ...state.surveys,
          [surveyId]: {
            ...survey,
            saveState: 'Unsaved',
            buildings: [
              ...survey.buildings,
              { id: `BLDG-${nextIndex}-${Math.random().toString(16).slice(2, 6)}`, name: `Building ${nextIndex}`, buildingValue: 0, contentsValue: 0, businessInterruptionValue: 0 },
            ],
          },
        },
      };
    }

    case 'REMOVE_BUILDING': {
      const { surveyId, buildingId } = action.payload;
      const survey = state.surveys[surveyId];
      if (!survey) return state;
      return {
        ...state,
        surveyDirty: true,
        surveys: {
          ...state.surveys,
          [surveyId]: { ...survey, saveState: 'Unsaved', buildings: survey.buildings.filter(building => building.id !== buildingId) },
        },
      };
    }

    case 'SAVE_SURVEY_DRAFT': {
      const { surveyId } = action.payload;
      const survey = state.surveys[surveyId];
      if (!survey) return state;
      const nextRevision = survey.currentRevision + 1;
      return {
        ...state,
        surveyDirty: false,
        surveys: {
          ...state.surveys,
          [surveyId]: {
            ...survey,
            saveState: 'Saved',
            state: survey.state === 'NotStarted' ? 'InProgress' : survey.state,
            currentRevision: nextRevision,
            lastSavedAt: new Date().toISOString(),
            revisions: [{ revision: nextRevision, state: 'Draft', savedAt: new Date().toISOString(), by: actor, note: 'Draft saved in this session' }, ...survey.revisions],
          },
        },
        requests: replace(state.requests, request => request.id === survey.requestId && request.state === 'Assigned', request => ({ ...request, state: 'InProgress' })),
        auditEvents: audit(state, { actorId: actor, operation: 'Survey.SaveDraft', resource: surveyId, outcome: 'Allowed', summary: 'Draft saved (in-memory only)' }),
        notices: notice(state, `Draft saved for ${surveyId}. Simulation only — nothing is persisted.`, 'success'),
      };
    }

    case 'SUBMIT_SURVEY': {
      const { surveyId } = action.payload;
      const survey = state.surveys[surveyId];
      if (!survey) return state;
      const nextRevision = survey.currentRevision + 1;
      return {
        ...state,
        surveyDirty: false,
        surveys: {
          ...state.surveys,
          [surveyId]: {
            ...survey,
            state: 'Submitted',
            saveState: 'Submitted',
            submitted: true,
            currentRevision: nextRevision,
            lastSavedAt: new Date().toISOString(),
            revisions: [{ revision: nextRevision, state: 'Submitted', savedAt: new Date().toISOString(), by: actor, note: 'Submitted revision (immutable)' }, ...survey.revisions],
          },
        },
        requests: replace(state.requests, request => request.id === survey.requestId, request => ({ ...request, state: 'InReview' })),
        auditEvents: audit(state, { actorId: actor, operation: 'Response.Submit', resource: `${surveyId} revision ${nextRevision}`, outcome: 'Allowed', summary: 'Revision submitted for review' }),
        notices: notice(state, `${surveyId} revision ${nextRevision} submitted. The revision is immutable; further edits create a new revision.`, 'success'),
      };
    }

    /* --------------------------- requests --------------------------- */

    case 'CREATE_REQUEST': {
      const draft = action.payload;
      const id = `REQ-${1050 + state.requests.filter(request => request.id.startsWith('REQ-10')).length}`;
      const request = {
        id,
        accountId: draft.accountId,
        siteIds: draft.siteIds,
        customerOrganizationId: draft.customerOrganizationId,
        origin: draft.origin,
        requesterId: actor,
        serviceType: draft.serviceType,
        priority: draft.priority,
        purpose: draft.purpose,
        background: draft.background,
        state: draft.submit ? 'Submitted' : 'Draft',
        requestedDate: draft.requestedDate,
        committedDate: null,
        createdAt: TODAY,
        assigneeId: draft.selfAssign ? actor : null,
        accountableOwnerId: null,
        packageRevision: 1,
        surveyId: null,
        visitId: null,
        rowVersion: '0x0000000000018000',
      };
      return {
        ...state,
        requests: [request, ...state.requests],
        packageRevisions: {
          ...state.packageRevisions,
          [id]: [{
            revision: 1,
            state: draft.submit ? 'Pinned' : 'Draft',
            createdAt: TODAY,
            createdBy: actor,
            reason: 'Created in this wireframe session',
            hash: draft.submit ? 'sim-hash' : '—',
            components: draft.components,
            additionalQuestions: draft.additionalQuestions,
          }],
        },
        page: { id: 'P06', params: { requestId: id } },
        history: [...state.history, state.page],
        auditEvents: audit(state, { actorId: actor, operation: draft.submit ? 'RiskRequest.Submit' : 'RiskRequest.CreateDraft', resource: id, outcome: 'Allowed', summary: 'Request composed in the wireframe' }),
        notices: notice(state, `${id} created with stable component identifiers. Requested date ${draft.requestedDate}; committed date is set at triage.`, 'success'),
      };
    }

    case 'TRIAGE_REQUEST': {
      const { requestId, disposition, assigneeId, accountableOwnerId, committedDate } = action.payload;
      return {
        ...state,
        requests: replace(state.requests, request => request.id === requestId, request => ({
          ...request,
          state: disposition === 'Accept' ? (assigneeId ? 'Assigned' : 'Triaged') : 'Cancelled',
          assigneeId: assigneeId ?? request.assigneeId,
          accountableOwnerId: accountableOwnerId ?? request.accountableOwnerId,
          committedDate: committedDate || request.committedDate,
        })),
        auditEvents: audit(state, { actorId: actor, operation: 'RiskRequest.Triage', resource: requestId, outcome: disposition === 'Accept' ? 'Allowed' : 'Cancelled', summary: `Triage disposition ${disposition}` }),
        notices: notice(state, `${requestId} triaged. Requested and committed dates remain separately recorded.`, 'success'),
      };
    }

    case 'ASSIGN_REQUEST': {
      const { requestId, assigneeId, reason } = action.payload;
      return {
        ...state,
        requests: replace(state.requests, request => request.id === requestId, request => ({ ...request, assigneeId, state: request.state === 'Submitted' || request.state === 'Triaged' ? 'Assigned' : request.state })),
        auditEvents: audit(state, { actorId: actor, operation: 'Work.Assign', resource: requestId, outcome: 'Allowed', summary: reason || 'Assignment recorded' }),
        notices: notice(state, `${requestId} assigned. Lifecycle and assignment history updated.`, 'success'),
      };
    }

    /* --------------------------- work --------------------------- */

    case 'SET_TASK_STATUS':
      return {
        ...state,
        tasks: replace(state.tasks, task => task.id === action.payload.taskId, task => ({ ...task, status: action.payload.status })),
        notices: notice(state, `Task ${action.payload.taskId} moved to ${action.payload.status}.`, 'success'),
      };

    case 'SCHEDULE_VISIT': {
      const { visitId, start, end, status } = action.payload;
      return {
        ...state,
        visits: replace(state.visits, visit => visit.id === visitId, visit => ({ ...visit, start, end, status: status ?? visit.status })),
        auditEvents: audit(state, { actorId: actor, operation: 'Visit.Reschedule', resource: visitId, outcome: 'Allowed', summary: 'Visit window changed' }),
        notices: notice(state, `${visitId} rescheduled. Scheduled dates and due dates remain distinct.`, 'success'),
      };
    }

    case 'CREATE_VISIT': {
      const { requestId, siteId, start, end, timeZone, engineerId } = action.payload;
      const id = `VISIT-${String(state.visits.length + 10).padStart(2, '0')}`;
      return {
        ...state,
        visits: [...state.visits, { id, requestId, siteId, start, end, timeZone, status: 'Scheduled', engineerId, participants: [] }],
        requests: replace(state.requests, request => request.id === requestId, request => ({ ...request, visitId: id })),
        auditEvents: audit(state, { actorId: actor, operation: 'Visit.Schedule', resource: id, outcome: 'Allowed', summary: 'Visit scheduled' }),
        notices: notice(state, `${id} scheduled for ${start} (${timeZone}).`, 'success'),
      };
    }

    /* --------------------------- recommendations --------------------------- */

    case 'SET_RECOMMENDATION_STATUS': {
      const { recommendationId, status, detail } = action.payload;
      return {
        ...state,
        recommendations: replace(state.recommendations, rec => rec.id === recommendationId, rec => ({
          ...rec,
          status,
          completedAt: status === 'Completed' ? TODAY : rec.completedAt,
          complianceEvents: [...rec.complianceEvents, { at: TODAY, actor, actorAudience: 'Internal', type: 'StaffVerification', detail: detail || `Status set to ${status}` }],
        })),
        auditEvents: audit(state, { actorId: actor, operation: 'Recommendation.UpdateStatus', resource: recommendationId, outcome: 'Allowed', summary: `Compliance status set to ${status}` }),
        notices: notice(state, `${recommendationId} set to ${status}. Issued wording is unchanged; history is retained.`, 'success'),
      };
    }

    case 'ADD_RECOMMENDATION_RESPONSE': {
      const { recommendationId, detail } = action.payload;
      return {
        ...state,
        recommendations: replace(state.recommendations, rec => rec.id === recommendationId, rec => ({
          ...rec,
          complianceEvents: [...rec.complianceEvents, { at: TODAY, actor, actorAudience: 'Customer', type: 'CustomerResponse', detail }],
        })),
        auditEvents: audit(state, { actorId: actor, operation: 'Recommendation.Respond', resource: recommendationId, outcome: 'Allowed', consumer: 'ClaimsConnect', summary: 'Customer response recorded; staff closure still required' }),
        notices: notice(state, 'Response recorded. Staff validation is required before closure.', 'success'),
      };
    }

    /* --------------------------- review and release --------------------------- */

    case 'REVIEW_DECISION': {
      const { requestId, responseRevision, decision, reason } = action.payload;
      const request = state.requests.find(item => item.id === requestId);
      const surveyId = request?.surveyId;
      const survey = surveyId ? state.surveys[surveyId] : null;
      const nextSurveys = survey
        ? {
            ...state.surveys,
            [surveyId]: decision === 'Returned'
              ? { ...survey, state: 'Returned', saveState: 'Draft', submitted: false, currentRevision: survey.currentRevision + 1, revisions: [{ revision: survey.currentRevision + 1, state: 'Returned', savedAt: new Date().toISOString(), by: actor, note: `Returned: ${reason}` }, ...survey.revisions] }
              : { ...survey, state: 'Approved' },
          }
        : state.surveys;

      return {
        ...state,
        surveys: nextSurveys,
        requests: replace(state.requests, item => item.id === requestId, item => ({ ...item, state: decision === 'Returned' ? 'InProgress' : 'Approved' })),
        reviewDecisions: [{ id: `REV-${state.reviewDecisions.length + 10}`, requestId, responseRevision, decision, reviewerId: actor, at: TODAY, reason }, ...state.reviewDecisions],
        auditEvents: audit(state, { actorId: actor, operation: 'Survey.Review', resource: `${requestId} revision ${responseRevision}`, outcome: decision, summary: reason }),
        notices: notice(state, decision === 'Returned'
          ? `Returned revision ${responseRevision} with a recorded reason. A new editable revision was created.`
          : `Revision ${responseRevision} approved. Release is a separate action.`, 'success'),
      };
    }

    case 'PUBLISH_RELEASE': {
      const { releaseId, audience } = action.payload;
      return {
        ...state,
        releases: replace(state.releases, release => release.id === releaseId, release => ({
          ...release,
          status: 'Published',
          audience: audience ?? release.audience,
          publishedBy: actor,
          publishedAt: new Date().toISOString(),
          history: [...release.history, { at: new Date().toISOString(), actor, event: 'Published' }],
        })),
        requests: replace(state.requests, request => request.id === state.releases.find(release => release.id === releaseId)?.requestId, request => ({ ...request, state: 'Released' })),
        auditEvents: audit(state, { actorId: actor, operation: 'Release.Publish', resource: releaseId, outcome: 'Allowed', summary: `Immutable snapshot published to ${audience}` }),
        notices: notice(state, `${releaseId} published. The snapshot records audience, actor and the exact response revision.`, 'success'),
      };
    }

    case 'WITHDRAW_RELEASE': {
      const { releaseId, reason } = action.payload;
      return {
        ...state,
        releases: replace(state.releases, release => release.id === releaseId, release => ({
          ...release,
          status: 'Withdrawn',
          history: [...release.history, { at: new Date().toISOString(), actor, event: `Withdrawn: ${reason}` }],
        })),
        auditEvents: audit(state, { actorId: actor, operation: 'Release.Withdraw', resource: releaseId, outcome: 'Allowed', summary: reason }),
        notices: notice(state, `${releaseId} withdrawn. Release history is retained.`, 'warning'),
      };
    }

    case 'SEND_DISTRIBUTION': {
      const { distributionId } = action.payload;
      return {
        ...state,
        distributions: replace(state.distributions, item => item.id === distributionId, item => ({
          ...item,
          status: 'Sent',
          approvedBy: actor,
          sentAt: new Date().toISOString(),
        })),
        auditEvents: audit(state, { actorId: actor, operation: 'Correspondence.Send', resource: distributionId, outcome: 'Simulated', summary: 'Simulated send; no transport is implemented' }),
        notices: notice(state, `${distributionId} recorded as sent (simulation only). The manifest preserves recipients and artifact versions.`, 'success'),
      };
    }

    /* --------------------------- collaboration --------------------------- */

    case 'POST_MESSAGE': {
      const { threadId, body } = action.payload;
      return {
        ...state,
        threads: replace(state.threads, thread => thread.id === threadId, thread => ({
          ...thread,
          messages: [...thread.messages, { id: `MSG-${Date.now()}`, authorId: actor, at: new Date().toISOString(), body }],
        })),
        notices: notice(state, 'Message posted to the selected audience only.', 'success'),
      };
    }

    case 'RESPOND_INFORMATION_REQUEST': {
      const { informationRequestId, answer } = action.payload;
      return {
        ...state,
        informationRequests: replace(state.informationRequests, item => item.id === informationRequestId, item => ({
          ...item,
          status: 'Responded',
          contributions: [...item.contributions, { id: `CONTRIB-${Date.now()}`, byId: actor, at: new Date().toISOString(), answer, evidenceId: null, staffReviewStatus: 'Pending' }],
        })),
        auditEvents: audit(state, { actorId: actor, operation: 'Contribution.Save', resource: informationRequestId, outcome: 'Allowed', consumer: 'ClaimsConnect', summary: 'Scoped contribution recorded' }),
        notices: notice(state, 'Contribution recorded against the targeted scope only.', 'success'),
      };
    }

    case 'REVIEW_CONTRIBUTION': {
      const { informationRequestId, contributionId, status } = action.payload;
      return {
        ...state,
        informationRequests: replace(state.informationRequests, item => item.id === informationRequestId, item => ({
          ...item,
          contributions: replace(item.contributions, contribution => contribution.id === contributionId, contribution => ({ ...contribution, staffReviewStatus: status })),
        })),
        notices: notice(state, `Contribution marked ${status} by staff.`, 'success'),
      };
    }

    /* --------------------------- evidence --------------------------- */

    case 'ADD_EVIDENCE_VERSION': {
      const { evidenceId, fileName, note } = action.payload;
      return {
        ...state,
        evidence: replace(state.evidence, item => item.id === evidenceId, item => ({
          ...item,
          fileName: fileName || item.fileName,
          versions: [
            { version: item.versions[0].version + 1, uploadedBy: actor, uploadedAt: new Date().toISOString(), scanStatus: 'Pending', sizeKb: 640, hash: '—', note: note || 'Replacement version awaiting scan' },
            ...item.versions,
          ],
        })),
        auditEvents: audit(state, { actorId: actor, operation: 'Evidence.UploadScoped', resource: evidenceId, outcome: 'Pending scan', summary: 'New version requires a new scan' }),
        notices: notice(state, 'New version recorded. Provenance is preserved and the version is blocked until the scan completes.', 'success'),
      };
    }

    case 'SET_SCAN_RESULT': {
      const { evidenceId, version, scanStatus } = action.payload;
      return {
        ...state,
        evidence: replace(state.evidence, item => item.id === evidenceId, item => ({
          ...item,
          versions: replace(item.versions, entry => entry.version === version, entry => ({ ...entry, scanStatus })),
        })),
        notices: notice(state, `Simulated scan result ${scanStatus} recorded for version ${version}.`, scanStatus === 'Clean' ? 'success' : 'warning'),
      };
    }

    /* --------------------------- carry forward --------------------------- */

    case 'COPY_FORWARD': {
      const { sourceSurveyId, requestId } = action.payload;
      const source = state.surveys[sourceSurveyId];
      if (!source) return state;
      const newSurveyId = `SUR-${requestId.replace('REQ-', '')}`;
      const request = state.requests.find(item => item.id === requestId);
      return {
        ...state,
        surveys: {
          ...state.surveys,
          [newSurveyId]: {
            id: newSurveyId,
            requestId,
            siteId: request?.siteIds?.[0] ?? source.siteId,
            templateId: source.templateId,
            templateVersion: source.templateVersion,
            packageRevision: 1,
            state: 'InProgress',
            respondentId: actor,
            audience: 'Internal',
            currentRevision: 1,
            saveState: 'Saved',
            lastSavedAt: new Date().toISOString(),
            submitted: false,
            copiedFrom: { surveyId: sourceSurveyId, revision: source.currentRevision },
            answers: { ...source.answers },
            buildings: source.buildings.map(building => ({ ...building })),
            revisions: [{ revision: 1, state: 'Draft', savedAt: new Date().toISOString(), by: actor, note: `Copied from ${sourceSurveyId} revision ${source.currentRevision}` }],
          },
        },
        requests: replace(state.requests, item => item.id === requestId, item => ({ ...item, surveyId: newSurveyId, state: 'InProgress' })),
        auditEvents: audit(state, { actorId: actor, operation: 'Survey.CopyPrior', resource: `${sourceSurveyId} -> ${newSurveyId}`, outcome: 'Allowed', summary: 'Carry-forward lineage recorded; approval reset' }),
        notices: notice(state, `Created ${newSurveyId} from ${sourceSurveyId}. The source is unchanged, lineage is recorded and approval is reset.`, 'success'),
      };
    }

    /* --------------------------- vendor --------------------------- */

    case 'VENDOR_HANDOFF': {
      const { contributionId } = action.payload;
      return {
        ...state,
        vendorContributions: replace(state.vendorContributions, item => item.id === contributionId, item => ({
          ...item,
          status: 'HandedOff',
          handoffAt: new Date().toISOString(),
          handoffBy: actor,
        })),
        auditEvents: audit(state, { actorId: actor, operation: 'VendorWork.Handoff', resource: contributionId, outcome: 'Allowed', summary: 'Internal owner recorded; vendor authorship retained' }),
        notices: notice(state, 'Handoff recorded. The vendor original and author are preserved; release authority stays internal.', 'success'),
      };
    }

    case 'VENDOR_SUBMIT': {
      const { contributionId } = action.payload;
      return {
        ...state,
        vendorContributions: replace(state.vendorContributions, item => item.id === contributionId, item => ({ ...item, status: 'Submitted', submittedAt: new Date().toISOString() })),
        auditEvents: audit(state, { actorId: actor, operation: 'VendorContribution.Submit', resource: contributionId, outcome: 'Allowed', consumer: 'VendorPortal', organizationId: 'ORG-MERIDIAN', summary: 'Vendor submission received' }),
        notices: notice(state, 'Submitted. This enables an internal handoff; it does not send anything to a customer.', 'success'),
      };
    }

    /* --------------------------- time --------------------------- */

    case 'ADD_TIME_ENTRY': {
      const entry = { id: `TIME-${Date.now()}`, principalId: actor, ...action.payload };
      return {
        ...state,
        timeEntries: [entry, ...state.timeEntries],
        notices: notice(state, `Recorded ${entry.durationMinutes} minutes of ${entry.activity}${entry.requestId ? ` on ${entry.requestId}` : ' without a survey reference'}.`, 'success'),
      };
    }

    case 'DELETE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.filter(entry => entry.id !== action.payload.entryId),
        notices: notice(state, 'Entry corrected (removed).', 'success'),
      };

    /* --------------------------- quality --------------------------- */

    case 'ADD_QUALITY_OBSERVATION':
      return {
        ...state,
        qualityReviews: replace(state.qualityReviews, review => review.id === action.payload.reviewId, review => ({
          ...review,
          status: review.status === 'NotStarted' ? 'InProgress' : review.status,
          observations: [...review.observations, { dimension: action.payload.dimension, finding: action.payload.finding, rating: null }],
        })),
        notices: notice(state, 'Observation recorded against the version-pinned rubric.', 'success'),
      };

    case 'COMPLETE_QUALITY_REVIEW':
      return {
        ...state,
        qualityReviews: replace(state.qualityReviews, review => review.id === action.payload.reviewId, review => ({ ...review, status: 'Complete', completedAt: TODAY })),
        auditEvents: audit(state, { actorId: actor, operation: 'QualityReview.Manage', resource: action.payload.reviewId, outcome: 'Allowed', summary: 'Periodic review completed' }),
        notices: notice(state, 'Review completed. This is separate from manager approval of an individual survey.', 'success'),
      };

    /* --------------------------- access administration --------------------------- */

    case 'INVITE_MEMBER': {
      const { organizationId, recipient, proposedRoles, scope } = action.payload;
      const id = `INV-${state.invitations.length + 10}`;
      return {
        ...state,
        invitations: [{ id, organizationId, recipient, proposedRoles, scope, status: 'Pending', invitedById: actor, expiresAt: '2026-10-22' }, ...state.invitations],
        auditEvents: audit(state, { actorId: actor, operation: 'REPTeam.Invite', resource: id, outcome: 'Allowed', organizationId, summary: `Invitation created for ${proposedRoles.join(', ')}` }),
        notices: notice(state, `Illustrative pending invitation ${id} created. Single-use; it cannot grant rights the inviter cannot delegate.`, 'success'),
      };
    }

    case 'REMOVE_REP_ACCESS': {
      const { membershipId } = action.payload;
      return {
        ...state,
        memberships: replace(state.memberships, membership => membership.id === membershipId, membership => ({ ...membership, status: 'REP access removed', roles: [] })),
        auditEvents: audit(state, { actorId: actor, operation: 'REPTeam.RemoveAccess', resource: membershipId, outcome: 'Allowed', summary: 'REP entitlements removed; global portal identity untouched' }),
        notices: notice(state, 'REP access removed. The global Claims Connect identity and membership are not disabled.', 'warning'),
      };
    }

    /* --------------------------- catalog --------------------------- */

    case 'PUBLISH_TEMPLATE_VERSION': {
      const { templateId, version } = action.payload;
      return {
        ...state,
        templates: replace(state.templates, template => template.id === templateId, template => ({
          ...template,
          status: 'Published',
          currentVersion: version,
          versions: replace(template.versions, entry => entry.version === version, entry => ({ ...entry, status: 'Published', publishedAt: TODAY, publishedBy: actor })),
        })),
        auditEvents: audit(state, { actorId: actor, operation: 'Template.Publish', resource: `${templateId} v${version}`, outcome: 'Allowed', summary: 'Version published; previously pinned versions unchanged' }),
        notices: notice(state, `${templateId} version ${version} published. Previously pinned versions are untouched.`, 'success'),
      };
    }

    /* --------------------------- operations --------------------------- */

    case 'RETRY_INTEGRATION_EVENT': {
      const { eventId } = action.payload;
      return {
        ...state,
        integrationEvents: state.integrationEvents.map(event =>
          event.id === eventId && event.status === 'Failed'
            ? { ...event, status: 'Applied', attempts: event.attempts + 1, appliedCount: 1, lastError: null }
            : event),
        jobs: replace(state.jobs, job => job.type === 'OutboxDispatch' && job.status === 'Retrying', job => ({ ...job, status: 'Succeeded', finishedAt: new Date().toISOString(), error: null, result: 'Replayed without duplication' })),
        auditEvents: audit(state, { actorId: actor, operation: 'Integration.Operate', resource: eventId, outcome: 'Allowed', summary: 'Authorized replay; deduplication kept the applied count at one' }),
        notices: notice(state, `${eventId} replayed. Applied count remains 1 — the replay was deduplicated.`, 'success'),
      };
    }

    case 'REPLAY_INTEGRATION_EVENT': {
      const { eventId } = action.payload;
      const source = state.integrationEvents.find(event => event.id === eventId);
      if (!source) return state;
      return {
        ...state,
        integrationEvents: [
          { ...source, status: 'Duplicate ignored', attempts: 1, receivedAt: new Date().toISOString(), duplicateOf: eventId },
          ...state.integrationEvents,
        ],
        notices: notice(state, `Replaying ${eventId} produced one application only; the duplicate was ignored.`, 'success'),
      };
    }

    case 'FIX_MIGRATION_MANIFEST': {
      const { batchId } = action.payload;
      return {
        ...state,
        migrationBatches: replace(state.migrationBatches, batch => batch.id === batchId, batch => ({
          ...batch,
          checksumsSupplied: true,
          status: 'Ready gate simulated',
          counts: batch.counts.map(count => ({ ...count, received: count.expected })),
          items: batch.items.map(item => (item.status === 'Missing artifact' ? { ...item, status: 'Imported', mappedTo: 'resupplied', note: 'Resupplied in the corrected sample manifest' } : item)),
          exceptions: [],
        })),
        auditEvents: audit(state, { actorId: actor, operation: 'Migration.Reconcile', resource: batchId, outcome: 'Allowed', summary: 'Corrected sample manifest cleared the reconciliation exceptions' }),
        notices: notice(state, `${batchId} reconciliation now balances. This simulates a ready gate; cutover approval is still separate.`, 'success'),
      };
    }

    case 'APPROVE_CUTOVER':
      return {
        ...state,
        migrationBatches: replace(state.migrationBatches, batch => batch.id === action.payload.batchId, batch => ({ ...batch, cutoverApproved: true })),
        auditEvents: audit(state, { actorId: actor, operation: 'Migration.ApproveCutover', resource: action.payload.batchId, outcome: 'Allowed', summary: 'Simulated cutover approval' }),
        notices: notice(state, 'Simulated cutover approval recorded. No data was moved.', 'warning'),
      };

    /* --------------------------- impairment --------------------------- */

    case 'CREATE_IMPAIRMENT': {
      const id = `IMP-${String(state.impairments.length + 1).padStart(2, '0')}`;
      const record = {
        id,
        ...action.payload,
        status: 'Reported',
        ownerId: actor,
        restorationEvidenceId: null,
        safetyAssessment: 'Not performed by this prototype',
        history: [{ at: new Date().toISOString(), actor, event: 'Intake recorded', detail: 'Reporter identity is not verified in this wireframe.' }],
      };
      return {
        ...state,
        impairments: [record, ...state.impairments],
        page: { id: 'P37', params: { impairmentId: id } },
        history: [...state.history, state.page],
        notices: notice(state, `${id} opened. Intake does not verify the reporter or assess fire safety.`, 'success'),
      };
    }

    case 'RECORD_IMPAIRMENT_EVIDENCE':
      return {
        ...state,
        impairments: replace(state.impairments, item => item.id === action.payload.impairmentId, item => ({
          ...item,
          restorationEvidenceId: `EVID-${action.payload.impairmentId}`,
          history: [...item.history, { at: new Date().toISOString(), actor, event: 'Restoration evidence recorded', detail: action.payload.detail }],
        })),
        notices: notice(state, 'Restoration evidence recorded. Closure is now permitted.', 'success'),
      };

    case 'CLOSE_IMPAIRMENT': {
      const record = state.impairments.find(item => item.id === action.payload.impairmentId);
      if (!record?.restorationEvidenceId) {
        return { ...state, notices: notice(state, 'Closure denied: restoration evidence has not been recorded.', 'error') };
      }
      return {
        ...state,
        impairments: replace(state.impairments, item => item.id === action.payload.impairmentId, item => ({
          ...item,
          status: 'Restored',
          history: [...item.history, { at: new Date().toISOString(), actor, event: 'Closed', detail: 'Closure permitted only after evidence was recorded.' }],
        })),
        notices: notice(state, 'Impairment closed. Intake and restoration events are both retained.', 'success'),
      };
    }

    /* --------------------------- roadmap --------------------------- */

    case 'SET_OPTION_NOTE':
      return {
        ...state,
        futureOptions: replace(state.futureOptions, option => option.id === action.payload.optionId, option => ({ ...option, note: action.payload.note })),
        notices: notice(state, 'Prioritisation note recorded. The capability itself is not executed or approved.', 'success'),
      };

    case 'DISMISS_NOTICE':
      return { ...state, notices: state.notices.filter(item => item.id !== action.payload) };

    case 'PUSH_NOTICE':
      return { ...state, notices: notice(state, action.payload.text, action.payload.tone ?? 'info') };

    default:
      return state;
  }
}

export function RepProvider({ children }) {
  const [state, dispatch] = useReducer(repReducer, undefined, initialState);

  const value = useMemo(() => {
    const authenticatedUser = USERS.find(user => user.id === state.authenticatedUserId) ?? USERS[0];
    return {
      ...state,
      authenticatedUser,
      can: permission => roleHas(authenticatedUser.role, permission),
      permissions: PERMISSIONS,
    };
  }, [state]);

  return (
    <RepStateContext.Provider value={value}>
      <RepDispatchContext.Provider value={dispatch}>{children}</RepDispatchContext.Provider>
    </RepStateContext.Provider>
  );
}
