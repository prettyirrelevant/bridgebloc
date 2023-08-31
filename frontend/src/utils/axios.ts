import axios from "axios";

axios.defaults.baseURL =
  "https://bridgebloc-api-eb9bd3c3ed18.herokuapp.com/api/";
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";
