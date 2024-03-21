const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// const corsOptions = {
//   //origin: 'http://localhost:3030',
//   origin: true,
//   credentials: true,
// };
// app.use(cors(corsOptions));

app.use(cors());

const jenosizeController = require('./controllers/jenosize-controller')

app.use(bodyParser.json());

// Define your API key
const apiKey = 'AIzaSyAuUj-2rfFOQxhMPVKQSe-xI-gt3-Hrpws';

// Middleware to validate API key
const validateApiKey = (req, res, next) => {
  const providedApiKey = req.headers['api-key'];
  if (!providedApiKey || providedApiKey !== apiKey) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next(); // Proceed to the next middleware if the API key is valid
}

// place api
app.get('/places', validateApiKey, jenosizeController.places)

// game24
app.post('/calculate', validateApiKey, jenosizeController.calculate)

// login
app.post('/auth/google', validateApiKey, jenosizeController.authgoogle)
app.post('/auth/facebook', validateApiKey, jenosizeController.authfacebook)
app.post('/auth/email', validateApiKey, jenosizeController.authemail)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
