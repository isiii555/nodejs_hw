//Function to encrypt

const bcrypt = require("bcrypt");
const salt = 10;

const hashPassword = async (password) => {
    let data = await bcrypt.hash(password,salt)
    .then(hash => {
        return hash;
    })
    .catch((err) => {
        console.log(err);
    });
    return data;
};

const comparePassword = async (password,hash) => {
    let data = await bcrypt.compare(password,hash)
    .then(result => result)
    .catch(err => console.log(err));
    return data;
};

module.exports = {
    comparePassword,
    hashPassword
}
