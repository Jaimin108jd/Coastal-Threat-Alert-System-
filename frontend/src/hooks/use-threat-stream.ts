import { useEffect, useState, useCallback, useRef } from 'react';

interface ThreatData {
    threatType: string;
    data: any;
    prediction?: any;
    timestamp: string;
    region: string;
}

interface ThreatUpdate {
    type: 'threat_update' | 'initial_data' | 'heartbeat';
    threatType?: string;
    data?: any;
    prediction?: any;
    timestamp: string;
    region?: string;
}

interface UseThreatStreamOptions {
    region?: string;
    onThreatUpdate?: (data: ThreatData) => void;
    onConnectionChange?: (connected: boolean) => void;
}

export function useThreatStream(options: UseThreatStreamOptions = {}) {
    const [threatData, setThreatData] = useState<Record<string, ThreatData>>({});
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [connectionAttempts, setConnectionAttempts] = useState(0);

    const { region = "Gujarat Coast", onThreatUpdate, onConnectionChange } = options;

    // Function to send threat data to WebSocket API
    const sendThreatData = useCallback(async (threatType: string, data: any) => {
        try {
            const response = await fetch('/api/websocket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    threatType,
                    data,
                    region
                })
            });

            if (!response.ok) {
                console.error(`Failed to send ${threatType} data:`, response.status);
            }
        } catch (error) {
            console.error(`Error sending ${threatType} data:`, error);
        }
    }, [region]);

    // Function to establish SSE connection
    const connect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        try {
            console.log('🔗 Establishing SSE connection...');
            const eventSource = new EventSource('/api/websocket?subscribe=true');
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                console.log('✅ SSE connection established');
                setIsConnected(true);
                setConnectionAttempts(0);
                onConnectionChange?.(true);
            };

            eventSource.onmessage = (event) => {
                try {
                    const update: ThreatUpdate = JSON.parse(event.data);
                    setLastUpdate(new Date());

                    if (update.type === 'threat_update' && update.threatType) {
                        const threatUpdate: ThreatData = {
                            threatType: update.threatType,
                            data: update.data,
                            prediction: update.prediction,
                            timestamp: update.timestamp,
                            region: update.region || region
                        };

                        setThreatData(prev => ({
                            ...prev,
                            [update.threatType!]: threatUpdate
                        }));

                        onThreatUpdate?.(threatUpdate);
                        console.log(`📊 Received ${update.threatType} update with prediction:`, update.prediction);
                    }

                    if (update.type === 'initial_data' && Array.isArray(update.data)) {
                        const initialData: Record<string, ThreatData> = {};
                        update.data.forEach((threat: ThreatData) => {
                            initialData[threat.threatType] = threat;
                        });
                        setThreatData(initialData);
                        console.log('📦 Received initial threat data:', Object.keys(initialData));
                    }
                } catch (error) {
                    console.error('❌ Error parsing SSE message:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('🚨 SSE connection error:', error);
                setIsConnected(false);
                onConnectionChange?.(false);

                // Implement exponential backoff for reconnection
                const backoffDelay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
                setConnectionAttempts(prev => prev + 1);

                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log(`🔄 Attempting to reconnect... (attempt ${connectionAttempts + 1})`);
                    connect();
                }, backoffDelay);
            };

        } catch (error) {
            console.error('❌ Failed to create SSE connection:', error);
            setIsConnected(false);
            onConnectionChange?.(false);
        }
    }, [region, onThreatUpdate, onConnectionChange, connectionAttempts]);

    // Disconnect function
    const disconnect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        setIsConnected(false);
        onConnectionChange?.(false);
        console.log('🔌 SSE connection closed');
    }, [onConnectionChange]);

    // Auto-connect on mount
    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    // Health check function
    const getHealthStatus = useCallback(async () => {
        try {
            const response = await fetch('/api/websocket');
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return null;
        }
    }, []);

    return {
        threatData,
        isConnected,
        lastUpdate,
        connectionAttempts,
        sendThreatData,
        connect,
        disconnect,
        getHealthStatus,
        // Individual threat data getters
        cycloneData: threatData.cyclone,
        stormSurgeData: threatData.stormSurge,
        pollutionData: threatData.pollution,
        coastalErosionData: threatData.coastalErosion
    };
}
