var mongoose = require("mongoose");
const bcrypt = require('bcryptjs')
var Schema = mongoose.Schema;

// Create the User schema
var userSchema = new Schema({

	username: {
		type: String,
	    trim: true,
	    unique: true,
      required: true
    },

	email: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    trim: true,
    required: true
  },

  wins: {
    type: Number
  },

  losses: {
    type: Number
  },

  totalScore: {
    type: Number
  },

  totalGames: {
    type: Number
  },

  joindate: {
     type: Date,
     default: Date.now
  }

});

// Define schema methods
userSchema.methods = {
	checkPassword: function(inputPassword) {
		return bcrypt.compareSync(inputPassword, this.password)
	},
	hashPassword: plainTextPassword => {
		return bcrypt.hashSync(plainTextPassword, 9)
	}
}

const User = mongoose.model('User', userSchema);

module.exports = User;
