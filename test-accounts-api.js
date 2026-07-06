import jwt from 'jsonwebtoken';
// Using global fetch in Node 18+

// Generate a valid token for sam user
const userId = '6a1ff7e786ffd8e71cea84d2';
const secret = 'supersecretmoneydiarykey123!';
const token = jwt.sign({ id: userId }, secret);

console.log('Testing accounts API with user:', userId);
console.log('Token:', token);
console.log('');

// Test the accounts endpoint
fetch('http://localhost:5000/api/accounts', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('Response from /api/accounts:');
  console.log(JSON.stringify(data, null, 2));
  if (Array.isArray(data)) {
    console.log('');
    console.log('SUCCESS! Found', data.length, 'accounts');
    data.forEach(acc => {
      console.log('-', acc.name, '(Balance:', acc.balance, ')');
    });
  }
})
.catch(err => {
  console.error('Error:', err.message);
});
