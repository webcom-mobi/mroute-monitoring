const isNight = function() {
    let curDate = new Date();
    let currentHours = curDate.getHours();
    return currentHours > 0 && currentHours < 7 
}


module.exports = {
    isNight
}