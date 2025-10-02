import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AudioTrack,
  EnumValues,
  ReactVideoProps,
  ReactVideoSource,
  ResizeMode,
  TextTrack,
  VideoTrack,
} from './types';
import {
  Image,
  ImageResizeMode,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  AudioTrack as KAudioTrack,
  VideoTrack as KVideoTrack,
  TextTrack as KTextTrack,
  VideoPlayer,
  KeplerVideoView,
} from '@amazon-devices/react-native-w3cmedia';
import {resolveAssetSourceForVideo} from './utils';
import {useHTMLMediaElementEvent} from './events/media-element';
import {useTrackListEvent} from './events/media-tracks';

export interface VideoRef {
  seek: (time: number, tolerance?: number) => void;
  resume: () => void;
  pause: () => void;
  presentFullscreenPlayer: () => void;
  dismissFullscreenPlayer: () => void;
  restoreUserInterfaceForPictureInPictureStopCompleted: (
    restore: boolean,
  ) => void;
  setVolume: (volume: number) => void;
  setFullScreen: (fullScreen: boolean) => void;
  setSource: (source?: ReactVideoSource) => void;
  getCurrentPosition: () => Promise<number>;
}

const resizeModeToScalingMode = (
  resizeMode: EnumValues<ResizeMode> | undefined,
) => {
  switch (resizeMode) {
    case 'contain':
      return 'fit';
    case 'cover':
      return 'fill';
    case 'stretch':
      return 'strech';
    default:
      return 'none';
  }
};

const Video = forwardRef<VideoRef, ReactVideoProps>(
  (
    {
      source,
      style,
      resizeMode,
      poster,
      posterResizeMode,
      renderLoader,
      textTracks,
      selectedVideoTrack,
      selectedAudioTrack,
      selectedTextTrack,
      onLoadStart,
      onLoad,
      onError,
      onProgress,
      onSeek,
      onEnd,
      onReadyForDisplay,
      onPlaybackRateChange,
      onVolumeChange,
      onPlaybackStateChanged,
      onAudioTracks,
      onTextTracks,
      onVideoTracks,
      controls,
    },
    ref,
  ) => {
    const videoPlayer = useRef<VideoPlayer | null>(null);
    const isSeeking = useRef(false);

    const _renderLoader = useMemo(
      () =>
        !renderLoader
          ? undefined
          : renderLoader instanceof Function
          ? renderLoader
          : () => renderLoader,
      [renderLoader],
    );

    const hasPoster = useMemo(() => {
      if (_renderLoader) {
        return true;
      }

      if (typeof poster === 'string') {
        return !!poster;
      }

      return !!poster?.source;
    }, [poster, _renderLoader]);

    const scalingmode = useMemo(
      () => resizeModeToScalingMode(resizeMode),
      [resizeMode],
    );

    const [showPoster, setShowPoster] = useState(hasPoster);
    const [useKeplerVideoView, setUseKeplerVideoView] = useState(false);

    const setSource = useCallback(
      (_source: ReactVideoSource | undefined) => {
        if (!_source) {
          console.warn('Invalid source:', _source, videoPlayer.current);
          return;
        }

        const resolvedSource = resolveAssetSourceForVideo(_source);
        videoPlayer.current = new VideoPlayer();

        if (resolvedSource.uri || !videoPlayer.current) {
          (async () => {
            try {
              await videoPlayer.current!.initialize();
              videoPlayer.current!.autoplay = true;
              videoPlayer.current!.src = resolvedSource.uri ?? '';
              setUseKeplerVideoView(true);
            } catch (e) {
              console.error('Error setting source:', e);
            }
          })();
        } else {
          console.warn('Invalid source:', _source);
        }

        // add textTracks
        if (textTracks) {
          for (const {title, language, uri, type} of textTracks) {
            videoPlayer.current.addTextTrack(
              'subtitles',
              title,
              language,
              uri,
              type,
            );
          }
        }
      },
      [textTracks],
    );

    // source listener
    useEffect(() => {
      if (source) {
        setSource(source);
      }
    }, [setSource, source]);

    // Media Tracks
    useEffect(() => {
      if (!videoPlayer.current) {
        return;
      }

      if (selectedVideoTrack !== undefined) {
        try {
          if (selectedVideoTrack.type !== 'index') {
            throw new Error(
              'Only video tracks with type "index" are supported on this platform',
            );
          }

          const index =
            typeof selectedVideoTrack.value === 'number'
              ? selectedVideoTrack.value
              : parseInt(selectedVideoTrack.value ?? 'NaN', 10);

          if (isNaN(index)) {
            throw new Error(
              `Invalid video track index: ${selectedVideoTrack.value}`,
            );
          }

          if (index >= videoPlayer.current.videoTracks.length) {
            throw new Error(
              `Invalid video track index: ${index} (total video tracks: ${videoPlayer.current.videoTracks.length})`,
            );
          }

          for (let i = 0; i < videoPlayer.current.videoTracks.length; i++) {
            // @ts-expect-error - TS does not extend array
            const track = videoPlayer.current.videoTracks[i] as KVideoTrack;
            track.selected = i === index;
          }
        } catch (e) {
          console.error('Error selecting video track:', e);
        }
      }

      if (selectedAudioTrack !== undefined) {
        try {
          if (selectedAudioTrack.type !== 'index') {
            throw new Error(
              'Only audio tracks with type "index" are supported on this platform',
            );
          }

          const index =
            typeof selectedAudioTrack.value === 'number'
              ? selectedAudioTrack.value
              : parseInt(selectedAudioTrack.value ?? 'NaN', 10);

          if (isNaN(index)) {
            throw new Error(
              `Invalid audio track index: ${selectedAudioTrack.value}`,
            );
          }

          if (index >= videoPlayer.current.audioTracks.length) {
            throw new Error(
              `Invalid audio track index: ${index} (total audio tracks: ${videoPlayer.current.audioTracks.length})`,
            );
          }

          for (let i = 0; i < videoPlayer.current.audioTracks.length; i++) {
            // @ts-expect-error - TS does not extend array
            const track = videoPlayer.current.audioTracks[i] as KAudioTrack;
            track.enabled = i === index;
          }
        } catch (e) {
          console.error('Error selecting audio track:', e);
        }
      }

      if (selectedTextTrack !== undefined) {
        try {
          if (selectedTextTrack.type !== 'index') {
            throw new Error(
              'Only text tracks with type "index" are supported on this platform',
            );
          }

          const index =
            typeof selectedTextTrack.value === 'number'
              ? selectedTextTrack.value
              : parseInt(selectedTextTrack.value ?? 'NaN', 10);

          if (isNaN(index)) {
            throw new Error(
              `Invalid text track index: ${selectedTextTrack.value}`,
            );
          }

          if (index >= videoPlayer.current.textTracks.length) {
            throw new Error(
              `Invalid text track index: ${index} (total text tracks: ${videoPlayer.current.textTracks.length})`,
            );
          }

          for (let i = 0; i < videoPlayer.current.textTracks.length; i++) {
            // @ts-expect-error - TS does not extend array
            const track = videoPlayer.current.textTracks[i] as KTextTrack;
            track.mode = i === index ? 'showing' : 'disabled';
          }
        } catch (e) {
          console.error('Error selecting text track:', e);
        }
      }
    }, [selectedVideoTrack, selectedAudioTrack, selectedTextTrack]);

    // ------------

    const seek = useCallback(async (time: number, _?: number) => {
      if (!videoPlayer.current) {
        console.warn('[RNV] No video player');
        return;
      }

      videoPlayer.current.currentTime = time;
    }, []);

    const pause = useCallback(() => {
      if (!videoPlayer.current) {
        console.warn('[RNV] No video player');
        return;
      }

      videoPlayer.current.pause();
    }, []);

    const resume = useCallback(() => {
      if (!videoPlayer.current) {
        console.warn('[RNV] No video player');
        return;
      }

      videoPlayer.current.play();
    }, []);

    const setVolume = useCallback((volume: number) => {
      if (!videoPlayer.current) {
        console.warn('[RNV] No video player');
        return;
      }

      // Clamp the volume between 0 and 1
      videoPlayer.current.volume = Math.max(0, Math.min(1, volume));
    }, []);

    const setFullScreen = useCallback((_: boolean) => {
      // I couldn't find a way to implement this
      throw new Error(
        'setFullScreen is not available on this platform | You will need to implement this yourself in your app via styling',
      );
    }, []);

    const presentFullscreenPlayer = useCallback(
      () => setFullScreen(true),
      [setFullScreen],
    );

    const dismissFullscreenPlayer = useCallback(
      () => setFullScreen(false),
      [setFullScreen],
    );

    const _onReadyForDisplay = useCallback(() => {
      hasPoster && setShowPoster(false);
      onReadyForDisplay?.();
    }, [hasPoster, onReadyForDisplay]);

    const onVideoLoadStart = useCallback(() => {
      if (!videoPlayer.current) {
        console.warn('[RNV] No video player');
        return;
      }

      onLoadStart?.({
        isNetwork: !!(
          videoPlayer.current.src &&
          videoPlayer.current.src.match(/^(rtp|rtsp|http|https):/)
        ),
        type: '',
        uri: videoPlayer.current.src,
      });
    }, [onLoadStart]);

    const onVideoLoad = useCallback(() => {
      console.log('onVideoLoad');
      _onReadyForDisplay();

      if (!videoPlayer.current) {
        console.warn('[RNV] No video player');
        return;
      }

      const getAudioTracks: () => Array<AudioTrack> = () => {
        if (!videoPlayer.current) {
          console.warn('[RNV] No video player');
          return [];
        }

        const audioTracks: Array<AudioTrack> = [];
        for (let i = 0; i < videoPlayer.current.audioTracks.length; i++) {
          // @ts-expect-error - TS does not extends array
          const track = videoPlayer.current.audioTracks[i] as KAudioTrack;
          audioTracks.push({
            index: i,
            title: track.label,
            bitrate: undefined,
            language: track.language,
            selected: track.enabled,
            type: 'index',
          } satisfies AudioTrack);
        }

        return audioTracks;
      };

      const getVideoTracks = () => {
        if (!videoPlayer.current) {
          console.warn('[RNV] No video player');
          return [];
        }

        const videoTracks: Array<VideoTrack> = [];
        for (let i = 0; i < videoPlayer.current.videoTracks.length; i++) {
          // @ts-expect-error - TS does not extends array
          const track = videoPlayer.current.videoTracks[i] as KVideoTrack;
          videoTracks.push({
            index: i,
            height: undefined,
            width: undefined,
            bitrate: undefined,
            selected: track.selected,
            codecs: undefined,
          });
        }

        return videoTracks;
      };

      const getTextTracks = () => {
        if (!videoPlayer.current) {
          console.warn('[RNV] No video player');
          return [];
        }

        const texTracks: Array<TextTrack> = [];
        for (let i = 0; i < videoPlayer.current.textTracks.length; i++) {
          // @ts-expect-error - TS does not extends array
          const track = videoPlayer.current.textTracks[i] as KTextTrack;
          texTracks.push({
            index: i,
            title: track.label,
            language: track.language,
            type: undefined,
            selected: track.mode !== 'disabled',
          });
        }

        return texTracks;
      };

      onLoad?.({
        currentTime: videoPlayer.current.currentTime,
        duration: videoPlayer.current.duration,
        naturalSize: {
          width: videoPlayer.current.videoWidth,
          height: videoPlayer.current.videoHeight,
          orientation:
            videoPlayer.current.videoWidth > videoPlayer.current.videoHeight
              ? 'landscape'
              : 'portrait',
        },
        audioTracks: getAudioTracks(),
        textTracks: getTextTracks(),
        videoTracks: getVideoTracks(),
      });
    }, [_onReadyForDisplay, onLoad]);

    const onVideoError = useCallback(() => {
      if (!videoPlayer.current) {
        console.warn('[RNV] No video player');
        return;
      }

      onError?.({
        error: {
          code: videoPlayer.current.error?.code ?? -1,
          domain: videoPlayer.current.error?.message ?? 'unknown',
          error: videoPlayer.current.error?.message ?? 'unknown',
        },
      });
    }, [onError]);

    const onVideoProgress = useCallback(() => {
      if (!videoPlayer.current) {
        console.warn('[RNV] No video player');
        return;
      }

      onProgress?.({
        currentTime: videoPlayer.current.currentTime,
        playableDuration: videoPlayer.current.duration,
        seekableDuration: videoPlayer.current.buffered.end(0),
      });
    }, [onProgress]);

    const onVideoSeek = useCallback(() => {
      if (!videoPlayer.current) {
        console.warn('[RNV] No video player');
        return;
      }

      onSeek?.({
        currentTime: videoPlayer.current.currentTime,
        seekTime: videoPlayer.current.currentTime,
      });
    }, [onSeek]);

    const onVideoPlaybackStateChanged = useCallback(() => {
      if (!videoPlayer.current) {
        console.warn('[RNV] No video player');
        return;
      }

      onPlaybackStateChanged?.({
        isPlaying: !videoPlayer.current.paused,
        isSeeking: isSeeking.current,
      });
    }, [onPlaybackStateChanged]);

    const onVideoEnd = useCallback(() => {
      onEnd?.();
    }, [onEnd]);

    const _onAudioTracks = useCallback(() => {
      if (!videoPlayer.current) {
        console.warn('[RNV] No video player');
        return;
      }

      const audioTracks: Array<AudioTrack> = [];
      for (let i = 0; i < videoPlayer.current.audioTracks.length; i++) {
        // @ts-expect-error - TS does not extends array
        const track = videoPlayer.current.audioTracks[i] as KAudioTrack;
        audioTracks.push({
          index: i,
          title: track.label,
          bitrate: undefined,
          language: track.language,
          selected: track.enabled,
          type: 'index',
        } satisfies AudioTrack);
      }

      onAudioTracks?.({
        audioTracks: audioTracks,
      });
    }, [onAudioTracks]);

    const _onTextTracks = useCallback(() => {
      if (!videoPlayer.current) {
        console.warn('[RNV] No video player');
        return;
      }

      const texTracks: Array<TextTrack> = [];
      for (let i = 0; i < videoPlayer.current.textTracks.length; i++) {
        // @ts-expect-error - TS does not extends array
        const track = videoPlayer.current.textTracks[i] as KTextTrack;
        texTracks.push({
          index: i,
          title: track.label,
          language: track.language,
          type: 'srt',
          selected: track.mode !== 'disabled',
        } satisfies TextTrack);
      }

      onTextTracks?.({
        textTracks: texTracks,
      });
    }, [onTextTracks]);

    const _onVideoTracks = useCallback(() => {
      if (!videoPlayer.current) {
        console.warn('[RNV] No video player');
        return;
      }

      const videoTracks: Array<VideoTrack> = [];
      for (let i = 0; i < videoPlayer.current.videoTracks.length; i++) {
        // @ts-expect-error - TS does not extend array
        const track = videoPlayer.current.videoTracks[i] as KVideoTrack;
        videoTracks.push({
          index: i,
          height: undefined,
          width: undefined,
          bitrate: undefined,
          selected: track.selected,
          codecs: undefined,
        } satisfies VideoTrack);
      }

      onVideoTracks?.({
        videoTracks: videoTracks,
      });
    }, [onVideoTracks]);

    const _onPlaybackRateChange = useCallback(() => {
      const playbackRate = videoPlayer.current?.playbackRate ?? 0;
      onPlaybackRateChange?.({
        playbackRate,
      });
    }, [onPlaybackRateChange]);

    const _onVolumeChange = useCallback(() => {
      const volume = videoPlayer.current?.volume ?? 0;
      onVolumeChange?.({
        volume,
      });
    }, [onVolumeChange]);

    useImperativeHandle(
      ref,
      () => ({
        seek,
        presentFullscreenPlayer,
        dismissFullscreenPlayer,
        pause,
        resume,
        restoreUserInterfaceForPictureInPictureStopCompleted: () => {
          throw new Error(
            'restoreUserInterfaceForPictureInPictureStopCompleted is not available on this platform',
          );
        },
        setVolume,
        getCurrentPosition: async () => videoPlayer.current?.currentTime ?? 0,
        setFullScreen,
        setSource: async (s) => setSource(s),
      }),
      [
        seek,
        presentFullscreenPlayer,
        dismissFullscreenPlayer,
        pause,
        resume,
        setVolume,
        setFullScreen,
        setSource,
      ],
    );

    const _renderPoster = useCallback(() => {
      if (!hasPoster || !showPoster) {
        return null;
      }

      // poster resize mode
      let _posterResizeMode: ImageResizeMode = 'contain';

      if (!(typeof poster === 'string') && poster?.resizeMode) {
        _posterResizeMode = poster.resizeMode;
      } else if (posterResizeMode && posterResizeMode !== 'none') {
        _posterResizeMode = posterResizeMode;
      }

      // poster style
      const baseStyle: StyleProp<ImageStyle> = {
        ...StyleSheet.absoluteFillObject,
        resizeMode: _posterResizeMode,
      };

      let posterStyle: StyleProp<ImageStyle> = baseStyle;

      if (!(typeof poster === 'string') && poster?.style) {
        const styles = Array.isArray(poster.style)
          ? poster.style
          : [poster.style];
        posterStyle = [baseStyle, ...styles];
      }

      // render poster
      if (_renderLoader && (poster || posterResizeMode)) {
        console.warn(
          'You provided both `renderLoader` and `poster` or `posterResizeMode` props. `renderLoader` will be used.',
        );
      }

      // render loader
      if (_renderLoader) {
        return (
          <View style={StyleSheet.absoluteFill}>
            {_renderLoader({
              source: source,
              style: posterStyle,
              resizeMode: resizeMode,
            })}
          </View>
        );
      }

      return (
        <Image
          {...(typeof poster === 'string' ? {} : poster)}
          source={
            typeof poster === 'string' ? {uri: poster} : poster?.source || {}
          }
          style={posterStyle}
        />
      );
    }, [
      hasPoster,
      poster,
      posterResizeMode,
      _renderLoader,
      showPoster,
      source,
      resizeMode,
    ]);

    const _style: StyleProp<ViewStyle> = useMemo(
      () => ({
        width: '100%',
        height: '100%',
        ...(showPoster ? {display: 'none'} : {}),
      }),
      [showPoster],
    );

    useHTMLMediaElementEvent(videoPlayer, {
      loadstart: onVideoLoadStart,
      loadeddata: onVideoLoad,
      error: onVideoError,
      progress: onVideoProgress,
      seeked: onVideoSeek,
      play: onVideoPlaybackStateChanged,
      pause: onVideoPlaybackStateChanged,
      playing: onVideoPlaybackStateChanged,
      stalled: onVideoPlaybackStateChanged,
      suspend: onVideoPlaybackStateChanged,
      waiting: onVideoPlaybackStateChanged,
      timeupdate: onVideoProgress,
      ratechange: _onPlaybackRateChange,
      ended: onVideoEnd,
      volumechange: _onVolumeChange,
    });

    // Audio Tracks Events
    useTrackListEvent(
      {current: videoPlayer.current?.audioTracks || null},
      {
        change: _onAudioTracks,
      },
    );

    // Video Tracks Events
    useTrackListEvent(
      {current: videoPlayer.current?.videoTracks || null},
      {
        change: _onVideoTracks,
      },
    );

    // Text Tracks Events
    useTrackListEvent(
      {current: videoPlayer.current?.textTracks || null},
      {
        change: _onTextTracks,
        addtrack: (event) => {
          __DEV__ && console.log('[RNV]: Text track added:', event.track);
        },
        removetrack: (event) => {
          console.log('[RNV]: Text track removed:', event.track);
        },
      },
    );

    return (
      <View style={style}>
        {useKeplerVideoView ? (
          <KeplerVideoView
            style={_style}
            showControls={controls}
            showCaptions={true}
            videoPlayer={videoPlayer.current as VideoPlayer}
            scalingmode={scalingmode}
          />
        ) : (
          <View style={_style} />
        )}
        {_renderPoster()}
      </View>
    );
  },
);

Video.displayName = 'Video';

export default Video;
