const nodemailer = require('nodemailer');
const { google } = require('googleapis');

class EmailService {
    constructor() {
        console.log('Initialisation EmailService avec les configurations:', {
            clientId: process.env.GMAIL_CLIENT_ID ? 'Présent' : 'Manquant',
            clientSecret: process.env.GMAIL_CLIENT_SECRET ? 'Présent' : 'Manquant',
            refreshToken: process.env.GMAIL_REFRESH_TOKEN ? 'Présent' : 'Manquant',
            user: process.env.GMAIL_USER
        });

        this.oauth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            'http://localhost:5000/api/auth/google/callback'
        );

        console.log('Configuration OAuth2 terminée');

        this.oauth2Client.setCredentials({
            refresh_token: process.env.GMAIL_REFRESH_TOKEN
        });

        console.log('Credentials définies');
    }

    async createTransporter() {
        try {
            console.log('Tentative d\'obtention du token d\'accès...');
            const accessToken = await this.oauth2Client.getAccessToken();
            console.log('Token d\'accès obtenu');

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.GMAIL_USER,
                    clientId: process.env.GMAIL_CLIENT_ID,
                    clientSecret: process.env.GMAIL_CLIENT_SECRET,
                    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                    accessToken: accessToken.token
                }
            });

            await transporter.verify();
            console.log('Connexion au transporteur vérifiée avec succès');
            
            return transporter;
        } catch (error) {
            console.error('Erreur détaillée lors de la création du transporteur:', error);
            throw error;
        }
    }

    async sendEmail(options) {
        try {
            console.log('Création du transporteur pour l\'envoi d\'email...');
            const transporter = await this.createTransporter();
            console.log('Transporteur créé avec succès');

            const mailOptions = {
                from: `Locoto <${process.env.GMAIL_USER}>`,
                to: options.email,
                subject: options.subject,
                text: options.message,
                html: options.html,
                attachments: options.attachments
            };

            console.log('Tentative d\'envoi de l\'email à:', options.email);
            const info = await transporter.sendMail(mailOptions);
            console.log('Email envoyé avec succès:', info.messageId);
            return true;
        } catch (error) {
            console.error('Erreur détaillée lors de l\'envoi de l\'email:', error);
            throw new Error('Échec de l\'envoi de l\'email');
        }
    }

    async sendContractEmail(contract, pdfBuffer) {
        try {
            console.log('Préparation de l\'email du contrat pour:', contract.renter.email);
            const subject = `Votre contrat de location N°${contract.contractNumber}`;
            const message = `
                Bonjour ${contract.renter.firstName} ${contract.renter.lastName},

                Vous trouverez ci-joint votre contrat de location N°${contract.contractNumber}.

                Détails de la location :
                - Date de début : ${new Date(contract.rental.startDate).toLocaleDateString()}
                - Date de fin : ${new Date(contract.rental.endDate).toLocaleDateString()}
                - Montant total : ${contract.rental.totalAmount}€

                Merci de votre confiance.
                
                Cordialement,
                L'équipe Locoto
            `;

            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Votre contrat de location</h2>
                    <p>Bonjour ${contract.renter.firstName} ${contract.renter.lastName},</p>
                    <p>Vous trouverez ci-joint votre contrat de location N°${contract.contractNumber}.</p>
                    
                    <h3>Détails de la location :</h3>
                    <ul>
                        <li>Date de début : ${new Date(contract.rental.startDate).toLocaleDateString()}</li>
                        <li>Date de fin : ${new Date(contract.rental.endDate).toLocaleDateString()}</li>
                        <li>Montant total : ${contract.rental.totalAmount}CHF</li>
                    </ul>
                    
                    <p>Merci de votre confiance.</p>
                    <p>Cordialement,<br>L'équipe Locoto</p>
                </div>
            `;

            console.log('Envoi de l\'email avec le PDF joint...');
            await this.sendEmail({
                email: contract.renter.email,
                subject,
                message,
                html,
                attachments: [{
                    filename: `contrat_${contract.contractNumber}.pdf`,
                    content: pdfBuffer
                }]
            });

            console.log('Email du contrat envoyé avec succès');
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email du contrat:', error);
            throw error;
        }
    }
}

module.exports = new EmailService();