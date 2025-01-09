import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendContractEmail = async (contractData, pdfBuffer) => {
  const emailContent = {
    from: process.env.EMAIL_USER,
    to: contractData.renterEmail,
    cc: contractData.ownerEmail,
    subject: `Contrat de location - ${contractData.vehicle.brand} ${contractData.vehicle.model}`,
    html: `
      <h2>Contrat de location de véhicule</h2>
      <p>Bonjour ${contractData.renterName},</p>
      <p>Vous trouverez ci-joint votre contrat de location pour le véhicule ${contractData.vehicle.brand} ${contractData.vehicle.model}.</p>
      <p><strong>Détails de la location :</strong></p>
      <ul>
        <li>Période : du ${new Date(contractData.startDate).toLocaleDateString()} au ${new Date(contractData.endDate).toLocaleDateString()}</li>
        <li>Montant : ${contractData.rentalAmount}€</li>
      </ul>
      <p>Nous vous remercions de votre confiance.</p>
      <p>Cordialement,<br>L'équipe Locoto</p>
    `,
    attachments: [
      {
        filename: `contrat_location_${contractData.id}.pdf`,
        content: pdfBuffer
      }
    ]
  };

  return transporter.sendMail(emailContent);
};