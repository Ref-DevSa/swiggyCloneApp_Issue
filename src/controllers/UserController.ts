import { Utils } from "./../utils/Utils";
import User from "../models/User";
import { NodeMailer } from "./../utils/NodeMailer";

export class UserController {
    static async signup(req, res, next) {
        console.log("req: ", req);
        const name = req.body.name;
        const phone = req.body.phone;
        const email = req.body.email;
        const password = req.body.password;
        const type = req.body.type;
        const status = req.body.status;

        const data = {
            email,
            verification_token: Utils.generateVerificationToken(5),
            verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
            phone,
            password,
            name,
            type,
            status,
        };

        try {
            let user = await new User(data).save();
            // send email to user for verification
            const verificationLink = `http://localhost:3000/verify?token=${user.verification_token}&email=${user.email}`;
            const mailData = {
                to: [user.email],
                subject: 'Email Verification',
                html: `<p>Please verify your email by clicking this link: <a href="${verificationLink}">Verify Email</a></p>`,
            };
            await NodeMailer.sendMail(mailData);
            res.send(user);
        } catch (e) {
            next(e);
        }
    }

    static async verify(req, res, next) {
        const verification_token = req.body.verification_token;
        const email = req.body.email;
        try {
            const user = await User.findOneAndUpdate(
                {
                    email: email,
                    verification_token: verification_token,
                    verification_token_time: { $gt: Date.now() },
                },
                {
                    email_verified: true,
                },
                {
                    new: true,
                }
            );
            if (user) {
                res.send(user);
            } else {
                throw new Error("Email Verification Token Is Expired. Please try again...");
            }
        } catch (e) {
            next(e);
        }
    }
}