const bcrypt = require("bcrypt");

const hashPassword = async(password)=>{
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password,salt);
    return hash;
}
const checkPassword = async (password ,hashPassword)=>{
    return bcrypt.compare(password,hashPassword);
}
module.exports = {hashPassword,checkPassword}