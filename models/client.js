const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const clientScema = new mongoose.Schema({
    name: {
      type: String,
     required:true,
    },
    email: {
      type: String,
     required:true,
    },
    phone: {
      type: String,
     required:true,
    },
    pwd: {
      type: String,
     required:true,
    },
    cpwd: {
      type: String,
     required:true,
    },
    file: {
      type: String,
     required:true,
    },
    tokens: [
      {
        token: {
          type: String,
         default:true,
        },
      },
    ],
   
    verify:{
       type: String,
      default:true,
    }
  });
  
  //password hashing
  clientScema.pre("save", async function(next) {
     if(this.isModified("pwd")){
  
       this.pwd = await bcrypt.hash(this.pwd, 12);
       this.cpwd = await bcrypt.hash(this.cpwd, 12);
      }
    next();
  });
  
  // Generate Authentication Token
  clientScema.methods.generateAuthToken = async function () {
    try {
      let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
      this.tokens = this.tokens.concat({ token: token });
      await this.save();
      return token;
    } catch (error) {
      console.log(error);
    }
  };
  
  const Client = mongoose.model("CLIENT", clientScema);
  
  module.exports = Client;
  