import { WebSocketService } from '@/library/services/websocket-service';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface RobotContextType {
    connectedRobotId: string | null;
    setConnectedRobotId: (robotId: string | null) => void;
    isRobotConnected: (robotId: string) => boolean;
    disconnectRobot: () => void;
    wsService: WebSocketService;
}

const RobotContext = createContext<RobotContextType | undefined>(undefined);

export function RobotProvider({ children }: { children: ReactNode }) {
    const [connectedRobotId, setConnectedRobotId] = useState<string | null>(null);
    const wsServiceRef = useRef(new WebSocketService());

    // Disconnect websocket when app goes to background or becomes inactive
    useEffect(() => {
        const handleAppStateChange = (nextState: AppStateStatus) => {
            if (nextState === 'background' || nextState === 'inactive') {
                // disconnect if connected
                if (wsServiceRef.current && wsServiceRef.current.isConnected && wsServiceRef.current.isConnected()) {
                    wsServiceRef.current.disconnect();
                    setConnectedRobotId(null);
                }
            }
        };

        const sub = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            sub.remove();
        };
    }, []);

    const isRobotConnected = (robotId: string): boolean => {
        return connectedRobotId === robotId;
    };

    const disconnectRobot = () => {
        setConnectedRobotId(null);
        wsServiceRef.current.disconnect();
    };

    return (
        <RobotContext.Provider
            value={{
                connectedRobotId,
                setConnectedRobotId,
                isRobotConnected,
                disconnectRobot,
                wsService: wsServiceRef.current,
            }}
        >
            {children}
        </RobotContext.Provider>
    );
}

export function useRobot() {
    const context = useContext(RobotContext);
    if (context === undefined) {
        throw new Error('useRobot must be used within a RobotProvider');
    }
    return context;
}
