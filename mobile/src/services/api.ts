import axios from 'axios';

const api = axios.create({
  baseURL: 'http://172.27.65.100:3333'
});

export default api;