import test from 'node:test';
import assert from 'node:assert/strict';
import {
  enterBrowserFullscreen,
  exitBrowserFullscreen,
  FullscreenDocumentLike,
  FullscreenElementLike,
  getFullscreenElement,
  isFullscreenSupported,
  subscribeFullscreenChange,
} from './fullscreen';

test('enterBrowserFullscreen uses navigationUI hide and falls back cleanly if options fail', async () => {
  const calls: unknown[] = [];
  const el: FullscreenElementLike = {
    requestFullscreen: async (options?: FullscreenOptions) => {
      calls.push(options ?? 'no-options');
      if (options) {
        throw new TypeError('Invalid options');
      }
    },
  };

  const entered = await enterBrowserFullscreen(el);
  assert.equal(entered, true);
  assert.deepEqual(calls, [{ navigationUI: 'hide' }, 'no-options']);
});

test('enterBrowserFullscreen supports webkit/ms vendor methods and swallows permission rejections', async () => {
  let webkitCalled = false;
  const webkitEl: FullscreenElementLike = {
    webkitRequestFullscreen: () => {
      webkitCalled = true;
    },
  };
  assert.equal(await enterBrowserFullscreen(webkitEl), true);
  assert.equal(webkitCalled, true);

  const rejectedEl: FullscreenElementLike = {
    requestFullscreen: () => Promise.reject(new Error('Disallowed in iframe')),
  };
  assert.equal(await enterBrowserFullscreen(rejectedEl), false);
  assert.equal(await enterBrowserFullscreen(null), false);
});

test('getFullscreenElement, isFullscreenSupported, exitBrowserFullscreen, and subscribeFullscreenChange work across prefixes', async () => {
  const fakeEl = {} as Element;
  let exited = false;
  const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

  const doc: FullscreenDocumentLike = {
    webkitFullscreenEnabled: true,
    webkitFullscreenElement: fakeEl,
    webkitExitFullscreen: () => {
      exited = true;
    },
    addEventListener: (type, listener) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)?.add(listener);
    },
    removeEventListener: (type, listener) => {
      listeners.get(type)?.delete(listener);
    },
  };

  assert.equal(getFullscreenElement(doc), fakeEl);
  assert.equal(isFullscreenSupported({ webkitRequestFullscreen: () => {} }, doc), true);
  assert.equal(await exitBrowserFullscreen(doc), true);
  assert.equal(exited, true);

  let changeCount = 0;
  const unsubscribe = subscribeFullscreenChange(doc, () => {
    changeCount += 1;
  });

  for (const set of listeners.values()) {
    for (const listener of set) {
      if (typeof listener === 'function') listener(new Event('fullscreenchange'));
    }
  }
  assert.equal(changeCount, 4);

  unsubscribe();
  for (const set of listeners.values()) {
    assert.equal(set.size, 0);
  }
});
