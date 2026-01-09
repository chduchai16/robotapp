export class WebSocketService {
    private ws: WebSocket | null = null;
    private wsListeners: Map<string, Function[]> = new Map();
    // Kết nối WebSocket đến robot
    connect(url: string, robotId: string) {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(url);
                let resolved = false;

                this.ws.onopen = () => {
                    resolved = true;
                    this.emit('connected', { robotId, timestamp: Date.now() });
                    resolve({ status: 'connected', robotId });
                };
                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.emit('message', data);
                    } catch (e) {
                        console.error('Lỗi parse WebSocket message:', e);
                    }
                };
                this.ws.onerror = (error) => {
                    console.error('Lỗi WebSocket:', error);
                    this.emit('error', error);
                    if (!resolved) {
                        resolved = true;
                        reject(error);
                    }
                };
                this.ws.onclose = () => {
                    this.emit('disconnected', { robotId, timestamp: Date.now() });
                    this.ws = null;
                    if (!resolved) {
                        resolved = true;
                        reject(new Error('WebSocket đã đóng trước khi kết nối thành công'));
                    }
                };
            } catch (error) {
                console.error('Lỗi kết nối WebSocket:', error);
                reject(error);
            }
        });
    }

    // Gửi lệnh qua WebSocket
    sendCommand( params?: any , type : string = 'command') {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            const error = 'WebSocket không sẵn sàng';
            console.error(error);
            throw new Error(error);
        }
        if(type === 'command') {
            this.ws.send(JSON.stringify(params));
        }
        else {
            this.ws.send(params);
        }
    }

    // Đóng kết nối WebSocket
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    // Kiểm tra trạng thái kết nối
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    // Lắng nghe sự kiện WebSocket
    on(event: string, callback: Function) {
        if (!this.wsListeners.has(event)) {
            this.wsListeners.set(event, []);
        }
        this.wsListeners.get(event)?.push(callback);
    }

    // Bỏ lắng nghe sự kiện
    off(event: string, callback: Function) {
        const listeners = this.wsListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    // Phát sự kiện (internal use)
    private emit(event: string, data: any) {
        const listeners = this.wsListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }

    // Xóa tất cả listeners
    clearListeners() {
        this.wsListeners.clear();
    }
}
