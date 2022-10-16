const mongoose=require("mongoose");
const users=require("./User");
const games=require("./Game");

const invitationsSchema=new mongoose.Schema(
    {
        From:{
            type:mongoose.Schema.Types.ObjectId,
            ref:users,
            default:null
        },
        To:{
            type:mongoose.Schema.Types.ObjectId,
            ref:users,
            default:null
        },
        Game:{
            type:mongoose.Schema.Types.ObjectId,
            default:null,
            ref:games
        }
    }
);
module.exports=mongoose.model("Invitations",invitationsSchema);