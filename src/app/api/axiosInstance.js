import axios from "axios";

const instance = axios.create({
  baseURL: "https://greenfastfood.cocoadownload.com/api/v1",
});

export default instance;
