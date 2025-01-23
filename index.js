const express=require("express");
const app=express();
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const cors=require("cors");
const bodyParser = require('body-parser');
const axios = require('axios');
const jwt=require("jsonwebtoken");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors("*"));
app.use(bodyParser.json());
mongoose.connect("mongodb+srv://razaira01:Ahmadraza@cluster0.qyoat.mongodb.net/online-class").then(()=>{
    console.log("connection successful");    
}).catch((err)=>{
    console.log(err);
})

app.get("/",(req,res)=>{
    res.send("hello");
})

// user craete

const userSchema=new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "student"
    },
    password: {
        type: String,
        required: true
    },
    
   
    date: {
        type: Date,
        default: Date.now    
    }
});


const User= mongoose.model("user",userSchema);

app.post("/signup",async (req,res)=>{
    try {
        const {name,email,number,password ,role}=req.body;
    const oldemail=await User.findOne({email:email});
    if(oldemail){
        return res.json({
            success:0,
            messege: "user already exist"
        })
    }
    const passwordbcypt=await bcrypt.hash(password,10);
    const user=new User({
        name,
        email,
        number,
        password:passwordbcypt,
        role
    })
    const savedUser = await user.save();
    const data = {
         id:user._id ,
        
        }
 const usertoken = jwt.sign(data, "secret_ecom")

        res.json({success:true, user: savedUser, usertoken})
    } catch (error) {
       console.log(error);
    }
        
})


// login 

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: 0,
                message: "User does not exist",
            });
        }

        // Compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.json({
                success: 0,
                message: "Invalid password",
            });
        }


        // Generate JWT token
        const data = {
        
            id:user._id 
        
        }

        const usertoken = jwt.sign(data, "secret_ecom")

        // Respond with user details and token
        const { _id, name, number, role } = user;
        res.json({
            success: 1,
            message: "Login successful",
            user: { _id, name, email, number, role },
            usertoken,
        });
    } catch (error) {
        console.error("Error in /login:", error.message);
        res.status(500).json({ success: 0, message: "Internal server error" });
    }
});


// get all user

app.get("/students",async (req,res)=>{
    const users=await User.find();
    res.send(users);
})


// delete user
app.delete("/deleteuser/:id",async(req,res)=>{
    try {
     const {id}=req.params;
 
     const user = await User.findById(id)
     if(!user){
        return res.status(404).json({
         success :0,
         message: "Tutor is not found"
 
        })
     }
     await User.findByIdAndDelete(id)
     res.json({
         success:1,
         message:"Delete successfully"
     })
    } catch (error) {
     res.status(500).json({
         success: 0,
         message: "Internal server error",
     });
    }
 })

// teacher scheema

const tutorSchema=new mongoose.Schema({
 name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    pancardno: {
        type: String,
        required: true
    },
    adharcardno: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "tutor"
    },
    address: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        
    },
    meeting:[],
    password: {
        type: String,
        
    },
    date: {
        type: Date,
        default: Date.now    
    },
    courseData:[]
}); 

const Tutor= mongoose.model("tutor",tutorSchema);

// tutor craete

app.post("/tutorcreate",async (req,res)=>{
    const meetingdata = await ZoomData.find();
   
    
    const {name,email,number,pancardno,adharcardno,address,subject,description,meeting,password,role}=req.body;
    const oldemail=await Tutor.findOne({number:number});
    if(oldemail){
        return res.json({
            success:0,
            messege: "user already exist"
        })
    }
    const tutor=new Tutor({
        name,
        email,
        number,
        pancardno,
        adharcardno,
        address,
        subject,
        description,
        
        password,
        role,
   
    })
    const data = {
      id:tutor._id 
    }
        const savedUser=   await tutor.save();
   
    const tutortoken = jwt.sign(data, "secret_ecom")
        res.json({success:true,savedUser, tutortoken})
})


app.post("/addmeeting/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      
      const tutor = await Tutor.findById(id);
      if (!tutor) {
        return res.json({
          success: 0,
          message: "Tutor not found",
        });
      }
      const ZoomData =await ZoomData.find();
  if(ZoomData.teacherId == tutor._id){
    tutor.meeting.push(ZoomData);
    await tutor.save();
  }
      
     
  
      res.json({
        success: 1,
        message: "Meeting data added successfully",
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      res.status(500).json({
        success: 0,
        message: "An error occurred while adding the meeting data",
      });
    }
    
})

// login tutor


app.post("/tutuorlogin", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await Tutor.findOne({ email });
        if (!user) {
            return res.json({
                success: 0,
                message: "Tutor does not exist",
            });
        }

        // Compare password
        // const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!password) {
            return res.json({
                success: 0,
                message: "Invalid password",
            });
        }


        // Generate JWT token
        const data = {
        
            id:user._id 
        
        }

        const usertoken = jwt.sign(data, "secret_ecom")

        // Respond with user details and token
        const {   _id,name, 
            number,
            pancardno,
            adharcardno,
            address,
            subject,
            description,
            Country,
            State,
            City,
        
            role } = user;
        res.json({
            success: 1,
            message: "Login successful",
            user: {_id, name,
                email,
                number,
                pancardno,
                adharcardno,
                address,
                subject,
                description,
                Country,
                State,
                City,
            
                role},
            usertoken
        });
    } catch (error) {
        console.error("Error in /login:", error.message);
        res.status(500).json({ success: 0, message: "Internal server error" });
    }
});
// get all tutor

app.get("/alltutors",async (req,res)=>{
    const tutors=await Tutor.find();
    res.send(tutors);
})

// detele tutor
app.delete("/deletetutor/:id",async(req,res)=>{
   try {
    const {id}=req.params;

    const tutor = await Tutor.findById(id)
    if(!tutor){
       return res.status(404).json({
        success :0,
        message: "Tutor is not found"

       })
    }
    await Tutor.findByIdAndDelete(id)
    res.json({
        success:1,
        message:"Delete successfully"
    })
   } catch (error) {
    res.status(500).json({
        success: 0,
        message: "Internal server error",
    });
   }
})

app.post("/sharecourse/:id", async (req, res) => {
    const { id } = req.params;
    const { coursedata } = req.body; // Extract coursedata from the request body
    console.log(`Tutor ID: ${id}, Course Data ID: ${coursedata}`);
    
    try {
      const tutor = await Tutor.findById(id);
      if (!tutor) {
        return res.json({
          success: 0,
          message: "Tutor not found",
        });
      }
  
      // Push the course data into the tutor's courseData array
      tutor.courseData.push(coursedata);
      await tutor.save();
  
      res.json({
        success: 1,
        message: "Course data added successfully",
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      res.status(500).json({
        success: 0,
        message: "An error occurred while adding the course data",
      });
    }
  });
  
// course data schema

const courseSchema=new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now    
    }
});

const Course= mongoose.model("courses",courseSchema);


app.post("/createcourse",async (req,res)=>{
    const {name,email,number,subject}=req.body;
    
    const course=new Course({
        name,
        email,
        number,
        subject
    })
    await course.save();
    res.send(course);
})


// get all courses
app.get('/allcourses',async (req,res)=>{    
    const courses=await Course.find();
    res.send(courses);
})

// Delete Course data
app.delete("/deletecourse/:id",async(req,res)=>{
    try {
     const {id}=req.params;
     await Course.findByIdAndDelete(id)
     res.json({
         success:1,
         message:"Delete successfully"  
     })
    } catch (error) {
     res.status(500).json({
         success: 0,
         message: "Internal server error",
    }
     );
    }
})



// Zoom API credentials
const CLIENT_ID = "QryJ_fCJTeFBOhjsDAx2w";
const CLIENT_SECRET = "0N47I30qomfY9ywT4E9mB3fuH6547Rc9";
const ACCOUNT_ID = "MOED6Jf8TTixq5wBOUYv1g";

let accessToken = "";

// zoom meeting data store in mongodb
const meetingSchema=new mongoose.Schema({
    topic:{
        type:String,

    },
    startTime:{
        type:String
    },
    duration:{
        type:String
    },
    meetingLink:{
        type:String
    },
    teacherId:{
        type:String
    },

})

const ZoomData=mongoose.model("Meeting ",meetingSchema)
// Function to get the access token
const generateAccessToken = async () => {
  try {
    const response = await axios.post(
      'https://zoom.us/oauth/token',
      null,
      {
        params: {
          grant_type: 'account_credentials',
          account_id: ACCOUNT_ID,
        },
        headers: {
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );

    // Save the access token
    accessToken = response.data.access_token;
 

    return accessToken;
  } catch (error) {
    console.error('Error generating access token:', error.response?.data || error.message);
    throw new Error('Unable to generate access token');
  }
};



const ZOOM_API_URL = "https://api.zoom.us/v2/users/me/meetings";


app.post('/create-meeting', async (req, res) => {
  const { topic, startTime, duration , teacherId,id } = req.body;

  try {
    // Ensure we have an access token
    if (!accessToken) {
      await generateAccessToken();
    }

    const response = await axios.post(
      ZOOM_API_URL,
      {
        topic,
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration: parseInt(duration), // In minutes
       
        settings: {
          host_video: true,
          participant_video: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
//    const id= localStorage.getItem('id')
    const teacher=await Tutor.findById({_id:req.body.id})
//    const findteacher= teacher.map((teacher)=>{
//         return teacher._id
//     })
    console.log(teacher._id);
    
    const meeting=new ZoomData({
        topic,
         startTime,
          duration,
          meetingLink:req.body.meetingLink,
          teacherId:teacher._id
    })

    const savemeetingdata=await meeting.save()

    res.json({
        success:true,
      join_url: response.data.join_url,
      start_url: response.data.start_url,
      
      
      savemeetingdata
    });

    if(meeting.teacherId == teacher._id){
      teacher.meeting.push(savemeetingdata);
      await teacher.save();
    }
  }
   catch (error) {
    console.error('Error creating meeting:', error.response?.data || error.message);

    // Regenerate the access token if expired
    if (error.response?.status === 401) {
      await generateAccessToken();
      return res.status(401).send('Access token expired. Please retry.');
    }

    res.status(500).send('Error creating meeting');
  }
});

// get meeting data
app.get('/getzoommeeting',async (req,res)=>{
    const meetings=await ZoomData.find();
    try {
        res.send(meetings);
    } catch (error) {
        
    }
   
})

app.listen(4100,()=>{
    console.log("server started");
})



