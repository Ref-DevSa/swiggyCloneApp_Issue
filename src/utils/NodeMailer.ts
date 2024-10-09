import * as nodemailer from "nodemailer";
import { getEnvironmentVariables } from "../environments/environment";

export class NodeMailer {
    private static initiateTransport() {
        const { gmail_auth } = getEnvironmentVariables();

        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: gmail_auth.user,
                pass: gmail_auth.pass,
            },
        });
    }

    static async sendMail(data: { to: string[], subject: string, html: string }): Promise<any> {
        const { gmail_auth } = getEnvironmentVariables();

        try {
            const transporter = NodeMailer.initiateTransport();
            const info = await transporter.sendMail({
                from: gmail_auth.user,
                to: data.to,
                subject: data.subject,
                html: data.html,
            });

            console.log('Email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}