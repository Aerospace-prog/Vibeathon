"use client";

import { useState, useEffect, useRef } from "react";
import EmotionIndicator from "./EmotionIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Clock, BarChart3 } from "lucide-react";

interface Emotion {
  emotion_type: string;
  confidence_score: number;
  timestamp?: string;
}

interface EmotionStats {
  total_detections: number;
  distribution: Record<string, number>;
  last_emotion: Emotion | null;
  stats: Array<{
    emotion_type: string;
    detection_count: number;
    avg_confidence: number;
    last_detected: string;
  }>;
}

interface RealTimeEmotionAnalyzerProps {
  userId: string;
  consultationId?: string;
  autoConnect?: boolean;
}

export function RealTimeEmotionAnalyzer({
  userId,
  consultationId,
  autoConnect = false
}: RealTimeEmotionAnalyzerProps) {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>({
    emotion_type: "neutral",
    confidence_score: 0.65
  });
  const [stats, setStats] = useState<EmotionStats>({
    total_detections: 0,
    distribution: {},
    last_emotion: null,
    stats: []
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  const wsUrl = backendUrl.replace("http", "ws");

  // Fetch initial stats on mount
  useEffect(() => {
    fetchStats();
  }, [userId]);

  // Auto-connect if specified
  useEffect(() => {
    if (autoConnect) {
      connectWebSocket();
    }
    return () => {
      disconnectWebSocket();
    };
  }, [autoConnect, userId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/emotions/stats/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        
        // Update current emotion if we have a last emotion
        if (data.last_emotion) {
          setCurrentEmotion({
            emotion_type: data.last_emotion.emotion_type,
            confidence_score: data.last_emotion.confidence_score,
            timestamp: data.last_emotion.created_at
          });
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    const ws = new WebSocket(`${wsUrl}/ws/emotions/${userId}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      
      // Request initial stats
      ws.send(JSON.stringify({ type: "get_stats" }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === "emotion_logged") {
        // Update current emotion
        setCurrentEmotion(message.data);
        
        // Refresh stats
        fetchStats();
      } else if (message.type === "stats_update") {
        setStats(message.data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    wsRef.current = ws;
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  };

  const sendEmotion = async (emotion: Emotion) => {
    // Send via WebSocket if connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "emotion_update",
        data: {
          ...emotion,
          consultation_id: consultationId
        }
      }));
    } else {
      // Fallback to HTTP API
      try {
        await fetch(`${backendUrl}/api/emotions/log`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            emotion_type: emotion.emotion_type,
            confidence_score: emotion.confidence_score,
            consultation_id: consultationId
          })
        });
        
        // Update local state
        setCurrentEmotion(emotion);
        
        // Refresh stats
        await fetchStats();
      } catch (error) {
        console.error("Error logging emotion:", error);
      }
    }
  };

  const startSimulation = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    
    const emotions = [
      { emotion_type: "calm", confidence_score: 0.82 },
      { emotion_type: "anxious", confidence_score: 0.75 },
      { emotion_type: "neutral", confidence_score: 0.68 },
      { emotion_type: "distressed", confidence_score: 0.78 },
      { emotion_type: "calm", confidence_score: 0.85 },
      { emotion_type: "pain", confidence_score: 0.72 },
      { emotion_type: "sad", confidence_score: 0.70 },
      { emotion_type: "anxious", confidence_score: 0.80 },
      { emotion_type: "calm", confidence_score: 0.88 }
    ];
    
    let index = 0;
    
    simulationIntervalRef.current = setInterval(() => {
      sendEmotion(emotions[index]);
      index = (index + 1) % emotions.length;
    }, 3000);
  };

  const stopSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setIsSimulating(false);
  };

  const testEmotion = (emotionType: string, confidence: number) => {
    sendEmotion({
      emotion_type: emotionType,
      confidence_score: confidence
    });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className={`h-5 w-5 ${isConnected ? "text-green-500 animate-pulse" : "text-gray-400"}`} />
          <span className="text-sm font-medium">
            {isConnected ? "Real-time Connected" : "Offline Mode"}
          </span>
        </div>
        <div className="flex gap-2">
          {!isConnected ? (
            <Button onClick={connectWebSocket} size="sm">
              Connect Real-time
            </Button>
          ) : (
            <Button onClick={disconnectWebSocket} variant="outline" size="sm">
              Disconnect
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="live">Live Analysis</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          {/* Current Emotion Display */}
          <Card>
            <CardHeader>
              <CardTitle>Current Emotion State</CardTitle>
              <CardDescription>
                Real-time emotion detection from patient audio
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <EmotionIndicator
                emotion={{
                  type: currentEmotion.emotion_type as any,
                  confidence: currentEmotion.confidence_score
                }}
              />
            </CardContent>
          </Card>

          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
              <CardDescription>
                Simulate different emotional states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => testEmotion("calm", 0.82)}
                  variant="outline"
                  className="border-green-500 hover:bg-green-50"
                >
                  😌 Calm
                </Button>
                <Button
                  onClick={() => testEmotion("anxious", 0.75)}
                  variant="outline"
                  className="border-orange-500 hover:bg-orange-50"
                >
                  😰 Anxious
                </Button>
                <Button
                  onClick={() => testEmotion("distressed", 0.78)}
                  variant="outline"
                  className="border-red-500 hover:bg-red-50"
                >
                  😫 Distressed
                </Button>
                <Button
                  onClick={() => testEmotion("pain", 0.72)}
                  variant="outline"
                  className="border-red-600 hover:bg-red-50"
                >
                  😣 Pain
                </Button>
                <Button
                  onClick={() => testEmotion("sad", 0.70)}
                  variant="outline"
                  className="border-gray-500 hover:bg-gray-50"
                >
                  😢 Sad
                </Button>
                <Button
                  onClick={() => testEmotion("neutral", 0.65)}
                  variant="outline"
                  className="border-gray-400 hover:bg-gray-50"
                >
                  😐 Neutral
                </Button>
              </div>

              <div className="flex gap-2">
                {!isSimulating ? (
                  <Button onClick={startSimulation} className="flex-1">
                    <Activity className="mr-2 h-4 w-4" />
                    Start Live Simulation
                  </Button>
                ) : (
                  <Button onClick={stopSimulation} variant="destructive" className="flex-1">
                    Stop Simulation
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Detections
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_detections}</div>
                <p className="text-xs text-muted-foreground">
                  Emotion analyses performed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Most Common
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {Object.entries(stats.distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Object.entries(stats.distribution).sort((a, b) => b[1] - a[1])[0]?.[1].toFixed(1) || 0}% of time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Last Updated
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {stats.last_emotion?.emotion_type || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.last_emotion?.timestamp 
                    ? new Date(stats.last_emotion.timestamp).toLocaleTimeString()
                    : "No data yet"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Emotion Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Emotion Distribution</CardTitle>
              <CardDescription>
                Breakdown of detected emotions over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.distribution)
                  .sort((a, b) => b[1] - a[1])
                  .map(([emotion, percentage]) => (
                    <div key={emotion} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{emotion}</span>
                        <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                {Object.keys(stats.distribution).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No emotion data yet. Start testing to see statistics!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
              <CardDescription>
                Per-emotion analysis metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.stats.map((stat) => (
                  <div
                    key={stat.emotion_type}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {stat.emotion_type}
                      </Badge>
                      <div className="text-sm">
                        <div className="font-medium">{stat.detection_count} detections</div>
                        <div className="text-muted-foreground">
                          Avg confidence: {(stat.avg_confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(stat.last_detected).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {stats.stats.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No detailed statistics available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
