const express = require('express')
const Vonage = require('@vonage/server-sdk')
const mongoose = require("mongoose")
const User = require("./model/User")
var bodyParser = require('body-parser')
const nodemailer = require("nodemailer")
require("dotenv").config();
const cors = require("cors")
const app = express()
const port = process.env.PORT || 8000;
const db = process.env.URL_DB
const apiKey = process.env.API_KEY
const apiSecret = process.env.API_SECRET

app.use(express.json())
app.use(cors())
app.use(bodyParser.json())
const vonage = new Vonage({
  apiKey: apiKey,
  apiSecret: apiSecret
})

mongoose.connect(db,{useNewUrlParser: true, useUnifiedTopology: true})

app.get("/", (req, res) => {
  res.json("Hello World");
});

app.post("/send-email", function(req, response){
  var from = req.body.from
  var to = req.body.to
  var subject = req.body.subject
  var message = req.body.message

  var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'marriageorbit@gmail.com',
        pass: 'bootebtqihewpufp'
      }
  })

  var mailOptions = {
      from: from,
      to:to,
      subject:subject,
      text:message
  }

  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
          console.log(error)
      } else {
          console.log("Email Sent: " + info.response)
      }
      response.redirect("/")
  })  
})

// Start Sms Send

app.post("/send-verify",async(req,res)=>{
    const from = "CP-MARRIAGE"
    const text = 'Congratulations, your account has been successfully created.'
    const to = req.body.to 
    vonage.message.sendSms(from,to,text, (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            if(responseData.messages[0]['status'] === "0") {
                console.log("Message sent successfully.",responseData);
            } else {
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
            }
        }
    })
    res.json({message:"Success"})
})

// End

app.post("/send-otp",async(req,res)=>{ 
    vonage.verify.request({
        number:`+91${req.body.number}`,
        brand: "Marrige"
      }, (err, result) => {
        if (err) {
          res.status(404).send({"status":"Error","message":"Enter correct Number"})
        } else {
          const verifyRequestId = result.request_id;
          res.status(200).send({"status":"Success","message":"OTP Send","id":verifyRequestId})
        }
      });
})


app.post('/check-code', (req, res) => {
  vonage.verify.check(
      {
          request_id:req.body.id,
          code:req.body.code,
      },
      (err, result) => {
          if (err) {
            console.log(err);
            res.status(404).send({"status":"Error","message":"Not valid Otp"})
          } else {
            console.log(result);
            res.status(200).send({"status":"Success","message":"verify Done"})
          }
      }
  );
});

app.post("/verify-cancel",(req,res)=>{
    vonage.verify.control({
        request_id: REQUEST_ID,
        cmd: 'cancel'
      }, (err, result) => {
        if (err) {
          console.error(err);
        } else {
          console.log(result);
        }
      });
      res.json({message:"verify cancel"})
})






app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
})