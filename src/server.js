require("dotenv").config();
const {connectToMongoDB} = require("./configs/dbConnection");
const http = require("http");
const PORT = process.env.PORT;
const app = require("./app");

async function startServer(){
    await connectToMongoDB();
    const server = http.createServer(app);
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
startServer().catch(error =>{
    console.error("Failed to start the server:", error);
    process.exit(1);
});