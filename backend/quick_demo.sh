#!/bin/bash

# Quick Demo Script for Emotion Analyzer
# This script runs the quick test to show all emotion scenarios

echo ""
echo "============================================================"
echo "  EMOTION ANALYZER - QUICK DEMO"
echo "============================================================"
echo ""
echo "Running automated test of all emotion scenarios..."
echo ""

# Run the demo with option 2 (quick test)
cd "$(dirname "$0")"
echo "2" | ./venv/bin/python3 demo_emotion_analyzer.py

echo ""
echo "Demo complete! To run the full interactive demo, use:"
echo "  ./venv/bin/python3 demo_emotion_analyzer.py"
echo ""
