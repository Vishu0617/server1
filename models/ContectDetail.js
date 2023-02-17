const mongoos=require("mongoose")

const contectScema=new mongoos.Schema({
    cname:{
        type:String,
        required:true,
    },
    cemail:{
        type:String,
        required:true,
    },
    cphone:{
        type:String,
        required:true,
    },
    csub:{
        type:String,
        required:true,
    },
    msg:{
        type:String,
        required:true,
    }
})
const contectMessage=mongoos.model("CONTECT_MESSAGE",contectScema);

module.exports = contectMessage;