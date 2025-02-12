const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'http://localhost:5000/api/auth/google/callback'  
);

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://mail.google.com/' 
];

router.get('/', async (req, res) => {
    try {
        console.log("Route d'authentification Google accédée");
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent'
        });
        res.redirect(authUrl);
    } catch (error) {
        console.error('Erreur lors de la génération de l\'URL d\'authentification:', error);
        res.status(500).json({ error: 'Erreur lors de l\'authentification' });
    }
});

router.get('/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('Tokens reçus:', {
            access_token: tokens.access_token ? 'Présent' : 'Manquant',
            refresh_token: tokens.refresh_token ? 'Présent' : 'Manquant',
            expiry_date: tokens.expiry_date
        });
        
        if (tokens.refresh_token) {
            console.log('Refresh Token:', tokens.refresh_token);
            res.send('Token obtenu avec succès! Copiez le refresh token de la console et mettez-le dans votre fichier .env');
        } else {
            res.send('Pas de refresh token reçu. Assurez-vous d\'avoir révoqué l\'accès précédent dans votre compte Google.');
        }
    } catch (error) {
        console.error('Erreur détaillée:', error);
        res.status(500).send('Erreur lors de l\'authentification');
    }
});

module.exports = router;