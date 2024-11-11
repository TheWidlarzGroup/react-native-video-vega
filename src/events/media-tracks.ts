import {
  AudioTrackList,
  EventListener,
  TextTrack,
  TextTrackCue,
  TextTrackList,
  TrackEvent,
  VideoTrackList,
} from '@amzn/react-native-w3cmedia';
import {useEffect, RefObject} from 'react';

type TrackListEvents = {
  /**
   * Fired when one or more tracks in the track list have been enabled or disabled.
   */
  change?: (
    this: AudioTrackList | VideoTrackList | TextTrackList,
    ev: Event,
  ) => unknown;

  /**
   * Fired when a track has been added to the track list.
   */
  addtrack?: (
    this: AudioTrackList | VideoTrackList | TextTrackList,
    ev: TrackEvent,
  ) => unknown;

  /**
   * Fired when a track has been removed from the track list.
   */
  removetrack?: (
    this: AudioTrackList | VideoTrackList | TextTrackList,
    ev: TrackEvent,
  ) => unknown;
};

type TextTrackEvents = {
  /**
   * Fired when one or more cues in the track have become active or stopped being active.
   */
  cuechange?: (this: TextTrack, ev: Event) => unknown;

  /**
   * Fired when the track data has been fetched and successfully processed.
   */
  load?: (this: HTMLTrackElement, ev: Event) => unknown;

  /**
   * Fired when an error occurs while fetching the track data.
   */
  error?: (this: HTMLTrackElement, ev: Event) => unknown;
};

type TextTrackCueEvents = {
  /**
   * Fired when the cue has become active.
   */
  enter?: (this: TextTrackCue, ev: Event) => unknown;

  /**
   * Fired when the cue has stopped being active.
   */
  exit?: (this: TextTrackCue, ev: Event) => unknown;
};

export function useTrackListEvent(
  ref: RefObject<
    | AudioTrackList
    | VideoTrackList
    | TextTrackList
    | TextTrack
    | TextTrackCue
    | null
  >,
  events: TrackListEvents | TextTrackEvents | TextTrackCueEvents,
) {
  useEffect(() => {
    const trackList = ref.current;
    if (!trackList) {
      return;
    }

    // Attach listeners
    Object.entries(events).forEach(([event, handler]) => {
      if (handler) {
        trackList.addEventListener(event, handler as EventListener);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        if (handler) {
          trackList.removeEventListener(event, handler as EventListener);
        }
      });
    };
  }, [ref, events]);
}
