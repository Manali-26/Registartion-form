const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3099;

mongoose.connect('mongodb://localhost:27017/sample', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    mobile: String,
    gender: String
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.post('/submit', (req, res) => {
    const { first, last, email, password, repassword, mobile, gender } = req.body;


    if (password !== repassword) {
        return res.status(400).send('Passwords do not match');
    }

    const newUser = new User({
        firstname: first,
        lastname: last,
        email,
        password,
        mobile,
        gender
    });


    newUser.save()
        .then(() => {
            res.send('User registered successfully!');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error registering user');
        });
});

app.post('/update', async (req, res) => {
    const { email, ...updateData } = req.body;  
  
    try {
      const existingUser = await User.findOne({ email }); 
  
      if (!existingUser) {
        return res.status(404).send('User not found');
      }
  
      const updatedUser = await User.findOneAndUpdate({ email }, updateData, { new: true });  
  
      console.log('User updated successfully:', updatedUser);
      res.send('User updated successfully!');
    } catch (err) {
        console.error('Error updating user:', err.message);
      res.status(500).send('Error updating user');
    }
  });
  


app.post('/delete', (req, res) => {
    const { email } = req.body;

    User.findOneAndDelete({ email })
        .then(() => {
            console.log('User deleted successfully!');
            res.send('User deleted successfully!');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error deleting user');
        });
});


app.get('/users', (req, res) => {
    User.find()
        .then(users => {
            console.log('Users:', users);
            res.json(users);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error fetching users');
        });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});