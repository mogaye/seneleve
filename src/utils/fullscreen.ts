export interface FullscreenElementLike {
  requestFullscreen?: (options?: FullscreenOptions) => Promise<void> | void;
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
}

export interface FullscreenDocumentLike {
  fullscreenEnabled?: boolean;
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  fullscreenElement?: Element | null;
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  exitFullscreen?: () => Promise<void> | void;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
  addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
  removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
}

const FULLSCREEN_CHANGE_EVENTS = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
] as const;

export function getFullscreenElement(
  doc: FullscreenDocumentLike | null | undefined,
): Element | null {
  if (!doc) return null;
  return (
    doc.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.mozFullScreenElement ??
    doc.msFullscreenElement ??
    null
  );
}

export function isFullscreenSupported(
  el: FullscreenElementLike | null | undefined,
  doc?: FullscreenDocumentLike | null,
): boolean {
  if (!el) return false;
  if (doc) {
    const enabled =
      doc.fullscreenEnabled ??
      doc.webkitFullscreenEnabled ??
      doc.mozFullScreenEnabled ??
      doc.msFullscreenEnabled;
    if (enabled === false) return false;
  }
  return Boolean(
    el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen,
  );
}

export async function enterBrowserFullscreen(
  el: FullscreenElementLike | null | undefined,
): Promise<boolean> {
  if (!el) return false;

  if (typeof el.requestFullscreen === 'function') {
    try {
      await Promise.resolve(el.requestFullscreen({ navigationUI: 'hide' }));
      return true;
    } catch {
      try {
        await Promise.resolve(el.requestFullscreen());
        return true;
      } catch {
        return false;
      }
    }
  }

  const vendorRequest =
    el.webkitRequestFullscreen ?? el.mozRequestFullScreen ?? el.msRequestFullscreen;

  if (typeof vendorRequest === 'function') {
    try {
      await Promise.resolve(vendorRequest.call(el));
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export async function exitBrowserFullscreen(
  doc: FullscreenDocumentLike | null | undefined,
): Promise<boolean> {
  if (!doc || !getFullscreenElement(doc)) return false;

  const exitFn =
    doc.exitFullscreen ??
    doc.webkitExitFullscreen ??
    doc.mozCancelFullScreen ??
    doc.msExitFullscreen;

  if (typeof exitFn !== 'function') return false;

  try {
    await Promise.resolve(exitFn.call(doc));
    return true;
  } catch {
    return false;
  }
}

export function subscribeFullscreenChange(
  doc: FullscreenDocumentLike | null | undefined,
  onChange: () => void,
): () => void {
  if (!doc?.addEventListener || !doc?.removeEventListener) {
    return () => {};
  }

  const handler: EventListener = () => onChange();
  for (const eventName of FULLSCREEN_CHANGE_EVENTS) {
    doc.addEventListener(eventName, handler);
  }

  return () => {
    for (const eventName of FULLSCREEN_CHANGE_EVENTS) {
      doc.removeEventListener?.(eventName, handler);
    }
  };
}
