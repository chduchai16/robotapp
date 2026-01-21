# Robot App Control

Ứng dụng di động điều khiển robot từ xa qua WebSocket với tích hợp điều khiển bằng giọng nói.

## Công Nghệ

- **React Native** 0.81.5 + **Expo** SDK 54
- **TypeScript** 5.9.2
- **Firebase Authentication**
- **WebSocket** (Real-time communication)
- **Gemini AI** (Voice-to-text)
- **Expo Router** (File-based routing)

## Cài Đặt

```bash
# Clone project
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm start
```

## Cấu Hình

Tạo file `app.config.js` hoặc cấu hình trong `app.json`:

```javascript
extra: {
  geminiApiKey: "YOUR_GEMINI_API_KEY"
}
```

## Cấu Trúc Dự Án

```
app/
├── (auth)/          # Màn hình đăng nhập/đăng ký
├── (tabs)/          # Màn hình chính
│   ├── index.tsx    # Danh sách robots
│   └── control.tsx  # Điều khiển robot
context/             # State management
├── AuthContext.tsx
├── RobotContext.tsx
└── CommandHistoryContext.tsx
library/
├── services/        # Business logic
│   ├── firebase.ts
│   ├── websocket-service.ts
│   ├── voice-service.ts
│   ├── robot-service.ts
│   └── token-refresh-service.ts
└── models/          # TypeScript interfaces
```

## Chức Năng

### Authentication
- Đăng ký/Đăng nhập với Firebase
- Auto refresh token (check mỗi phút)
- Auto logout khi token hết hạn

### Quản Lý Robot
- Xem danh sách robots có sẵn
- Kết nối/ngắt kết nối robot qua WebSocket
- Pull-to-refresh danh sách

### Điều Khiển
- **Điều khiển bằng giọng nói**: Ghi âm → Gemini AI chuyển thành text → Gửi lệnh
- **Nút điều khiển nhanh**:
  - Tiến/Lùi
  - Rẽ trái/Rẽ phải
  - Nâng/Hạ
  - Dừng lại
- Lịch sử 10 lệnh gần nhất

## Command Format

```json
{
  "intent": "tien|lui|re_phai|re_trai|nang|ha|dung_lai",
  "params": {
    "distance": 1,
    "unit": "m",
    "angle": 90
  }
}
```

## API Endpoints

- **Base URL**: `https://robot.skteam.studio/api`
- **WebSocket**: `wss://robot.skteam.studio/api/ws/client/{robotId}?token={idToken}`
- **GET** `/robots?token={token}` - Lấy danh sách robots

## Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run lint       # Run ESLint
```

## Build

```bash
# Build for production
eas build --platform android
eas build --platform ios
```

## Lưu Đồ Thuật Toán

### Luồng Điều Khiển Robot (Voice + Manual Command)

```mermaid
flowchart TD
    Start([Người dùng trên Control Screen]) --> CheckType{Loại lệnh?}
    
    CheckType -->|Nhấn nút<br/>Quick Command| ManualFlow[Lệnh Manual]
    CheckType -->|Nhấn nút<br/>Microphone| VoiceFlow[Lệnh Giọng Nói]
    
    %% Manual Command Flow
    ManualFlow --> CheckRobot1{connectedRobotId<br/>có tồn tại?}
    CheckRobot1 -->|No| Alert1[Alert: Hãy kết nối robot trước]
    Alert1 --> End1([End])
    
    CheckRobot1 -->|Yes| CheckWS1{WebSocket<br/>đã kết nối?}
    CheckWS1 -->|No| Alert2[Alert: WebSocket chưa kết nối]
    Alert2 --> End2([End])
    
    CheckWS1 -->|Yes| BuildCommand[Tạo command object:<br/>{intent, params}]
    BuildCommand --> SendManual[wsService.sendCommand<br/>command, 'command']
    SendManual --> AddHistory1[addCommand to history]
    AddHistory1 --> CheckLift{Nút Nâng/Hạ?}
    CheckLift -->|Yes| ToggleState[Toggle liftState<br/>0 ↔ 1]
    CheckLift -->|No| UpdateUI1[Update UI]
    ToggleState --> UpdateUI1
    UpdateUI1 --> End3([End])
    
    %% Voice Command Flow
    VoiceFlow --> CheckRobot2{connectedRobotId<br/>có tồn tại?}
    CheckRobot2 -->|No| Alert3[Alert: Hãy kết nối robot trước]
    Alert3 --> End4([End])
    
    CheckRobot2 -->|Yes| CheckRecording{Đang recording?}
    
    CheckRecording -->|No| CheckPerm{Có quyền<br/>microphone?}
    CheckPerm -->|No| ReqPerm[Request Permission]
    ReqPerm --> PermGranted{Permission<br/>granted?}
    PermGranted -->|No| Alert4[Alert: Cần cấp quyền micro]
    Alert4 --> End5([End])
    
    PermGranted -->|Yes| StartRec[voiceService.startRecording]
    CheckPerm -->|Yes| StartRec
    StartRec --> SetRecTrue[isRecording = true]
    SetRecTrue --> ShowMicActive[UI: Icon mic active]
    ShowMicActive --> End6([Chờ user nhấn lại...])
    
    CheckRecording -->|Yes| StopRec[voiceService.stopRecording]
    StopRec --> GetAudio[Lấy audio URI]
    GetAudio --> ConvertB64[Convert to base64]
    ConvertB64 --> CallGemini[Gửi đến Gemini API]
    CallGemini --> Transcribe[Gemini transcribe<br/>audio → text]
    Transcribe --> CheckText{Text có<br/>nội dung?}
    
    CheckText -->|No| Alert5[Alert: Không nhận được giọng nói]
    Alert5 --> SetRecFalse1[isRecording = false]
    SetRecFalse1 --> End7([End])
    
    CheckText -->|Yes| CheckWS2{WebSocket<br/>đã kết nối?}
    CheckWS2 -->|No| Alert6[Alert: WebSocket chưa kết nối]
    Alert6 --> SetRecFalse2[isRecording = false]
    SetRecFalse2 --> End8([End])
    
    CheckWS2 -->|Yes| SendVoice[wsService.sendCommand<br/>text, 'text']
    SendVoice --> AddHistory2[addCommand to history]
    AddHistory2 --> SetRecFalse3[isRecording = false]
    SetRecFalse3 --> ShowMicInactive[UI: Icon mic inactive]
    ShowMicInactive --> End9([End])
    
    %% Styling
    classDef processClass fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    classDef decisionClass fill:#F5A623,stroke:#C77D00,stroke-width:2px,color:#fff
    classDef alertClass fill:#E74C3C,stroke:#C0392B,stroke-width:2px,color:#fff
    classDef startEndClass fill:#2ECC71,stroke:#27AE60,stroke-width:3px,color:#fff
    
    class ManualFlow,VoiceFlow,BuildCommand,SendManual,AddHistory1,ToggleState,UpdateUI1,StartRec,SetRecTrue,ShowMicActive,StopRec,GetAudio,ConvertB64,CallGemini,Transcribe,SendVoice,AddHistory2,SetRecFalse1,SetRecFalse2,SetRecFalse3,ShowMicInactive,ReqPerm processClass
    class CheckType,CheckRobot1,CheckWS1,CheckLift,CheckRobot2,CheckRecording,CheckPerm,PermGranted,CheckText,CheckWS2 decisionClass
    class Alert1,Alert2,Alert3,Alert4,Alert5,Alert6 alertClass
    class Start,End1,End2,End3,End4,End5,End6,End7,End8,End9 startEndClass
```

### Giải Thích Các Nhánh If-Else:

**1. Loại lệnh:**
- `if (userClickMicrophone)` → Voice Flow
- `else if (userClickQuickCommand)` → Manual Flow

**2. Voice Flow - Kiểm tra trạng thái:**
- `if (!connectedRobotId)` → Alert & Exit
- `else if (isRecording)` → Stop & Process
- `else if (!isRecording)` → Start Recording
  - `if (!hasMicPermission)` → Request → `if (!granted)` → Alert & Exit
  - `else` → Start Recording

**3. Voice Flow - Xử lý kết quả:**
- `if (text.isEmpty)` → Alert & Exit
- `else if (!wsConnected)` → Alert & Exit
- `else` → Send Command

**4. Manual Flow:**
- `if (!connectedRobotId)` → Alert & Exit
- `else if (!wsConnected)` → Alert & Exit
- `else` → Send Command
  - `if (buttonType === 'lift')` → Toggle State
  - `else` → Normal Update

## License

Private
