import express from 'express'
import { Admin } from '../models/Admin.js';
import { Student } from '../models/Student.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
const router = express.Router();

/*router.post('/login',async(req,res) =>{
    const {username, password,role} =req.body;
    if(role ==='admin'){
        const admin =await Admin.findOne({username})
        if(!admin){
            res.json({message:"admin not registered"})
        }
        const validPassword =await bcrypt.compare(password,admin.password)

    }else if(role ==='')
})*/

router.post('/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (role === 'admin') {
            const admin = await Admin.findOne({ username });

            if (!admin) {
                return res.status(401).json({ message: "Admin not registered" });
            }

            const validPassword = await bcrypt.compare(password, admin.password);

            if (!validPassword) {
                return res.status(401).json({ message: "Wrong password" });
            }

            const token = jwt.sign({ username: admin.username, role: 'admin' }, process.env.Admin_key);
            res.cookie('token', token, { httpOnly: true, secure: true });

            return res.status(200).json({ login: true, role: 'admin', message: "Login successful" });
        } else if (role === 'student') {
            const student = await Student.findOne({ username });

            if (!student) {
                return res.status(401).json({ message: "student not registered" });
            }

            const validPassword = await bcrypt.compare(password, student.password);

            if (!validPassword) {
                return res.status(401).json({ message: "Wrong password" });
            }

            const token = jwt.sign({ username: student.username, role: 'student' }, process.env.Student_key);
            res.cookie('token', token, { httpOnly: true, secure: true });

            return res.status(200).json({ login: true, role: 'student', message: "Login successful" });
            // Add logic for handling student login
            return res.status(401).json({ message: "Student login not implemented" });
        } else {
            return res.status(401).json({ message: "Invalid role" });
        }
    } catch (error) {
        console.error("Error in login route:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

const verifyAdmin = (req, res ,next) => {
    const token = req.cookies.token;
    if(!token){
        return res.json({message :"Invalid Admin"})
    } else{
        jwt.verify(token,process.env.Admin_key, (err ,decoded) =>{
            if(err){
                return res.json({message:"Invalid token"})
            } else {
                req.username = decoded.username;
                req.role = decoded.role;
                next()
            }
        })
    }

}

const verifyUser = (req, res ,next) => {
    const token = req.cookies.token;
    if(!token){
        return res.json({message :"Invalid User"})
    } else{
        jwt.verify(token,process.env.Admin_key, (err ,decoded) =>{
            if(err){
                jwt.verify(token,process.env.Student_key, (err ,decoded) =>{
                    if(err){
                        return res.json({message:"Invalid token"})
                    } else {
                        req.username = decoded.username;
                        req.role = decoded.role;
                        next()
                    }
                })
                
            } else {
                req.username = decoded.username;
                req.role = decoded.role;
                next()
            }
        })
    }

}

router.get('/verify',verifyUser,(req,res) => {
    return res.json({login: true, role: req.role})

})

router.get('/logout',(req,res) => {
    res.clearCookie('token')
    return res.json({logout : true})

})

export{router as AdminRouter, verifyAdmin}