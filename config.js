const isProdMode = process.env.NODE_ENV === 'production'

const API_URL = isProdMode ? '' : 'http://localhost:3000';
const WDS_URL = 'http://localhost:3001';
const WDS_PORT = 3001;

module.exports = {
  API_URL,
  WDS_URL,
  WDS_PORT
};