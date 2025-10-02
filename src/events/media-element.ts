import {
  EventListener,
  HTMLMediaElement,
} from '@amazon-devices/react-native-w3cmedia';
import {useEffect, RefObject} from 'react';

type HTMLMediaElementEvents = {
  /**
   * The user agent begins looking for media data.
   * Fired when networkState = NETWORK_LOADING
   */
  loadstart?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * The user agent is fetching media data.
   * Fired when networkState = NETWORK_LOADING
   */
  progress?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * The user agent is intentionally not currently fetching media data.
   * Fired when networkState = NETWORK_IDLE
   */
  suspend?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * The user agent stops fetching the media data before it is completely downloaded, but not due to an error.
   */
  abort?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * An error occurs while fetching the media data or the type is not supported.
   */
  error?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * A media element just switched to NETWORK_EMPTY from another state.
   */
  emptied?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * The user agent is trying to fetch media data, but data is not forthcoming.
   */
  stalled?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * The user agent has just determined the duration and dimensions of the media resource.
   */
  loadedmetadata?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * The user agent can render the media data at the current playback position for the first time.
   */
  loadeddata?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * Playback can start, but might stop for buffering.
   */
  canplay?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * Playback can likely proceed to its end without stopping for buffering.
   */
  canplaythrough?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * Playback is ready to start after being paused or delayed.
   */
  playing?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * Playback has stopped because the next frame is not available, but is expected soon.
   */
  waiting?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * The element is seeking a new position in the media.
   */
  seeking?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * The element has finished seeking.
   */
  seeked?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * Playback has stopped because the end of the media resource was reached.
   */
  ended?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * The duration attribute has just been updated.
   */
  durationchange?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * The current playback position changed (e.g. during normal playback or a jump).
   */
  timeupdate?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * The element is no longer paused. Fired after play() returns.
   */
  play?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * The element has been paused. Fired after pause() returns.
   */
  pause?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * The playback rate has just been updated.
   */
  ratechange?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * One or both of the video's dimensions have changed.
   */
  resize?: (this: HTMLMediaElement, ev: Event) => unknown;

  /**
   * The volume attribute or the muted attribute has changed.
   */
  volumechange?: (this: HTMLMediaElement, ev: Event) => unknown;
};

const MEDIA_EVENT_NAMES: (keyof HTMLMediaElementEvents)[] = [
  'loadstart',
  'progress',
  'suspend',
  'abort',
  'error',
  'emptied',
  'stalled',
  'loadedmetadata',
  'loadeddata',
  'canplay',
  'canplaythrough',
  'playing',
  'waiting',
  'seeking',
  'seeked',
  'ended',
  'durationchange',
  'timeupdate',
  'play',
  'pause',
  'ratechange',
  'resize',
  'volumechange',
];

/**
 * A React hook that attaches event listeners to a given HTMLMediaElement for any of the standard media events.
 *
 * @param ref A ref object pointing to an HTMLMediaElement (e.g. <video> or <audio> element).
 * @param events An object where keys are media event names and values are event handlers.
 */
export function useHTMLMediaElementEvent(
  ref: RefObject<HTMLMediaElement>,
  events: HTMLMediaElementEvents,
): void {
  useEffect(() => {
    const mediaEl = ref.current;
    if (!mediaEl) {
      return;
    }

    // Attach event listeners
    MEDIA_EVENT_NAMES.forEach((eventName) => {
      const handler = events[eventName];
      if (handler) {
        mediaEl.addEventListener(eventName, handler as EventListener);
      }
    });

    // Cleanup on unmount or when events object changes
    return () => {
      MEDIA_EVENT_NAMES.forEach((eventName) => {
        const handler = events[eventName];
        if (handler) {
          mediaEl.removeEventListener(eventName, handler as EventListener);
        }
      });
    };
  }, [ref, events]);
}
