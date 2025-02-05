# Localization App

## Overview

This project was developed as part of a bachelor thesis and implements a smart music-following system using indoor localization techniques. It integrates Bluetooth Low Energy (BLE), millimeter-wave (mmWave) sensors, and ESP32 devices to track and identify users, enabling seamless audio transitions across smart speakers via Home Assistant and Spotify.

## Features

- **Music Following**  
  Smart speakers dynamically adjust playback based on user location, ensuring continuous audio experiences as users move between rooms.  

- **Hybrid Localization**  
  Combines BLE for user identification and room-level detection with mmWave radar for precise desk-level tracking.  

- **User Identification**  
  Differentiates individuals within a space, enabling personalized automation and interactions.  

- **Achieved Performance**  
  - **Latency**: 943.6 ms 
  - **Accuracy (RMSE)**: 0.87 m

## Future Work

- **Context-Aware Group Playback**  
  When multiple users are detected in the same area, the system will automatically play a shared playlist created through Spotify Blend, ensuring a music experience tailored to the group.  
