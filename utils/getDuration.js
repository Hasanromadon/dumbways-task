const getDuration = (enddate, startdate) => {
    const durationInSecond = ((new Date(enddate) - new Date(startdate)) + 86400000) / 1000;
    const durationInMonth = Math.floor(durationInSecond / (60 * 60 * 24 * 30));
    const durationInDay = Math.floor((durationInSecond % (60 * 60 * 24 * 30)) / (60 * 60 * 24));
    const duration = `${durationInMonth > 0 ? durationInMonth > 1 ? durationInMonth + ' Months' : '1 Month' : ''} ${durationInDay > 0 ? durationInDay > 1 ? durationInDay + ' Days' : '1 Day' : ''}`;


    if (durationInMonth > 0 || durationInDay > 0) {
        return duration;
    }
};


module.exports = getDuration;