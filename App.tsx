import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, Text, View, StyleSheet, Animated, PanResponder, Dimensions, ImageBackground, Image } from 'react-native';

const Background = require("./assets/image.png");
const Cloud = require("./assets/cloud.png"); // Path to your cloud image
const Sun = require("./assets/goodSun.png"); // Path to your sun image

const TARGET_SIZE = 100;
const { width, height } = Dimensions.get('window');

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timer, setTimer] = useState(10);  // Timer state for countdown
  const [movedOnce, setMovedOnce] = useState(false);  // Track if the first cloud is moved
  const [timerStarted, setTimerStarted] = useState(false);  // Track if the timer has started

  const CLOUD_SIZE = Math.max(60, 120 - score * 5); // Dynamically adjust cloud size

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Timer countdown effect
  useEffect(() => {
    if (timer > 0 && timerStarted) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (timer === 0 && timerStarted) {
      // Reset score when timer reaches zero
      setScore(0);
      setTimerStarted(false);
      setTimer(10); // Reset timer back to 10 seconds
    }
  }, [timer, timerStarted]);

  // Spawn a new cloud at a random position along the edge
  const spawnNewCloud = () => {
    const side = Math.floor(Math.random() * 4);
    let startX = 0, startY = 0;

    switch (side) {
      case 0: startX = Math.random() * (width - CLOUD_SIZE); startY = 0; break;
      case 1: startX = width - CLOUD_SIZE; startY = Math.random() * (height - CLOUD_SIZE); break;
      case 2: startX = Math.random() * (width - CLOUD_SIZE); startY = height - CLOUD_SIZE; break;
      case 3: startX = 0; startY = Math.random() * (height - CLOUD_SIZE); break;
    }

    pan.setValue({ x: startX, y: startY });
  };

  const isOverTarget = () => {
    const cloudX = pan.x.__getValue();
    const cloudY = pan.y.__getValue();
    const targetX = width / 2 - TARGET_SIZE / 2;
    const targetY = height / 2 - TARGET_SIZE / 2;

    return (
      cloudX < targetX + TARGET_SIZE &&
      cloudX + CLOUD_SIZE > targetX &&
      cloudY < targetY + TARGET_SIZE &&
      cloudY + CLOUD_SIZE > targetY
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x.__getValue(),
          y: pan.y.__getValue()
        });
        pan.setValue({ x: 0, y: 0 });

        // Only start the timer after the first cloud is moved
        if (!movedOnce) {
          setMovedOnce(true); // Mark that the first move has occurred
          setTimerStarted(true); // Start the timer after first move
        }
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        if (isOverTarget()) {
          setScore(prev => {
            const newScore = prev + 1;  // Increment the score
            if (newScore > highScore) {  // If new score is greater than the current highScore
              setHighScore(newScore);  // Update high score
            }
            return newScore;  // Return the updated score
          });
          spawnNewCloud();
        }
      }
    })
  ).current;

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={Background} // Path to your background image
        style={styles.backgroundImage}
      >
        <View style={styles.gameContainer}>
          <Text style={styles.scoreText}>Score: {score}</Text>
          <Text style={styles.timerText}>Time: {timer}s</Text>
          <Text style={styles.highScoreText}>High Score: {highScore}</Text>

          {/* Sun Image (Target) */}
          <View style={styles.targetSun}>
            <Image source={Sun} style={{ width: TARGET_SIZE, height: TARGET_SIZE }} />
          </View>

          {/* Draggable Cloud (Image) */}
          <Animated.View
            style={[
              styles.draggableCloud,
              {
                width: CLOUD_SIZE,
                height: CLOUD_SIZE,
                transform: [
                  { translateX: pan.x },
                  { translateY: pan.y }
                ]
              }
            ]}
            {...panResponder.panHandlers}
          >
            <Image
              source={Cloud}  // Cloud image
              style={{ width: '100%', height: '100%' }}
            />
          </Animated.View>

          <Text style={styles.instructions}>Drag the cloud to the sun</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  gameContainer: {
    flex: 1,
    position: 'relative'
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch'
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  targetSun: {
    position: 'absolute',
    left: width / 2 - TARGET_SIZE / 2,
    top: height / 2 - TARGET_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  draggableCloud: {
    position: 'absolute'
  },
  scoreText: {
    position: 'absolute',
    top: 40,
    left: 20,
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  highScoreText: {
    position: 'absolute',
    top: 80,
    left: 20,
    fontSize: 30,
    fontWeight: 'bold',
    color: 'yellow',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  timerText: {
    position: 'absolute',
    top: 120,
    left: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: 'aqua',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  instructions: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  }
});
