const formatLongDate = (dateValue) => {
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const date = new Date(dateValue);

    return `${date.getDate()} ${month[date.getMonth()]} ${date.getFullYear()}`

};

module.exports = formatLongDate;