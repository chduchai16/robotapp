export interface ApiRobotsResponse {
    robots: Record<string, string>;
    total: number;
    available: number;
    controlled: number;
    disconnected: number;
}