import axios from 'axios'

const axiosClient = axios.create({
  baseURL: "http://localhost:3000", //backend is url par host he
  withCredentials:true,  // me apane browser ko bata raha hu ki cookies ko attach kar dena
  headers: { 'Content-Type':'application/json' }, //jo me data bhej rha hu vo json format me hoga
});

export default axiosClient;