const mongoose = require("mongoose");
const author = require("./routes/auther");
const clientAuther=require("./routes/clientAuther")
const express = require("express");
const cors =require("cors")
const app = express();



require("dotenv").config();

app.use(express.static("Upload/Admin"));
app.use(express.static("Upload/User"));
app.use(express.static("Upload/Vehicale")); 
//databse connection
const DB = process.env.DATABASE;
const PORT=process.env.PORT || 3001;

mongoose
  .connect(DB)
  .then(() => {
    app.listen(PORT, () => {
      console.log("server start");
    });
    console.log("Database connection success..");
  })
  .catch((err) => console.log(err,{err:"no connection"}));

  app.use(express.json())
  app.use(cors({origin:'http://localhost:3000',credentials:true}));


app.use("/", author);
app.use("/",clientAuther)



