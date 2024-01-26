if(!firstName || typeof firstName !== 'string' || firstName.trim().length===0){
    isBodyValid = false;
    errors['firstName'] = 'This should be a tring & not empty'
}
if(!lastName || typeof lastName !== 'string' || lastName.trim().length===0){
    isBodyValid = false;
    errors['lastName'] = 'This should be a tring & not empty'
}
if(!userType || typeof userType !== 'string' || userType.trim().length===0){
    isBodyValid = false;
    errors['userType'] = 'This should be a tring & not empty'
}else{
    const checks = ['user','admin','support'];
    const found = checks.some(check => check===userType);
    if(!found){
        isBodyValid = false;
        errors['userType'] = 'This can have these values: ' +checks.join(', ');
    }
}

if(!isBodyValid){
    return resizeBy.status(400).json({
        success: isBodyValid,
        errors,
    })
}