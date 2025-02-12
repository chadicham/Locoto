const PDFDocument = require('pdfkit');

class PDFGenerator {
    static async processSignature(doc, signature, title) {
        try {
            if (signature && signature.signature) {
                doc.fontSize(12).text(title);
                try {
                    const signatureData = signature.signature.split(',')[1];
                    doc.image(Buffer.from(signatureData, 'base64'), {
                        fit: [200, 100],
                        align: 'left'
                    });
                    doc.text(`Date: ${new Date(signature.timestamp).toLocaleDateString()}`, {
                        align: 'left'
                    });
                } catch (signatureError) {
                    console.error('Erreur lors du traitement de la signature:', signatureError);
                    doc.text('Signature non disponible');
                }
            } else {
                doc.text(`${title} ________________`, { align: 'left' });
                doc.text('Date: ________________', { align: 'left' });
            }
            doc.moveDown();
        } catch (error) {
            console.error(`Erreur lors du traitement de la signature (${title}):`, error);
            doc.text(`${title} (Non disponible)`, { align: 'left' });
            doc.moveDown();
        }
    }

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

                // Signatures
                doc.fontSize(14).text('SIGNATURES', { underline: true });
                doc.moveDown(2);

                // Traitement des signatures
                if (contract.signatures && contract.signatures.length > 0) {
                    const renterSignature = contract.signatures.find(s => s.party === 'renter');
                    PDFGenerator.processSignature(doc, renterSignature, 'Signature du locataire:');
                    
                    const ownerSignature = contract.signatures.find(s => s.party === 'owner');
                    PDFGenerator.processSignature(doc, ownerSignature, 'Signature du propriétaire:');
                } else {
                    doc.fontSize(12);
                    doc.text('Signature du locataire: ________________', { align: 'left' });
                    doc.text('Date: ________________', { align: 'left' });
                    doc.moveDown(2);
                    doc.text('Signature du propriétaire: ________________', { align: 'left' });
                    doc.text('Date: ________________', { align: 'left' });
                }

                // Page des conditions générales
                doc.addPage();
                doc.fontSize(14).text('CONDITIONS GÉNÉRALES DE LOCATION', { underline: true });
                doc.moveDown();

                doc.fontSize(10);

                // Assurance et responsabilité
                doc.text('Article 1 - ASSURANCE ET RESPONSABILITÉ')
                   .text('Le véhicule est assuré en Responsabilité Civile (RC) selon la loi suisse. Cette assurance couvre uniquement les dommages causés à des tiers. Tous les dommages subis par le véhicule loué sont entièrement à la charge du locataire. Le locataire est informé qu\'il peut souscrire une assurance complémentaire de son choix pour couvrir sa responsabilité concernant les dommages au véhicule.');
                doc.moveDown();

                // Utilisation du véhicule
                doc.text('Article 2 - UTILISATION DU VÉHICULE')
                   .text('Le locataire s\'engage à utiliser le véhicule en bon père de famille et à respecter le code de la route. Le véhicule ne peut être utilisé que pour un usage privé normal et ne peut en aucun cas être sous-loué ou utilisé pour l\'apprentissage de la conduite.');
                doc.moveDown();

                // Pannes et dommages
                doc.text('Article 3 - PANNES ET DOMMAGES')
                   .text('En cas de panne ou de dommages, le locataire doit immédiatement informer le propriétaire. Aucune réparation ne peut être effectuée sans l\'accord préalable du propriétaire. Les frais de réparation dus à une utilisation inappropriée sont à la charge du locataire.');
                doc.moveDown();

                // État du véhicule et restitution
                doc.text('Article 4 - ÉTAT DU VÉHICULE ET RESTITUTION')
                   .text('Un état des lieux est effectué au départ et au retour. Le véhicule doit être restitué dans son état initial, avec le plein de carburant. Tout dommage constaté au retour sera à la charge du locataire.');
                doc.moveDown();

                // Paiement et caution
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