const express = require("express");
const router = express.Router();
router.use(express.json());
//it is used to password hash
const bcrypt = require("bcryptjs");
const path = require("path");
//user module
const Client = require("../models/client");
const User = require("../models/user");
//jwt
const jwtoken = require("jsonwebtoken");
//moment
const nodemailer = require("nodemailer");
//file upload
const multer = require("multer");
//middelware
const authenticate = require("../middlewares/authenticate.jsx");
const { verify } = require("crypto");

router.get("/", (req, res) => {
  res.send("Hello World....Server");
});

//file upload
const storeFile = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "C:/Transport Triangle/server/Upload/Admin/");
  },
  filename: (req, res, cb) => {
    const newfilename = Date.now() + path.extname(res.originalname);
    cb(null, newfilename);
  },
});

const adminUpload = multer({ storage: storeFile });

//admin data
router.post("/regi", adminUpload.single("file"), async (req, res) => {
  const { name, email, phone, pwd, cpwd } = req.body;
  const file = req.file;
  // console.log(file.filename)
  if (!name || !email || !phone || !pwd || !cpwd || !file) {
   return res.status(422).json({ error: "plz field the data properly..." });
  }

  try {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res
        .status(422)
        .json({ error: "THis E-mail Alredy Used...Tray Another E-mail..." });
    } else if (pwd != cpwd) {
      return res
        .status(422)
        .json({ error: "Passwrod & Conform Password Note Match..." });
    } else {
      const user = new User({
        name,
        email,
        phone,
        pwd,
        cpwd,
        file: file.filename,
      });

      //password hasing
      
       //email verification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Registration For The Transport Triangle",
      html: `<h1>Hello ${name}</h1><hr/>You have successfully registered.!<br/>Your email is :-<b><u>${email}</u></b> <br/> password is :-<b><u>${pwd}</b></u> <br/> Keep save in secure  for the future used......<br/>Thank You For Registration<br><br/><hr/>`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log("Error", error);
      } else {
        console.log("Your User Name and Password Send in Your Mail...!!!");
       return res.status(201).json({
          emailMessage: "Your User Name and Password Send in Your Mail...!!!",
        });
      }
    });


      await user.save();
      return res.status(201).json({
        message: `Dear, ${name} You Have  Successfuly Registration....Youre User Name and Password Sent to Your Mail...!!!`,
      });
    }

     } catch (err) {
    console.log(err);
    res.status(401).json({ error: "Server Error..." });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    let token;
    const { email, pwd } = req.body;

    if (!email || !pwd) {
      return res.status(400).json({ error: "Plze Filled The Login Data.." });
    }

    const userLogin = await User.findOne({ email: email });
    // email cheack
    if (userLogin) {
      //password check
      const isMatch = await bcrypt.compare(pwd, userLogin.pwd);

      token = await userLogin.generateAuthToken();
      // console.log(token)

      res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 600000),
        httpOnly: true,
      });

      if (!isMatch) {
        return res.status(400).json({ error: "Password Note Match" });
      } else {
        const { pwd, cpwd, ...data } = userLogin._doc;
        res.status(200).json({
          message: ` Welcome Mr/Ms ${userLogin.name} you have Successfuly login..`,
          token,
          data,
        });
      }
    } else {
      return res.status(400).json({ error: "Email Note match..." });
    }
  } catch (error) {
    console.log(error);
  }
});

//fetch data
router.get("/fetchAdmin/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await User.findById({ _id: id });
    return res
      .status(200)
      .json({ success: true, count: data.lenght, data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//forget password
router.post("/sendLink", async (req, res) => {
  console.log(req.body);

  const { email } = req.body;
  if (!email) {
    res.status(401).json({ error: "Plz Enter Your Email... " });
  }

  try {
    //email config
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const userFind = await User.findOne({ email: email });

    //tokent genrate for reset password
    const token = jwtoken.sign({ _id: userFind }, process.env.SECRET_KEY, {
      expiresIn: 300000,
    });
    // console.log(token)

    //store token in database
    const setUserToken = await User.findByIdAndUpdate(
      { _id: userFind._id },
      { verify: token },
      { new: true }
    );
    console.log(setUserToken);

    if (setUserToken) {
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Password Reset E-mail",
        text: `this link valid in 2 minits http://localhost:3000/AdminComponent/PasswordReset/PasswordReset/${userFind._id}`,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
          res.status(401).json({ error: "email note send" });
        } else {
          console.log("Password reset link send successfuly to youre email...");
          res.status(201).json({
            message: "Password reset link send successfuly to youre email... ",
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "invalid user" });
  }
});

//veryfiy user for forget password
router.get("/findId/:id", async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  try {
    //veryfy user
    const userValid = await User.findOne({ _id: id });
    console.log(userValid);

    if (userValid) {
      res.status(201).json({ userValid });
    } else {
      res.status(401).json({ message: "User note exist" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json(error);
  }
});

//password update
router.post("/updatePwd/:id", async (req, res) => {
  const { id } = req.params;
  const { pwd } = req.body;
  console.log(id, pwd);

  try {
    //veryfiy user
    const userValid = await User.findOne({ _id: id });
    console.log(userValid);

    if (!userValid) {
      
      res.status(401).json({ message: "User note exist" });
     
    } else {
       //password update
       const newUser = await User.updateOne({ pwd: pwd });
       //  console.log(newUser)
 
       newUser.save();
       res.status(201).json({message:"Password Update"});
    }
  } catch (error) {
    console.log(error);
    res.status(401).json(error);
  }
});

//admin update
router.put("/adminUpdate/:id", async (req, res) => {
   const {id}=req.params;
   const {name,email,phone}=req.body;
 
  try {

    const data = await User.updateOne({ id, name, email, phone });

    return res.status(200).json({
      message: "Data Update success",
      success: true,
      count: data.length,
      data: data.name,
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }

});

//logout
router.get("/logout", (req, res) => {
  console.log("Logout..");
  res.clearCookie("jwtoken", { path: "/" });
  res.status(200).json({ message: "youe are logout.." });
});

module.exports = router;
