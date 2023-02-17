//jwt
const jwt = require("jsonwebtoken");
//user module
const User = require("../models/user");

const authenticate = async (req,res,next) => {

  try {

    const token=req.cookie.jwtoken;
    const veryfytoken=jwt.verify(token,process.env.SECRET_KEY);

    const userDetail= await User.findOne({_id:veryfytoken._id,"tokens.token":token})

    if(!userDetail){
        throw new  Error ("user note found")
    }
    
    req,token=token;
    req.userDetail=userDetail;
    req.userID=userDetail._id;

    next();
    
  } catch (error) {
    res.status(401).send("Unauthorized: no token provide");
      console.log(error);
  }

};

module.exports = authenticate;
