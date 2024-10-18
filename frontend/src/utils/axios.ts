import axios from 'axios';

axios.defaults.baseURL = 'https://bridgebloc-api.up.railway.app/api/';
axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';
