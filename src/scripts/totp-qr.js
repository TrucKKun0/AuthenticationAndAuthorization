const {QRCode} = require("qrcode");
const otpAuthURL = process.argv[2];
if(!otpAuthURL){
    throw new Error("Please provide the OTP Auth URL as a command-line argument.");
}
async function main(){
    await QRCode.toFile("totp.png",otpAuthURL);
    consloe.log("QR code generated and saved as totp.png");
}
main().catch(err=>{
    console.error("Error generating QR code:",err);
    process.exit(1);
})