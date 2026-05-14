const { hashPassword, checkPassword } = require("../../lib/hash");
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require("../../lib/token");
const {sendEmail} = require("../../lib/email");
const User = require("../../models/userModel");
const {registerSchema,loginSchema} = require("./authSchema");
const crypto = require("crypto");
const {OAuth2Client} = require("google-auth-library");

const jwt = require("jsonwebtoken");

function getAppUrl() {
  return process.env.APP_URL || `http://localhost:${process.env.PORT}`;
}

function getGoogleClient(){
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;
if(!clientId || !clientSecret || !redirectUri){
  throw new Error("Google client credentials are not set in environment variables");  

}
return new OAuth2Client(clientId,clientSecret,redirectUri);
}

const registerHandler = async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid data!",
        errors: result.error.flatten(),
      });
    }
    const { name, email, password } = result.data;

    const normailzedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normailzedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User is already registerd with that email",
      });
    }
    const passwordHash = await hashPassword(password);

    const newlyCreatedUser = await User.create({
      email: normailzedEmail,
      passwordHash: passwordHash,
      isEmailVerified: false,
      twoFactorEnabled: false,
      name,
    });

    const verifyToken = jwt.sign(
      {
        sub: newlyCreatedUser._id,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: "1d",
      },
    );

    const verifyUrl = `${getAppUrl()}/auth/verify-email/?token=${verifyToken}`;
    await sendEmail(
      newlyCreatedUser.email,
      "Verify your email",
      `
            <p>Please verify your email using this link:</p>
            <p> <a href ="${verifyUrl}"</a> ${verifyUrl} </p>
            `,
    );

    return res.status(201).json({
      success: true,
      message: "User registred successfully",
      user: {
        id: newlyCreatedUser._id,
        email: newlyCreatedUser.email,
        role: newlyCreatedUser.role,
        isEmailVerified: newlyCreatedUser.isEmailVerified,
      },
    });
  } catch (error) {
    console.log("Error :" + error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const verifyEmailHandler = async (req, res) => {
  const token = req.query.token || undefined;
  if (!token) {
    return res.status(404).json({
      success: false,
      message: "Verification is missing",
    });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) {
      console.log("User is not found");

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }
    user.isEmailVerified = true;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Email is verified successfully",
    });
  } catch (error) {
    console.log(erorr);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const loginHandler = async (req, res) => {
  try {
     const result = loginSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                success :false,
                message : "Invalid data!",
                errors : result.error.flatten()
            })
        }
        const{ email,password} = result.data;
         const normailzedEmail = email.toLowerCase().trim();
        const user = await User.findOne({email : normailzedEmail});
        if(!user){
            console.log("Invalid email or password");
            
            return res.status(404).json({
                success : true,
                message : "Invalid email or password"
            })
        }
        const samePassword = await checkPassword(password , user.passwordHash);
        if(!samePassword){
            return res.status(400).json({
                success : false,
                message : "Invalid email or password"
            })
        }
        if(!user.isEmailVerified){
            return res.status(403).json({
                success : false,
                message : "Please verify your email before logging in."
            })
        }
        const accessToken = createAccessToken(user._id,user.role,user.tokenVersion);

        const refreshToken = createRefreshToken(user._id,user.tokenVersion);
        const isProd = process.env.NODE_ENV || "production";
        res.cookie("refreshToken", refreshToken,{
            httpOnly:true,
            secure : isProd,
            sameSite : "lax",
            maxAge : 7 * 24 * 60 * 60 * 100
        });

        return res.status(200).json({
            success : true,
            accessToken,
            user:{
                id : user._id,
                email : user.email,
                role : user.role,
                isEmailVerified : user.isEmailVerified,
                twoFactorEnabled : user.twoFactorEnabled
            }
        })

  } catch (error) {
    console.log(error);
    
    return res.status(500).json({
        success : false,
        message : "Internal Server Error"
    }) 
  }
};

const refreshHandler = async (req,res)=>{
  try{
    const token = req.cookies? refreshToken : undefined;
    if(!token){
      return res.status(401).json({
        success : false,
        message : "Refresh Token is missing. Please login again."
      });
    }
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.sub);
    if(!user){
      return res.status(404).json({
        success : false,
        message : "User not found"
      })
    }
    if(user.tokenVversion !== payload.tokenVersion){
      return res.status(401).json({
        success : false,
        message : "Token is expired. Please login again."
      });
    }
    const newAccessToken = createAccessToken(user._id,user.role,user.tokenVersion);
    const newRefreshToken = createRefreshToken(user._id,user.tokenVersion);
    const isProd = process.env.NODE_ENV || "production";
    res.cookie("refreshToken", newRefreshToken,{
      httpOnly:true,
      secure : isProd,
      sameSite : "lax",
      maxAge : 7 * 24 * 60 * 60 * 100
    });
    return res.status(200).json({
      success : true,
      accessToken : newAccessToken,
      message : "Token refreshed successfully",
      user :{
        id : user._id,
        email : user.email,
        role : user.role,
        isEmailVerified : user.isEmailVerified,
        twoFactorEnabled : user.twoFactorEnabled
      }
    });
  }catch(error){
    console.log(error);
    
  }
}

const logoutHandler = async (req,res)=>{
  res.clearCookie("refreshToken",{path : "/"});
  return res.status(200).json({
    success : true,
    message : "Logged out successfully"
  })
}
const forgetPasswordHandler = async (req,res)=>{
  const {email} = req.body;
  if(!email){
    return res.status(400).json({
      success : false,
      message : "Email is required"
    })
  }
  const normailzedEmail = email.toLowerCase().trim();
  try{

    const user = await User.findOne({email : normailzedEmail});
    if(!user){
      return res.status(404).json({
        success : false,
        message : "If email is registered, you will receive a password reset link shortly."
      })
    }
    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = await crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordToken = tokenHash;
    user.resetPasswordToken = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const reseturl = `${getAppUrl()}/auth/reset-password?token=${rawToken}`;
    await sendEmail(user.email,"Reset your password",`
      <p>You requested for password reset. Please use the link below to reset your password. This link is valid for 15 minutes.</p>
      <p><a href="${reseturl}">${reseturl}</a></p>
    `);
    return res.status(200).json({
      success : true,
      message : "If email is registered, you will receive a password reset link shortly."
    })


  }catch(error){
    console.log(error);
    return res.status(500).json({
      success : false,
      message : "Internal Server Error"
    })
    
  }
}
const resetPasswordHandler = async (req,res)=>{
  const {token,pasword} = req.body;
  if(!token || !pasword){
    return res.status(400).json({
      success : false,
      message : "Token and new password are required"
    })
  }
  try{
    const tokenHash = await crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken : tokenHash,
      resetPasswordTokenExpire : {$gt : new Date()} //resetPasswordTokenExpire should be greater than current date

      });

      if(!user){
        return res.status(400).json({
          success : false,
          message : "Invalid or expired token"
        })
      }

      const newPasswordhash = await hashPassword(pasword);
      user.passwordHash = newPasswordhash;
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpire = undefined;
      user.tokenVersion = user.tokenVersion + 1; 
      await user.save();
      return res.status(200).json({
        success : true,
        message : "Password reset successfully"
      })

  }catch(error){
    console.log(error);
    return res.status(500).json({
      success : false,
      message : "Internal Server Error"
    })
  }
}

const googleAuthStartHandler = async (req,res)=>{
  try{

    const client = getGoogleClient();
    const url = client.generateAuthUrl({
      access_type : "offline",
      prompt : "consent",
      scope : ["openid","profile","email"]
    })
    return res.redirect(url);

  }catch(error){
    console.log(error);
    return res.status(500).json({
      success : false,
      message : "Internal Server Error"
    })
  }
}
const googleAuthCallbackHandler = async (req,res)=>{
  const code = req.query.code || undefined;
  if(!code){
    return res.status(400).json({
      success : false,
      message : "Missing code from Google"
    });
  }
  try{
    const client = getGoogleClient();
    const {tokens} = await client.getToken(code);
    if(!tokens.id_token){
      return res.status(400).json({
        success : false,
        message : "Google did not return an id token"
      })
    }

    //verify the id token and get user info from it
    const ticket = await client.verifyToken({
      idToken : tokens.id_token,
      audience : process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload();
    const email = payload.email;
    const emailVerified = payload.email_verified;
    if(!email || !emailVerified){
      return res.status(400).json({
        success : false,
        message : "Google account does not have a verified email"
      })
    }
    const normailzedEmail = email.toLowerCase().trim();
    let user = await User.findOne({email : normailzedEmail});
    if(!user){
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const passwordHash = await hashPassword(randomPassword);
      user = await User.create({
        email : normailzedEmail,
        passwordHash,
        isEmailVerified : true,
        twoFactorEnabled : false,
        name : payload.name || "No Name",
        role : "user"
      });

      const accessToken = createAccessToken(user._id,user.role,user.tokenVersion);
      const refreshToken = createRefreshToken(user._id,user.tokenVersion);
      const isProd = process.env.NODE_ENV || "production";
        res.cookie("refreshToken", refreshToken,{
            httpOnly:true,
            secure : isProd,
            sameSite : "lax",
            maxAge : 7 * 24 * 60 * 60 * 100
        });

        return res.status(200).json({
            success : true,
            accessToken,
            user:{
                id : user._id,
                email : user.email,
                role : user.role,
                isEmailVerified : user.isEmailVerified,
            },
            message : "Logged in with Google successfully"
        });

    }else{
      if(!user.isEmailVerified){
        user.isEmailVerified = true;
        await user.save();
      }
    }

  }catch(error){
    console.log(error);
    return res.status(500).json({
      success : false,
      message : "Internal Server Error"
    })
  }
}

module.exports = {
  registerHandler,
  verifyEmailHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  forgetPasswordHandler,
  resetPasswordHandler,
  googleAuthStartHandler,
  googleAuthCallbackHandler
};
