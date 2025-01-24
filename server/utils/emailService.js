const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT === '465',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async sendEmail(options) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: options.email,
                subject: options.subject,
                text: options.message,
                html: options.html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email envoyé avec succès:', info.messageId);
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            throw new Error('Échec de l\'envoi de l\'email');
        }
    }

    async sendPasswordReset(email, resetToken) {
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const message = `
            Vous recevez cet email car vous avez demandé la réinitialisation du mot de passe de votre compte Locoto.
            
            Pour définir un nouveau mot de passe, cliquez sur le lien suivant (valable 30 minutes) :
            ${resetURL}
            
            Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.
            
            Cordialement,
            L'équipe Locoto
        `;

        await this.sendEmail({
            email,
            subject: 'Réinitialisation de votre mot de passe Locoto',
            message,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
                    <p>Vous recevez cet email car vous avez demandé la réinitialisation du mot de passe de votre compte Locoto.</p>
                    <p>Pour définir un nouveau mot de passe, cliquez sur le bouton ci-dessous (valable 30 minutes) :</p>
                    <a href="${resetURL}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
                        Réinitialiser mon mot de passe
                    </a>
                    <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
                    <p>Cordialement,<br>L'équipe Locoto</p>
                </div>
            `
        });
    }
}

module.exports = new EmailService();