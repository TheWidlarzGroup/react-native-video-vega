import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Video, {VideoRef} from 'react-native-video';

// mp4 video file
const VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4';

export const App = () => {
  const videoRef = React.useRef<VideoRef>(null);

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.text}>Hello from React Native Video!</Text>
        <Video
          ref={videoRef}
          source={{uri: VIDEO_URL}}
          style={{width: '80%', height: '80%', overflow: 'hidden'}}
          resizeMode="cover"
          onLoad={() => {
            console.log('Video loaded');
          }}
          onLoadStart={() => {
            console.log('Video loading started');
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    flexDirection: 'column',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    marginLeft: 200,
  },
  headerText: {
    color: 'white',
    fontSize: 80,
    marginBottom: 10,
  },
  subHeaderText: {
    color: 'white',
    fontSize: 40,
  },
  links: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    height: 600,
  },
  image: {
    flex: 1,
    paddingLeft: 150,
  },
  textContainer: {
    justifyContent: 'center',
    flex: 1,
    marginLeft: 190,
  },
  text: {
    color: 'white',
    fontSize: 80,
    marginBottom: 15,
  },
});
