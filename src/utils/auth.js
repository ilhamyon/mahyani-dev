import { message } from "antd";
import axios from 'axios';

const isBrowser = typeof window !== "undefined"; // Check if running in the browser

export const getToken = () => {
  return isBrowser ? localStorage.getItem("token") : null;
};

export const clearToken = () => {
  isBrowser && localStorage.removeItem("token");
};

export const deauthUser = () => {
	message.loading("Please wait...", 1).then(async () => {
	try {
        clearToken();
        localStorage.removeItem('baznas_token');
        localStorage.removeItem('baznas_user');
        localStorage.removeItem('baznas_typeUser');
        localStorage.removeItem('baznas_id');
        localStorage.removeItem('baznas_userData');
        window.location.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
	})
}

export const isAuthenticated = () => {
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem("baznas_token");
    return !!token;
  } else {
    // Handle the case where localStorage is not available
    return false;
  }  
};

export const instance = axios.create({
  baseURL: 'https://mahyani.amayor.id/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});