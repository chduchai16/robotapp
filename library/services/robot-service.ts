import AsyncStorage from '@react-native-async-storage/async-storage';
import httpMethod from "./axios-service";
import { ApiRobotsResponse } from '../models/api-robots-response';

export class RobotService {

  async getRobots(): Promise<ApiRobotsResponse> {
    try {
      const token = await AsyncStorage.getItem("id_token");
      const response = await httpMethod.get<ApiRobotsResponse>("/robots", {
        params: { token },
      });

      return response.data; 
    } catch (error) {
      console.error("Lỗi getRobots:", error);
      throw error;
    }
  }
}
