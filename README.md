# react-native-video-vega
🎬 `<Video>` component for React Native Vega OS

## Documentation
documentation is available at [docs.thewidlarzgroup.com/react-native-video/](https://docs.thewidlarzgroup.com/react-native-video/)
> [!NOTE]
> Documentation is made for react-native-video, but is should cover all the features of react-native-video-vega

## Example
To run example you need to have setup [React Native for Vega](https://developer.amazon.com/docs/vega/0.21/vega-develop.html)

To run example follow these steps:

> [!CAUTION]
> Use `npm` to install dependencies in the root directory. Other package managers may not work correctly.

```bash
# Install dependencies in the root directory
npm install --force

# Go to example directory
cd example
npm install

# build the project
npm run build:app

# Run Simulator & start metro bundler
kepler device simulator start
kepler device start-port-forwarding --device Simulator -p 8081 --forward false
npm start

# Run the app
kepler run-kepler "./build/vega-tv2023-aarch64-debug/keplerrnvideoexample_aarch64.vpkg" "com.anonymous.rnvexample.main" -s
```

## Usage

```javascript
// Load the module

import Video, {VideoRef} from 'react-native-video';

// Within your render function, assuming you have a file called
// "background.mp4" in your project. You can include multiple videos
// on a single screen if you like.

const VideoPlayer = () => {
 const videoRef = useRef<VideoRef>(null);
 const background = require('./background.mp4');

 return (
   <Video 
    // Can be a URL or a local file.
    source={background}
    // Store reference  
    ref={videoRef}
    // Callback when remote video is buffering                                      
    onBuffer={onBuffer}
    // Callback when video cannot be loaded              
    onError={onError}               
    style={styles.backgroundVideo}
   />
 )
}

// Later on in your styles..
var styles = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
```

## Community support
We have an discord server where you can ask questions and get help. [Join the discord server](https://discord.gg/WXuM4Tgb9X)

## Enterprise Support
<p>
  📱 <i>react-native-video</i> is provided <i>as it is</i>. For enterprise support or other business inquiries, <a href="https://www.thewidlarzgroup.com/?utm_source=rnvvega&utm_medium=readme#Contact">please contact us 🤝</a>. We can help you with the integration, customization and maintenance. We are providing both free and commercial support for this project. let's build something awesome together! 🚀
</p>
<a href="https://www.thewidlarzgroup.com/?utm_source=rnv&utm_medium=readme">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/baners/twg-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./docs/assets/baners/twg-light.png" />
    <img alt="TheWidlarzGroup" src="./docs/assets/baners/twg-light.png" />
  </picture>
</a>
