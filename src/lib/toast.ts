export type ToastType = 'info' | 'error' | 'success';

export interface ToastPayload {
  msg: string;
  type: ToastType;
}

const TOAST_EVENT = 'dg:toast';

/** Show a global toast (rendered by the AppToaster component in the layout) */
export function showToast(msg: string, type: ToastType = 'info') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: { msg, type } }));
}

export const TOAST_EVENT_NAME = TOAST_EVENT;
