import { useContext } from 'react';
import { RepStateContext, RepDispatchContext } from './repContexts';

export function useRep() {
  const value = useContext(RepStateContext);
  if (!value) throw new Error('useRep must be used inside RepProvider');
  return value;
}

export function useRepDispatch() {
  const value = useContext(RepDispatchContext);
  if (!value) throw new Error('useRepDispatch must be used inside RepProvider');
  return value;
}

/** Navigate helper: dispatch({type:'NAVIGATE'}) with page id and params. */
export function useNavigate() {
  const dispatch = useRepDispatch();
  return (pageId, params = {}) => dispatch({ type: 'NAVIGATE', payload: { id: pageId, params } });
}
