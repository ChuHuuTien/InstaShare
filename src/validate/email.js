
module.exports = function validateEmail(email){
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if(email.toLowerCase().match(regex)){
        return true;
    }else{
        return false;
    }
    
}
