import httpMethod from "./axios-service";

export class RobotService {

  async getRobots() {
    const token = localStorage.getItem("id_token"); 
    const response = await httpMethod.get("/robots", {
      params: { token: token },
    });
    return response;
  }
  
}
