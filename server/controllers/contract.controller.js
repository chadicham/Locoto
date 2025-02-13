const mongoose = require('mongoose');
const Contract = require('../models/contract.model');
const Vehicle = require('../models/vehicle.model');
const cloudinary = require('../config/cloudinary');
const PDFGenerator = require('../utils/pdfGenerator');
const EmailService = require('../utils/emailService');
const fs = require('fs').promises;


exports.getContracts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, startDate, endDate, vehicleId } = req.query;

        const query = { owner: userId };

        if (status) query.status = status;
        if (startDate || endDate) {
            query['rental.startDate'] = {};
            if (startDate) query['rental.startDate'].$gte = new Date(startDate);
            if (endDate) query['rental.startDate'].$lte = new Date(endDate);
        }
        if (vehicleId) query.vehicle = vehicleId;

        const contracts = await Contract.find(query)
            .populate('vehicle', 'brand model licensePlate')
            .sort({ createdAt: -1 });

        res.json(contracts);
    } catch (error) {
        console.error('Erreur lors de la récupération des contrats:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des contrats' });
    }
};

exports.getContractById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const contract = await Contract.findOne({ _id: id, owner: userId })
            .populate('vehicle', 'brand model licensePlate images')
            .populate('owner', 'firstName lastName email phoneNumber');

        if (!contract) {
            return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        res.json(contract);
    } catch (error) {
        console.error('Erreur lors de la récupération du contrat:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du contrat' });
    }
};

exports.createContract = async (req, res) => {
    try {
        const userId = req.user.id;
        let contractData;
        
        try {
            contractData = typeof req.body.contractData === 'string' 
                ? JSON.parse(req.body.contractData) 
                : req.body.contractData;
        } catch (error) {
            return res.status(400).json({ error: 'Format de données invalide' });
        }

        // Vérification de l'existence d'un contrat similaire
        const existingContract = await Contract.findOne({
            owner: userId,
            vehicle: contractData.vehicle,
            'rental.startDate': new Date(contractData.rental.startDate),
            'rental.endDate': new Date(contractData.rental.endDate),
            'renter.email': contractData.renter.email,
            createdAt: {
                $gte: new Date(Date.now() - 60000) // Dernière minute
            }
        });

        if (existingContract) {
            return res.json(existingContract);
        }

        // Recherche du véhicule
        const vehicle = await Vehicle.findOne({ 
            _id: contractData.vehicle,
            owner: userId
        });

        if (!vehicle) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        // Création et sauvegarde du contrat
        const contractToSave = {
            ...contractData,
            owner: userId,
            requestId: contractData.requestId,
            documents: [],
            status: 'draft',
            rental: {
                ...contractData.rental,
                startDate: new Date(contractData.rental.startDate),
                endDate: new Date(contractData.rental.endDate),
                initialMileage: parseInt(contractData.rental.initialMileage),
                allowedMileage: parseInt(contractData.rental.allowedMileage),
                initialFuelLevel: parseInt(contractData.rental.initialFuelLevel || 100),
                dailyRate: parseInt(contractData.rental.dailyRate),
                deposit: parseInt(contractData.rental.deposit || 0),
                totalAmount: parseInt(contractData.rental.totalAmount)
            }
        };

        delete contractToSave._id;

        try {
            console.log('Début de la création du contrat');
            // Création du contrat
            const contract = new Contract(contractToSave);
            const savedContract = await contract.save();
            console.log('Contrat sauvegardé avec succès:', savedContract._id);

            // Mise à jour du véhicule
            await Vehicle.findByIdAndUpdate(
                vehicle._id,
                { currentRental: savedContract._id },
                { new: true, runValidators: true }
            );
            console.log('Véhicule mis à jour avec le nouveau contrat');

            // Récupération du contrat avec les données complètes
            const populatedContract = await Contract.findById(savedContract._id)
                .populate('vehicle', 'brand model licensePlate')
                .populate('owner', 'firstName lastName email phoneNumber');
            console.log('Contrat populé avec les données du véhicule et du propriétaire');

            // Génération du PDF et envoi de l'email
            let pdfGenerated = false;
            let pdfError = null;

            console.log('Vérification de la configuration Gmail:', {
                sendEmails: process.env.SEND_CONTRACT_EMAILS,
                gmailConfig: {
                    clientId: process.env.GMAIL_CLIENT_ID ? 'Configuré' : 'Non configuré',
                    user: process.env.GMAIL_USER,
                    refreshToken: process.env.GMAIL_REFRESH_TOKEN ? 'Configuré' : 'Non configuré'
                }
            });

            try {
                if (process.env.SEND_CONTRACT_EMAILS === 'true') {
                    console.log('Début de la génération du PDF pour le contrat:', populatedContract.contractNumber);
                    const pdfBuffer = await PDFGenerator.generateContractPDF(populatedContract);
                    
                    if (pdfBuffer) {
                        console.log('PDF généré avec succès, taille:', pdfBuffer.length);
                        console.log('Tentative d\'envoi de l\'email');
                        await EmailService.sendContractEmail(populatedContract, pdfBuffer);
                        pdfGenerated = true;
                        console.log('Email envoyé avec succès');
                    } else {
                        console.log('Aucun buffer PDF généré');
                    }
                } else {
                    console.log('Génération de PDF désactivée par configuration');
                }
            } catch (error) {
                console.error('Erreur détaillée lors de la génération/envoi du PDF:', error);
                pdfError = error;
            }

            console.log('Préparation de la réponse');
            res.status(201).json({
                ...populatedContract.toJSON(),
                pdfGenerated,
                pdfError: pdfError ? pdfError.message : null
            });

        } catch (saveError) {
            console.error('Erreur lors de la sauvegarde:', saveError);
            return res.status(500).json({
                error: 'Erreur lors de la sauvegarde du contrat'
            });
        }

    } catch (error) {
        console.error('Erreur lors de la création du contrat:', error);
        res.status(500).json({ error: 'Erreur lors de la création du contrat' });
    }
};

exports.updateContract = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updateData = JSON.parse(req.body.contractData);

        const contract = await Contract.findOne({ _id: id, owner: userId });
        if (!contract) {
            return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        if (!['draft', 'pending'].includes(contract.status)) {
            return res.status(400).json({ error: 'Ce contrat ne peut plus être modifié' });
        }

        if (req.files) {
            for (const [key, files] of Object.entries(req.files)) {
                const documentType = key.replace('documents_', '');
                const uploadPromises = files.map(file =>
                    cloudinary.uploader.upload(file.path, {
                        folder: `contracts/${userId}/${documentType}`,
                        resource_type: 'auto'
                    })
                );

                const uploadResults = await Promise.all(uploadPromises);
                const newDocuments = uploadResults.map(result => ({
                    type: documentType,
                    url: result.secure_url,
                    publicId: result.public_id
                }));

                contract.documents = contract.documents.filter(doc => doc.type !== documentType);
                contract.documents.push(...newDocuments);

                await Promise.all(files.map(file => fs.unlink(file.path)));
            }
        }

        Object.assign(contract, updateData);
        await contract.save();

        res.json(contract);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du contrat:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du contrat' });
    }
};


exports.validateSignature = async (req, res) => {
  try {
      const { id } = req.params;
      const userId = req.user.id;
      const { partyType, signature } = req.body;

      const contract = await Contract.findOne({ _id: id, owner: userId });
      if (!contract) {
          return res.status(404).json({ error: 'Contrat non trouvé' });
      }

      contract.signatures.push({
          party: partyType,
          signature,
          timestamp: new Date(),
          ipAddress: req.ip
      });

      if (contract.signatures.length === 2) {
          contract.status = 'active';
      }

      await contract.save();

      if (contract.status === 'active') {
          await EmailService.sendContractActivationEmails(contract);
      }

      res.json(contract);
  } catch (error) {
      console.error('Erreur lors de la validation de la signature:', error);
      res.status(500).json({ error: 'Erreur lors de la validation de la signature' });
  }
};

exports.deleteContract = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const contract = await Contract.findOne({ _id: id, owner: userId });
        
        if (!contract) {
            return res.status(404).json({ error: 'Contrat non trouvé' });
        }

        // Vérifier si le contrat peut être supprimé
        if (['active', 'completed'].includes(contract.status)) {
            return res.status(400).json({ 
                error: 'Les contrats actifs ou terminés ne peuvent pas être supprimés' 
            });
        }

        // Si le contrat a des documents sur Cloudinary, les supprimer
        if (contract.documents && contract.documents.length > 0) {
            for (const doc of contract.documents) {
                if (doc.publicId) {
                    await cloudinary.uploader.destroy(doc.publicId);
                }
            }
        }

        // Mettre à jour le véhicule si nécessaire
        if (contract.vehicle) {
            await Vehicle.findByIdAndUpdate(contract.vehicle, {
                $unset: { currentRental: 1 }
            });
        }

        // Supprimer le contrat
        await Contract.findByIdAndDelete(id);

        res.status(200).json({ 
            status: 'success',
            message: 'Contrat supprimé avec succès' 
        });

    } catch (error) {
        console.error('Erreur lors de la suppression du contrat:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du contrat' });
    }
};

exports.cancelContract = async (req, res) => {
  try {
      const { id } = req.params;
      const userId = req.user.id;
      const { reason } = req.body;

      const contract = await Contract.findOne({ _id: id, owner: userId });
      if (!contract) {
          return res.status(404).json({ error: 'Contrat non trouvé' });
      }

      if (!['pending', 'active'].includes(contract.status)) {
          return res.status(400).json({ error: 'Ce contrat ne peut pas être annulé' });
      }

      contract.status = 'cancelled';
      contract.notes = reason;
      await contract.save();

      await Vehicle.findByIdAndUpdate(contract.vehicle, {
          $unset: { currentRental: 1 }
      });

      await EmailService.sendContractCancellationEmails(contract);

      res.json(contract);
  } catch (error) {
      console.error('Erreur lors de l\'annulation du contrat:', error);
      res.status(500).json({ error: 'Erreur lors de l\'annulation du contrat' });
  }
};

exports.finalizeContract = async (req, res) => {
  try {
      const { id } = req.params;
      const userId = req.user.id;
      const returnDetails = req.body;

      const contract = await Contract.findOne({ _id: id, owner: userId });
      if (!contract) {
          return res.status(404).json({ error: 'Contrat non trouvé' });
      }

      if (contract.status !== 'active') {
          return res.status(400).json({ error: 'Ce contrat ne peut pas être finalisé' });
      }

      contract.status = 'completed';
      contract.returnDetails = returnDetails;
      await contract.save();

      await Vehicle.findByIdAndUpdate(contract.vehicle, {
          mileage: returnDetails.finalMileage,
          $unset: { currentRental: 1 }
      });

      await EmailService.sendContractCompletionEmails(contract);

      res.json(contract);
  } catch (error) {
      console.error('Erreur lors de la finalisation du contrat:', error);
      res.status(500).json({ error: 'Erreur lors de la finalisation du contrat' });
  }
};

exports.generatePDF = async (req, res) => {
  try {
      const { id } = req.params;
      const userId = req.user.id;

      const contract = await Contract.findOne({ _id: id, owner: userId })
          .populate('vehicle', 'brand model licensePlate');

      if (!contract) {
          return res.status(404).json({ error: 'Contrat non trouvé' });
      }

      const pdfBuffer = await PDFGenerator.generateContractPDF(contract);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=contrat_${contract.contractNumber}.pdf`);
      res.send(pdfBuffer);
  } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
  }
};

module.exports = exports;