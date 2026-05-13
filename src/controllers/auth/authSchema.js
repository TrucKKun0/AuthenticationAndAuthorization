const z = require("zod");

const registerSchema = z.object({
    email : z.email(),
    password : z.string().min(6),
    name : z.string().min(3)
});

const loginSchema = z.object({
    email : z.email(),
    password : z.string().min(6)
})

module.exports = {registerSchema,loginSchema};