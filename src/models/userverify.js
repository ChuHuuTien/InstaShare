const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var current = new Date();
const timeStamp = new Date(Date.UTC(current.getFullYear(), 
current.getMonth(),current.getDate(),current.getHours(), 
current.getMinutes(),current.getSeconds(), current.getMilliseconds()));

const userVerifySchema = new Schema({
    email: { type: String, require: true, unique: true },
    otp: { type: String, required: true, min: 6 },
    expireAt: { type: Date,  expires: 60*5 , default: timeStamp } 
},{
    timestamps: true,
    collection: "userverifys",
    versionKey: false,
});
/**
 * @param {Object} userVerify
 * @returns {Object} new user object created
 */
userVerifySchema.statics.createUserVerify = async function (userVerify) {
    try {
        userVerify = new this(userVerify);
        const result = await userVerify.save()
        return result.email;
    } catch (error) {
      throw error;
    }
}

/**
 * @param {String} email - email of user
 * @return {Object} user who have this email
 */
userVerifySchema.statics.getUserVerifybyEmail = async function (email) {
    try {
      const userVerify = await this.findOne({ email: email });
      return userVerify;
    } catch (error) {
      throw error;
    }
}

userVerifySchema.statics.verifyEmail = async function (email, otp) {
    try {
      const userVerify = await this.findOne({ email: email, otp: otp });
      if(userVerify) return true;
      else return false
    } catch (error) {
      throw error;
    }
}

userVerifySchema.statics.verifySuccess = async function (email) {
  try {
    const verifySuccess = await this.deleteOne({ email: email });
    if(verifySuccess) return true;
    else return false
  } catch (error) {
    throw error;
  }
}


module.exports = mongoose.model('UserVerify', userVerifySchema);
