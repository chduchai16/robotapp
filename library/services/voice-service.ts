// src/services/VoiceService.ts
import { Audio } from "expo-av";

export class VoiceService {
    private recording: Audio.Recording | null = null;
    private static instance: VoiceService | null = null;

    private constructor() { }

    static getInstance(): VoiceService {
        if (!VoiceService.instance) {
            VoiceService.instance = new VoiceService();
        }
        return VoiceService.instance;
    }

    async startRecording() {
        // Cleanup Recording cũ nếu có
        if (this.recording) {
            try {
                await this.recording.stopAndUnloadAsync();
            } catch (e) {
                console.log('Cleanup recording cũ:', e);
            }
            this.recording = null;
        }

        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

        this.recording = new Audio.Recording();
        await this.recording.prepareToRecordAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        await this.recording.startAsync();
        console.log('Bắt đầu ghi âm...');
    }

    async stopRecording(): Promise<string> {
        if (!this.recording) return "";

        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        this.recording = null;

        if (!uri) {
            console.log('Không có audio file');
            return "";
        }

        console.log('Audio file saved:', uri);
        return uri;
    }
} export default VoiceService.getInstance();
