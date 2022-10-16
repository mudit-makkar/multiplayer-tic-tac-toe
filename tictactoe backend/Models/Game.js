const mongoose=require("mongoose");
const users=require("./User");
const invitations=require("./Invitation");
const gamesSchema=new mongoose.Schema(
    {
        Player1:{
            type:mongoose.Schema.Types.ObjectId,
            ref:users,
            default:null
        },
        Player2:{
            type:mongoose.Schema.Types.ObjectId,
            ref:users,
            default:null
        },
        NumberOfRounds:{
            type:Number
        },
        Rounds:{
            type:Array
        },
        Winner:{
            type:String,
            default:null
        },
        Mode:{
            type:String,
        },
        BetAmount:{
            type:Number
        }
    }
)
module.exports=mongoose.model("Games",gamesSchema);