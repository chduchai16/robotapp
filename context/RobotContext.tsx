import { WebSocketService } from '@/library/services/websocket-service';
import React, { createContext, ReactNode, useContext, useRef, useState } from 'react';

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
