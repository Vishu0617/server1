const mongoose=require('mongoose')

const vehicaleScema=new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  phone:{
    type:String,
    required:true,
  },
  vname:{
    type:String,
    required:true
  },
  vnumber:{
    type:String,
    required:true
  },
  capacity:{
    type:String,
    required:true
  },
  
})


const Vehicale=mongoose.model("VEHICALE",vehicaleScema);

module.exports=Vehicale

