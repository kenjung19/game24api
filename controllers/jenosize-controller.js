
const axios = require('axios');
const admin = require('firebase-admin');
const serviceAccount = require('../loginapp-8adae-firebase-adminsdk-gct4p-1a643cfd97.json'); // Update with the path to your service account key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

function permutations(nums) {
  if (nums.length === 1) return [nums];

  const result = [];
  for (let i = 0; i < nums.length; i++) {
    const currentNum = nums[i];
    const remainingNums = nums.slice(0, i).concat(nums.slice(i + 1));
    const perms = permutations(remainingNums);
    perms.forEach(perm => {
      result.push([currentNum].concat(perm));
    });
  }
  return result;
}

function evaluateExpression(perm) {
  const ops = ['+', '-', '*', '/'];
  for (let op1 of ops) {
    for (let op2 of ops) {
      for (let op3 of ops) {
        const expr = `(${perm[0]} ${op1} ${perm[1]}) ${op2} (${perm[2]} ${op3} ${perm[3]})`;
        try {
          const result = eval(expr);
          if (result === 24) {
            return expr;
          }
        } catch (error) {
          // Ignore division by zero and other errors
        }
      }
    }
  }
  return null;
}

function calculate(req, res) {
  const numbers = req.body.numbers;

  if (!numbers || numbers.length !== 4) {
    return res.status(400).json({ error: 'Please provide exactly 4 numbers in the request.' });
  }

  const perms = permutations(numbers);
  let solution = null;
  for (let perm of perms) {
    solution = evaluateExpression(perm);
    if (solution) {
      break;
    }
  }

  if (solution) {
    res.status(200).json({ result: 'YES' });
  } else {
    res.status(404).json({ result: 'NO' });
  }
}

async function places(req, res) {
  const { query } = req.query;

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query,
        key: 'AIzaSyAuUj-2rfFOQxhMPVKQSe-xI-gt3-Hrpws',
      },
    });
    const places = response.data.results.map(place => ({
      name: place.name,
      address: place.formatted_address,
      location: place.geometry.location,
    }));
    res.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function authgoogle(req, res) {
  const { tokenId } = req.body;
  try {
    const credential = admin.auth.GoogleAuthProvider.credential(tokenId);
    const userCredential = await admin.auth().signInWithCredential(credential);
    const userInfo = userCredential.user.toJSON();
    res.json({ userInfo });
  } catch (error) {
    console.error('Error signing in with Google:', error);
    res.status(401).json({ error: 'Unauthorized Google' });
  }
}

async function authfacebook(req, res) {
  const { accessToken } = req.body;
  try {
    const credential = admin.auth.FacebookAuthProvider.credential(accessToken);
    const userCredential = await admin.auth().signInWithCredential(credential);
    const userInfo = userCredential.user.toJSON();
    res.json({ userInfo });
  } catch (error) {
    console.error('Error signing in with Facebook:', error);
    res.status(401).json({ error: 'Unauthorized Facebook' });
  }
}

async function authemail(req, res) {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    // Sign in the user using the provided email and password
    await admin.auth().updateUser(userRecord.uid, { password });
    res.json({ message: 'User signed in successfully' });
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(401).json({ error: 'Unauthorized Email' });
  }
}

module.exports = { calculate, places, authgoogle, authfacebook, authemail }