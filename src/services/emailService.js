const nodemailer = require('nodemailer');
const { google } = require('googleapis');

class EmailService {
  constructor() {
    console.log('Initialisation EmailService avec les configurations:', {
      clientId: process.env.GMAIL_CLIENT_ID ? 'Présent' : 'Non présent',
      clientSecret: process.env.GMAIL_CLIENT_SECRET ? 'Présent' : 'Non présent',
      refreshToken: process.env.GMAIL_REFRESH_TOKEN ? 'Présent' : 'Non présent',
      user: process.env.GMAIL_USER
    });

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    console.log('Configuration OAuth2 terminée');
  }

  async createTransporter() {
    try {
      const accessToken = await this.oauth2Client.getAccessToken();
      console.log('Credentials définies');

      return nodemailer.createTransport({
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
    } catch (error) {
      console.error('Erreur création transporteur:', error);
      throw error;
    }
  }

  async sendContractEmail(contract, pdfBuffer) {
    try {
      if (process.env.SEND_CONTRACT_EMAILS !== 'true') {
        console.log('Envoi des emails désactivé');
        return;
      }

      const transporter = await this.createTransporter();
      
      const emailContent = {
        from: process.env.GMAIL_USER,
        to: contract.renter.email,
        cc: contract.owner.email,
        subject: `Contrat de location - ${contract.vehicle.brand} ${contract.vehicle.model}`,
        html: `
          <h2>Contrat de location de véhicule</h2>
          <p>Bonjour ${contract.renter.firstName},</p>
          <p>Vous trouverez ci-joint votre contrat de location pour le véhicule ${contract.vehicle.brand} ${contract.vehicle.model}.</p>
          <p><strong>Détails de la location :</strong></p>
          <ul>
            <li>Période : du ${new Date(contract.rental.startDate).toLocaleDateString()} au ${new Date(contract.rental.endDate).toLocaleDateString()}</li>
            <li>Montant : ${contract.rental.totalAmount}CHF</li>
          </ul>
          <p>Nous vous remercions de votre confiance.</p>
          <p>Cordialement,<br>L'équipe Locoto</p>
        `,
        attachments: [
          {
            filename: `contrat_location_${contract._id}.pdf`,
            content: pdfBuffer
          }
        ]
      };

      const result = await transporter.sendMail(emailContent);
      console.log('Email envoyé avec succès');
      return result;
    } catch (error) {
      console.error('Erreur envoi email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();