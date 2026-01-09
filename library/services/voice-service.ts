// src/services/VoiceService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Audio } from "expo-av";
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';

export class VoiceService {
    private recording: Audio.Recording | null = null;
    private static instance: VoiceService | null = null;
    private geminiClient: GoogleGenerativeAI | null = null;

    private constructor() {
        const apiKey = Constants.expoConfig?.extra?.geminiApiKey;
        if (apiKey) {
            this.geminiClient = new GoogleGenerativeAI(apiKey);
        }
    }

    static getInstance(): VoiceService {
        if (!VoiceService.instance) {
            VoiceService.instance = new VoiceService();
        }
        return VoiceService.instance;
    }

    async startRecording() {
        if (this.recording) {
            try {
                await this.recording.stopAndUnloadAsync();
            } catch (e) {
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
    }

    async stopRecording(): Promise<string> {
        if (!this.recording) return "";
        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        this.recording = null;
        if (!uri) {
            return "Không có audio file";
        }

        try {
            if (!this.geminiClient) {
                throw new Error('Gemini API Key không được set. Thêm EXPO_PUBLIC_GEMINI_API_KEY vào .env');
            }
            // Convert file thành base64
            const base64Audio = await FileSystem.readAsStringAsync(uri, {
                encoding: "base64",
            });
            // Gọi Gemini API để transcribe
            const model = this.geminiClient.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent([
                {
                    inlineData: {
                        data: base64Audio,
                        mimeType: "audio/m4a",
                    },
                },
                {
                    text: "Hãy chuyển đổi nội dung audio này thành văn bản. Chỉ trả về văn bản, không có ghi chú gì thêm.",
                },
            ]);
            const transcribedText = result.response.text();
            return transcribedText;

        } catch (error: any) {
            console.error('Lỗi transcribe audio:', error);
            if (error.message?.includes('API Key')) {
                return error.message;
            }
            return "Lỗi chuyển đổi audio thành text";
        }
    }
} export default VoiceService.getInstance();
