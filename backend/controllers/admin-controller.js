import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//--------------------------------------Adding an admin----------------------------------------------
export const addAdmin = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email && email.trim() === "" && !password && password.trim() === "") {
        return res.status(422).json({ message: "Invalid Inputs" });
    }

    let existingAdmin;
    try {
        existingAdmin = await Admin.findOne({ email });
    } catch (err) {
        return console.log(err);
    }

    if (existingAdmin) {
        return res.status(400).json({ message: "Admin already exists" });
    }

    let admin;
    const hashedPassword = bcrypt.hashSync(password);
    try {
        admin = new Admin({ email, password: hashedPassword });
        admin = await admin.save();
    } catch (err) {
        return console.log(err);
    }
    if (!admin) {
        return res.status(500).json({ message: "Unable to store admin" });
    }
    return res.status(201).json({ admin });
};

//--------------------------------------Login an admin----------------------------------------------
export const adminLogin = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email && email.trim() === "" && !password && password.trim() === "") {
        return res.status(422).json({ message: "Invalid Inputs" });
    }
    let existingAdmin;
    try {
        existingAdmin = await Admin.findOne({ email });
    } catch (err) {
        return console.log(err);
    }
    if (!existingAdmin) {
        return res.status(400).json({ message: "Admin not found" });
    }
    const isPasswordCorrect = bcrypt.compareSync(
        password,
        existingAdmin.password
    );

    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Incorrect Password" });
    }

    const token = jwt.sign({ id: existingAdmin._id }, process.env.SECRET_KEY, {
        expiresIn: "7d",
    });

    return res
        .status(200)
        .json({ message: "Authentication Complete", token, id: existingAdmin._id });
};

//--------------------------------------get all admin----------------------------------------------
export const getAdmins = async (req, res, next) => {
    let admins;
    try {
        admins = await Admin.find();
    } catch (err) {
        return console.log(err);
    }
    if (!admins) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
    return res.status(200).json({ admins });
};

//--------------------------------------get an admin by id----------------------------------------------
export const getAdminById = async (req, res, next) => {
    const id = req.params.id;

    let admin;
    try {
        admin = await Admin.findById(id).populate("addedMovies");
    } catch (err) {
        return console.log(err);
    }
    if (!admin) {
        return console.log("Cannot find Admin");
    }
    return res.status(200).json({ admin });
};
