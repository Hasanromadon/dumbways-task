module.exports = formatFormDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB').split('/').reverse().join('-');
}