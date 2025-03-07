import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';

const TARGET_SIZE = 100;
const { width, height } = Dimensions.get('window');

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [color, setColor] = useState('red');
  const [originalColor, setOriginalColor] = useState('red');
  const [timer, setTimer] = useState(10);  // Timer state for countdown
  const [movedOnce, setMovedOnce] = useState(false);  // Track if the first square is moved
  const [timerStarted, setTimerStarted] = useState(false);  // Track if the timer has started

  const SQUARE_SIZE = Math.max(30, 60 - score * 5); // Dynamically adjust square size

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Function to adjust color shade based on square size
  const adjustColorShade = (color, size) => {
    const hue = getHueFromColor(color);
    const saturation = 70;
    const lightness = Math.max(30, Math.min(100, 60 + (SQUARE_SIZE - 30) * 0.5));
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Extract hue from the color
  const getHueFromColor = (color) => {
    switch(color) {
      case 'red': return 0;
      case 'blue': return 240;
      case 'green': return 120;
      case 'purple': return 270;
      case 'orange': return 30;
      default: return 0;
    }
  };

  // Spawn a new square at a random position along the edge
  const spawnNewSquare = () => {
    const side = Math.floor(Math.random() * 4);
    let startX = 0, startY = 0;

    switch (side) {
      case 0: startX = Math.random() * (width - SQUARE_SIZE); startY = 0; break;
      case 1: startX = width - SQUARE_SIZE; startY = Math.random() * (height - SQUARE_SIZE); break;
      case 2: startX = Math.random() * (width - SQUARE_SIZE); startY = height - SQUARE_SIZE; break;
      case 3: startX = 0; startY = Math.random() * (height - SQUARE_SIZE); break;
    }

    const colors = ['red', 'blue', 'green', 'purple', 'orange'];
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    setOriginalColor(newColor);
    setColor(newColor);

    pan.setValue({ x: startX, y: startY });
  };

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
      setTimerStarted(false)
      setTimer(10); // Reset timer back to 10 seconds
    }
  }, [timer, timerStarted]);

  const isOverTarget = () => {
    const squareX = pan.x.__getValue();
    const squareY = pan.y.__getValue();
    const targetX = width / 2 - TARGET_SIZE / 2;
    const targetY = height / 2 - TARGET_SIZE / 2;

    return (
      squareX < targetX + TARGET_SIZE &&
      squareX + SQUARE_SIZE > targetX &&
      squareY < targetY + TARGET_SIZE &&
      squareY + SQUARE_SIZE > targetY
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

        // Only start the timer after the first square is moved
        if (!movedOnce) {
          setMovedOnce(true); // Mark that the first move has occurred
          // setTimer(10); // Reset the timer when first moved
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
        console.log(newScore)
      }
      return newScore;  // Return the updated score
    });
    spawnNewSquare();
        }
      }
    })
  ).current;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gameContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Text style={styles.timerText}>Time: {timer}s</Text>
        <Text style={styles.highScoreText}>High Score: {highScore}</Text>

        {/* Target Square (Gray) */}
        <View style={styles.targetSquare} />

        {/* Draggable Square (Colored) */}
        <Animated.View
          style={[
            styles.draggableSquare,
            {
              backgroundColor: adjustColorShade(originalColor, SQUARE_SIZE),
              width: SQUARE_SIZE,
              height: SQUARE_SIZE,
              transform: [
                { translateX: pan.x },
                { translateY: pan.y }
              ]
            }
          ]}
          {...panResponder.panHandlers}
        />

        <Text style={styles.instructions}>Drag the colored square to the gray target</Text>
      </View>
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
  targetSquare: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    backgroundColor: 'gray',
    left: width / 2 - TARGET_SIZE / 2,
    top: height / 2 - TARGET_SIZE / 2
  },
  draggableSquare: {
    position: 'absolute'
  },
  scoreText: {
    position: 'absolute',
    top: 40,
    left: 20,
    fontSize: 24,
    fontWeight: 'bold'
  },
    highScoreText: {
    position: 'absolute',
    top: 80,
    left: 20,
    fontSize: 24,
    fontWeight: 'bold'
  },
  timerText: {
    position: 'absolute',
    top: 120,
    left: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'blue'
  },
  instructions: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20
  }
});
