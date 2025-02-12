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

                // En-tête du document
                doc.fontSize(20).text('CONTRAT DE LOCATION', { align: 'center' });
                doc.moveDown();
                doc.fontSize(12).text(`N° ${contract.contractNumber}`, { align: 'right' });
                doc.moveDown(2);

                // Informations du propriétaire
                doc.fontSize(14).text('PROPRIÉTAIRE', { underline: true });
                if (contract.owner) {
                    doc.fontSize(12)
                        .text(`${contract.owner.firstName} ${contract.owner.lastName}`)
                        .text(`Email: ${contract.owner.email}`)
                        .text(`Téléphone: ${contract.owner.phoneNumber || 'Non spécifié'}`);
                }
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
                if (contract.vehicle) {
                    doc.fontSize(12)
                        .text(`Marque: ${contract.vehicle.brand}`)
                        .text(`Modèle: ${contract.vehicle.model}`)
                        .text(`Immatriculation: ${contract.vehicle.licensePlate}`);
                }
                doc.moveDown();

                // Détails de la location
                doc.fontSize(14).text('DÉTAILS DE LA LOCATION', { underline: true });
                doc.fontSize(12)
                    .text(`Date de début: ${new Date(contract.rental.startDate).toLocaleDateString()}`)
                    .text(`Date de fin: ${new Date(contract.rental.endDate).toLocaleDateString()}`)
                    .text(`Kilométrage initial: ${contract.rental.initialMileage} km`)
                    .text(`Kilométrage autorisé: ${contract.rental.allowedMileage || 'Illimité'} km`)
                    .text(`Niveau de carburant initial: ${contract.rental.initialFuelLevel}%`);
                doc.moveDown();

                // Conditions financières
                doc.fontSize(14).text('CONDITIONS FINANCIÈRES', { underline: true });
                doc.fontSize(12)
                    .text(`Tarif journalier: ${contract.rental.dailyRate} CHF`)
                    .text(`Caution: ${contract.rental.deposit} CHF`)
                    .text(`Montant total: ${contract.rental.totalAmount} CHF`);
                doc.moveDown(2);

                // Section des signatures
                doc.fontSize(14).text('SIGNATURES', { underline: true });
                doc.moveDown(2);

                // Définition des dimensions pour les signatures
                const pageWidth = doc.page.width - 2 * 50;
                const columnWidth = pageWidth / 2;
                const startY = doc.y;

                // Colonne de gauche - Propriétaire
                doc.fontSize(12).text('Le propriétaire:', 50, startY);
                if (contract.signatures && contract.signatures.find(s => s.party === 'owner')) {
                    const ownerSignature = contract.signatures.find(s => s.party === 'owner');
                    try {
                        const signatureData = ownerSignature.signature.split(',')[1];
                        doc.image(Buffer.from(signatureData, 'base64'), {
                            x: 50,
                            y: startY + 20,
                            fit: [columnWidth - 20, 100]
                        });
                        doc.text(`Date: ${new Date(ownerSignature.timestamp).toLocaleDateString()}`, 
                            50, 
                            startY + 130
                        );
                    } catch (error) {
                        console.error('Erreur lors du traitement de la signature du propriétaire:', error);
                        doc.text('Signature non disponible', 50, startY + 20);
                    }
                } else {
                    doc.text('________________', 50, startY + 50);
                    doc.text('Date: ________________', 50, startY + 80);
                }

                // Colonne de droite - Locataire
                doc.fontSize(12).text('Le locataire:', 50 + columnWidth, startY);
                if (contract.signatures && contract.signatures.find(s => s.party === 'renter')) {
                    const renterSignature = contract.signatures.find(s => s.party === 'renter');
                    try {
                        const signatureData = renterSignature.signature.split(',')[1];
                        doc.image(Buffer.from(signatureData, 'base64'), {
                            x: 50 + columnWidth,
                            y: startY + 20,
                            fit: [columnWidth - 20, 100]
                        });
                        doc.text(`Date: ${new Date(renterSignature.timestamp).toLocaleDateString()}`, 
                            50 + columnWidth, 
                            startY + 130
                        );
                    } catch (error) {
                        console.error('Erreur lors du traitement de la signature du locataire:', error);
                        doc.text('Signature non disponible', 50 + columnWidth, startY + 20);
                    }
                } else {
                    doc.text('________________', 50 + columnWidth, startY + 50);
                    doc.text('Date: ________________', 50 + columnWidth, startY + 80);
                }

                doc.moveDown(8);

                // Page des conditions générales
                doc.addPage();
                doc.fontSize(14).text('CONDITIONS GÉNÉRALES DE LOCATION', { underline: true });
                doc.moveDown();

                doc.fontSize(10);

                // Articles des conditions générales
                doc.text('Article 1 - ASSURANCE ET RESPONSABILITÉ')
                   .text('Le véhicule est assuré en Responsabilité Civile (RC) selon la loi suisse. Cette assurance couvre uniquement les dommages causés à des tiers. Tous les dommages subis par le véhicule loué sont entièrement à la charge du locataire. Le locataire est informé qu\'il peut souscrire une assurance complémentaire de son choix pour couvrir sa responsabilité concernant les dommages au véhicule.');
                doc.moveDown();

                doc.text('Article 2 - UTILISATION DU VÉHICULE')
                   .text('Le locataire s\'engage à utiliser le véhicule en bon père de famille et à respecter le code de la route. Le véhicule ne peut être utilisé que pour un usage privé normal et ne peut en aucun cas être sous-loué ou utilisé pour l\'apprentissage de la conduite.');
                doc.moveDown();

                doc.text('Article 3 - PANNES ET DOMMAGES')
                   .text('En cas de panne ou de dommages, le locataire doit immédiatement informer le propriétaire. Aucune réparation ne peut être effectuée sans l\'accord préalable du propriétaire. Les frais de réparation dus à une utilisation inappropriée sont à la charge du locataire.');
                doc.moveDown();

                doc.text('Article 4 - ÉTAT DU VÉHICULE ET RESTITUTION')
                   .text('Un état des lieux est effectué au départ et au retour. Le véhicule doit être restitué dans son état initial, avec le plein de carburant. Tout dommage constaté au retour sera à la charge du locataire.');
                doc.moveDown();

                doc.text('Article 5 - PAIEMENT ET CAUTION')
                   .text(`Une caution de ${contract.rental.deposit} CHF est exigée et sera restituée après vérification de l'état du véhicule, déduction faite des éventuels dommages ou frais. Le paiement intégral de la location est dû au départ.`);
                doc.moveDown();

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