const PDFDocument = require('pdfkit');

class PDFGenerator {
    static async generateContractPDF(contract) {
        return new Promise((resolve, reject) => {
            try {
                console.log('Début de la génération du PDF pour le contrat:', contract.contractNumber);
                
                const doc = new PDFDocument({
                    size: 'A4',
                    margin: 50
                });

                const buffers = [];
                doc.on('data', buffer => buffers.push(buffer));
                doc.on('end', () => {
                    console.log('Génération du PDF terminée');
                    resolve(Buffer.concat(buffers));
                });

                // En-tête
                doc.fontSize(20).text('CONTRAT DE LOCATION', { align: 'center' });
                doc.moveDown();
                doc.fontSize(12).text(`N° ${contract.contractNumber}`, { align: 'right' });
                doc.moveDown(2);

                // Informations du propriétaire
                doc.fontSize(14).text('PROPRIÉTAIRE', { underline: true });
                doc.fontSize(12)
                    .text(`${contract.owner.firstName} ${contract.owner.lastName}`)
                    .text(`Email: ${contract.owner.email}`)
                    .text(`Téléphone: ${contract.owner.phoneNumber}`);
                doc.moveDown();

                // Informations du locataire
                doc.fontSize(14).text('LOCATAIRE', { underline: true });
                doc.fontSize(12)
                    .text(`${contract.renter.firstName} ${contract.renter.lastName}`)
                    .text(`Email: ${contract.renter.email}`)
                    .text(`Téléphone: ${contract.renter.phone}`)
                    .text('Adresse:')
                    .text(`${contract.renter.address.street}`)
                    .text(`${contract.renter.address.postalCode} ${contract.renter.address.city}`);
                doc.moveDown();

                // Informations du véhicule
                doc.fontSize(14).text('VÉHICULE', { underline: true });
                doc.fontSize(12)
                    .text(`Marque: ${contract.vehicle.brand}`)
                    .text(`Modèle: ${contract.vehicle.model}`)
                    .text(`Immatriculation: ${contract.vehicle.licensePlate}`);
                doc.moveDown();

                // Détails de la location
                doc.fontSize(14).text('DÉTAILS DE LA LOCATION', { underline: true });
                doc.fontSize(12)
                    .text(`Date de début: ${new Date(contract.rental.startDate).toLocaleDateString()}`)
                    .text(`Date de fin: ${new Date(contract.rental.endDate).toLocaleDateString()}`)
                    .text(`Kilométrage initial: ${contract.rental.initialMileage} km`)
                    .text(`Kilométrage autorisé: ${contract.rental.allowedMileage} km`)
                    .text(`Niveau de carburant initial: ${contract.rental.initialFuelLevel}%`);
                doc.moveDown();

                // Conditions financières
                doc.fontSize(14).text('CONDITIONS FINANCIÈRES', { underline: true });
                doc.fontSize(12)
                    .text(`Tarif journalier: ${contract.rental.dailyRate} €`)
                    .text(`Caution: ${contract.rental.deposit} €`)
                    .text(`Montant total: ${contract.rental.totalAmount} €`);
                doc.moveDown(2);

                // Signatures
                doc.fontSize(14).text('SIGNATURES', { underline: true });
                doc.moveDown();
                doc.fontSize(12)
                    .text('Le propriétaire:', { continued: true })
                    .text('                    ', { underline: true })
                    .text('Date:', { continued: true })
                    .text('                    ', { underline: true });
                doc.moveDown();
                doc.text('Le locataire:', { continued: true })
                    .text('                    ', { underline: true })
                    .text('Date:', { continued: true })
                    .text('                    ', { underline: true });

                // Pied de page
                doc.fontSize(8)
                    .text(`Document généré le ${new Date().toLocaleString()}`, {
                        align: 'center',
                        bottom: 30
                    });

                // Finalisation du document
                doc.end();

            } catch (error) {
                console.error('Erreur lors de la génération du PDF:', error);
                reject(error);
            }
        });
    }
}

module.exports = PDFGenerator;