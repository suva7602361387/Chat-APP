const mongoose=require("mongoose");

const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    isAdmin:{
       type:Boolean,
       require:true,
       default:false
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },
   
    about:{type:String},
    lastSeen:{type:Date},
    isOnline:{type:Boolean,default:false},
    isVerified:{type:Boolean,default:false},
    aggred:{type:Boolean,default:false},
    PhoneNumber: {
        type: Number,
        required: true,
        unique: true,
        $parse:true
    },
    
    password: {
        type: String,
        required: true,
    },
    confirmPassword: {
        type: String,
    },
    profilepic:{
        type:String,
        require:false
    },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true }); // createdAt & updatedAt

module.exports=mongoose.model("User",userSchema);