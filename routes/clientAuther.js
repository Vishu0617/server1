const express = require("express");
const router = express.Router();
router.use(express.json());
//it is used to password hash
const bcrypt = require("bcryptjs");
const path = require("path");
//user module
const Client = require("../models/client");
//clientmessge
const contectMessage = require("../models/ContectDetail");
//vehicale
const Vehicale=require('../models/vehicale')
//jwt
const jwtoken = require("jsonwebtoken");
//nodemailer
const nodemailer = require("nodemailer");
//file upload
const multer = require("multer");

//register
const clientFile = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "C:/Transport Triangle/server/Upload/User/");
  },
  filename: (req, res, cb) => {
    const clientNewFile = Date.now() + path.extname(res.originalname);
    cb(null, clientNewFile);
  },
});

const clientUpload = multer({ storage: clientFile });

router.post("/clientRegi", clientUpload.single("file"), async (req, res) => {
  const { name, email, phone, pwd, cpwd } = req.body;
  const file = req.file;
  // console.log(req.body);
  // console.log(req.file.originalname)
  if (!name || !email || !phone || !pwd || !cpwd || !file) {
    return res.status(422).json({ error: "plz field the data properly..." });
  }

  try {
    const clientExit = await Client.findOne({ email: email });
    if (clientExit) {
      return res
        .status(422)
        .json({ error: "This email alredy used..tray another email...." });
    } else if (pwd != pwd) {
      return res
        .status(4200)
        .json({ error: "Password & Conform Password Dosen't Match ..." });
    } else {
      const client = new Client({
        name,
        email,
        phone,
        pwd,
        cpwd,
        file: file.filename,
      });

      //password hashing

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
        subject: "Registration For The Transport Triangle Client Side",
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

      await client.save();
      return res.status(201).json({
        message: ` Dear, ${name} you have successfuly register.......Youre User Name and Password Sent to Your Mail...!!!`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Server Error..." });
  }
});

//login
router.post("/clientLogin", async (req, res) => {
  try {
    let token;
    const { email, pwd } = req.body;
    console.log(req.body);
    if (!email || !pwd) {
      return res.status(400).json({ error: "Plze Filled The Login Data.." });
    }

    const clientFind = await Client.findOne({ email: email });
    //check email alredy used or note
    if (clientFind) {
      const isMatch = await bcrypt.compare(pwd, clientFind.pwd);

      token = await clientFind.generateAuthToken();
      console.log(token);

      res.cookie("clientJWToken", token, {
        expires: new Date(Date.now() + 600000),
        httpOnly: true,
      });
      //password compare
      if (!isMatch) {
        return res.status(400).json({ error: "Password Note Match" });
      } else {
        const { pwd, cpwd, ...data } = clientFind._doc;
        res.status(200).json({
          message: ` Welcome Dear,
                    ${clientFind.name} you have Successfuly login..`,
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

router.get("/fetchData/:id", async (req, res) => {
  const { id } = req.params;
  // console.log(id);

  try {
    const data = await Client.findById({ _id: id });

    return res
      .status(200)
      .json({ success: true, count: data.lenght, data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/fetachAll", async (req, res) => {
  try {
    const data = await Client.find();
    if (data === "") {
      res.status(400).json({ error: "Table is empty" });
    }
    // console.log(data)
    return res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//update data
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  try {
    const data = await Client.updateOne({ name, email, phone });

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

router.delete("/deleteClient/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const data = await Client.findByIdAndDelete({ _id: id });
    return res.status(200).json({ message: "Delete data", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//update file
const editClientFile = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "C:/Transport Triangle/server/Upload/User/");
  },
  filename: (req, res, cb) => {
    const clientNewFile = Date.now() + path.extname(res.originalname);
    cb(null, clientNewFile);
  },
});

const editClientUpload = multer({ storage: editClientFile });

router.post(
  "/updateFile/:id",
  editClientUpload.single("file"),
  async (req, res) => {
    const { id } = req.params;
    const file = req.file;

    console.log(file);
    console.log(id);

    try {
      const data = await Client.updateOne({ file });
      return res.status(200).json({
        message: "File Update success",
        success: true,
        count: data.length,
        data: data.name,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  }
);

//add vehicale
router.post("/addVehicale",async (req,res)=>{
  const {name,phone,vname,vnumber,capacity}=req.body;
  // console.log(req.body)
  if(!name|| !phone || !vname || !vnumber || !capacity){
    return res.status(422).json({ error: "plz field the data properly..." });
  }
  try {

    const addVehicale=new Vehicale({name,phone,vname,vnumber,capacity})
    await addVehicale.save();
    return res.status(201).json({
      message: `Thank you...`,
      data:addVehicale
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
})

router.get("/fetchVehicacle",async(req,res)=>{
  try {

    const data = await Vehicale.find();
    if (data === "") {
      res.status(400).json({ error: "Table is empty" });
    }
    // console.log(data)
    return res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" }); 
  }
})

router.post("/clientMessage", async (req, res) => {
  const { cname, cemail, cphone, msg } = req.body;
  console.log(req.body);

  if (!cname || !cemail || !cphone || !msg) {
    return res.status(422).json({ error: "plz field the data properly..." });
  }

  try {
    const clientData = new contectMessage({ cname, cemail, cphone, msg });

    await clientData.save();

    return res.status(201).json({
      message: `Thank you for youre suggestion`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//CLIENT MESSAGE FETCH
router.get("/messageFetch", async (req, res) => {
  try {
    const data = await contectMessage.find();
    return res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

//CLIENT MESSAGE DELETE
router.delete("/messageDelete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await contectMessage.findByIdAndDelete({ _id: id });
    return res.status(200).json({ message: "Delete data", data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
