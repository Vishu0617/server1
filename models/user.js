const mongoose = require("mongoose");
//password hashing
const bcrypt = require("bcryptjs");
//jwt
const jwt = require("jsonwebtoken");

const userScema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  pwd: {
    type: String,
    required: true,
  },
  cpwd: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        default: true,
      },
    },
  ],
 
  verify:{
     type: String,
     default: true,
  }
});

//password hashing
userScema.pre("save", async function(next) {
   if(this.isModified("pwd")){

     this.pwd = await bcrypt.hash(this.pwd, 12);
     this.cpwd = await bcrypt.hash(this.cpwd, 12);
    }
  next();
});

//Generate Authentication Token
userScema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};

const User = mongoose.model("USER", userScema);

module.exports = User;
