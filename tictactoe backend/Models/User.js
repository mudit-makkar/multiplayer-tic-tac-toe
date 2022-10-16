const mongoose=require('mongoose');

const usersSchema=new mongoose.Schema({
	username:String,
	email:String,
    password:String,
	walletAmount:{
		type:Number,
		default:500
	}
});

module.exports=mongoose.model('Users',usersSchema);