const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendEmail");
const User = require("../models/auth.model");
const jwt = require('jsonwebtoken');
const transporter = require("../config/mailer");
const getDataUri = require('../utils/datauri');
const cloudinary = require('../utils/cloudinary')


exports.register = async (req, res) => {
    const { firstname, lastname, email, password, role, subscription } = req.body;

    if (!firstname || !lastname || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered. Please login.' });
        }

        const salt = await bcrypt.genSalt(12)
        const hashedPassword = await bcrypt.hash(password, salt)

        const emailVerificationToken = crypto.randomBytes(32).toString('hex')
        const emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Random avatar
        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        let assignedRole = 'user';
        let assignedSubscription = false;

        const isAdminRequest = role || subscription !== undefined;

        if (isAdminRequest) {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({
                    message: 'Only admins can assign roles or subscriptions'
                });
            }

            if (['admin', 'moderator', 'user'].includes(role)) {
                assignedRole = role;
            }

            assignedSubscription = subscription === true;
        }

        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role: assignedRole,
            subscription: assignedSubscription,
            isVerified: false,
            emailVerificationToken,
            emailVerificationTokenExpires,
            profilePic: randomAvatar
        });
        await newUser.save()
        await sendVerificationEmail(email, firstname, emailVerificationToken);

        res.status(201).json({ message: 'Registration successful. Please check your email for verification.' })



    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
}

exports.verifyEmail = async (req, res) => {
    const { token, email } = req.query;
    if (!token || !email) {
        return res.status(400).json({ message: "Invalid or missing verification link parameters." });
    }

    try {
        const user = await User.findOne({
            email: email,
            emailVerificationToken: token,
            emailVerificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Verification link is invalid or expired." });
        }
        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;

        await user.save();

        // Send success response
        return res.status(200).json({ message: "Email verified successfully. You can now login." });

    } catch (error) {
        console.error("Email verification error:", error);
        return res.status(500).json({ message: "Internal server error during verification." });
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'User Not Found Please Register' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email before logging in..', success: false });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // JWT time — create token with user id and role
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' })

        // Send token as HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // only over HTTPS in prod
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        });
        res.status(200).json({ message: 'Login successful!', token, userId: user._id, role: user.role, success: true })

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
}

exports.logout = (req, res) => {
    // Clear the 'token' cookie by setting it to empty and expired
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Expire immediately
        secure: process.env.NODE_ENV === 'production', // Secure in prod
        sameSite: 'lax', // Adjust per your CORS config
    });
    res.status(200).json({ message: 'Logged out successfully' });
}

exports.sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 300000; // 5 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send Email with OTP
        const mailOptions = {
            from: `"Book Vault Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Reset Your Book Vault Password 🛠️`,
            html: `
          <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 25px; border-radius: 10px; max-width: 500px; margin: auto;">
            <h2 style="color: #333;">Password Reset Request 🔐</h2>
            <p>Hi ${user.firstname},</p>
            <p>We received a request to reset your Book Vault password.</p>
            <p><strong>Your OTP is:</strong></p>
            <div style="font-size: 28px; font-weight: bold; background-color: #fff; padding: 15px; border-radius: 5px; text-align: center; border: 2px dashed #a0522d; color: #a0522d;">${otp}</div>
            <p style="margin-top: 20px;">This OTP is valid for <strong>10 minutes</strong>. Please don’t share it with anyone.</p>
            <p>If you didn’t request a password reset, you can safely ignore this email.</p>
            <p style="margin-top: 30px;">— Book Vault Team 📚</p>
          </div>
        `,
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent to your email.' });

    } catch (error) {
        console.error('Error finding user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }

}

exports.verifyResetOTP = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user || !user.otp || !user.otpExpires) {
            return res.status(400).json({ message: "OTP not requested or invalid user." });
        }
        const isOtpExpired = user.otpExpires < Date.now();
        if (isOtpExpired) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }

        // otp is valid
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();


        res.status(200).json({ message: "OTP verified successfully." });
    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({ message: "Server error during OTP verification." });
    }
}

exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({ message: 'Email and new password are required' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password and remove OTP fields
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Server error during password reset." });
    }
}

exports.updateProfile = async (req, res) => {

    try {
        const userId = req.user._id; // from authMiddleware
        const { firstname, lastname, nativeLanguage, learningLanguage, location } = req.body;

        const profilePicture = req.files && req.files.profilePicture ? req.files.profilePicture[0] : null;

        let cloudResponse;
        if (profilePicture) {
            const fileUri = getDataUri(profilePicture)
            cloudResponse = await cloudinary.uploader.upload(fileUri)
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user details
        if (firstname) user.firstname = firstname;
        if (lastname) user.lastname = lastname;
        if (nativeLanguage) user.nativeLanguage = nativeLanguage;
        if (learningLanguage) user.learningLanguage = learningLanguage;
        if (location) user.location = location;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully!',
            user,
            success: true
        });

    } catch (error) {
        console.error('Edit Profile Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });

    }
}

exports.getUserById = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId).select('-password -otp -otpExpires -emailVerificationToken -emailVerificationTokenExpires');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


// controllers/auth.controller.js
exports.getCurrentUser = async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ status: "fail", message: "No token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) return res.status(404).json({ status: "fail", message: "User not found" });

        return res.status(200).json({
            status: "success",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                isVerified: user.isVerified
            }
        });

    } catch (err) {
        return res.status(401).json({ status: "fail", message: "Invalid token" });
    }
};
