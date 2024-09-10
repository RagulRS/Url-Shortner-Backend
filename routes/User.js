import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer'

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.json({ message: "user already existed" });
  }

  const hashpassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashpassword,
  });

  await newUser.save();
  return res.json({ status: true, message: "record registered" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "user is not registered" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.json({ message: "Pasword is incorrect" });
  }

  const token = jwt.sign({ username: user.username }, process.env.KEY, {
    expiresIn: "1h",
  });
  res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
  return res.json({ status: true, message: "Logged in Successfully" });
});

router.post('/forgot-password', async (req, res) => {
    const {email} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.json({message: "User not registered"});
        }

        const token = jwt.sign({id: user._id}, process.env.KEY, {expiresIn: '1h'});

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'joyboydrs@gmail.com',
              pass: 'kaoi nwyh qsth yxhx'
            }
          });
          // const encodedToken = encodeURIComponent(token).replace(/\./g, "%2E")  

          var mailOptions = {
            from: 'joyboydrs@gmail.com',
            to: email,
            subject: 'Reset password',
            text: `http://localhost:5173/resetPassword/${token}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                return res.json({message: "error sending email"})
            } else {
              return res.json({status: true, message: "Email sent"})
            }
          });

    }catch(err){
        console.log(err);
        
    }
})

router.post ('/reset-password/:token',async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;
    try {
        const decoded =await jwt.verify(token, process.env.KEY);
        const id = decoded.id;
        const hashpassword = await bcrypt.hash(password, 10)
        await User.findByIdAndUpdate({_id: id}, {password: hashpassword})
        return res.json({status: true, message: "Updated Password"})
    } catch (error) {
        return res.json("Invalid token")
        
    }
})
export { router as UserRouter };
