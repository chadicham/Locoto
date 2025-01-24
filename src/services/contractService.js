import axios from 'axios';

class ContractService {
  async getContracts(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const { data } = await axios.get(`/api/contracts?${queryParams}`);
      return this.formatContractsData(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
      throw new Error('Impossible de récupérer la liste des contrats');
    }
  }

  async getContractById(id) {
    try {
      const { data } = await axios.get(`/api/contracts/${id}`);
      return this.formatContractData(data);
    } catch (error) {
      console.error('Erreur lors de la récupération du contrat:', error);
      throw new Error('Impossible de récupérer les détails du contrat');
    }
  }

  async createContract(contractData) {
    try {
      const formData = new FormData();
      
      // Traitement des données de base du contrat
      Object.keys(contractData).forEach(key => {
        if (key !== 'documents') {
          if (typeof contractData[key] === 'object') {
            formData.append(key, JSON.stringify(contractData[key]));
          } else {
            formData.append(key, contractData[key]);
          }
        }
      });

      // Traitement des documents
      if (contractData.documents) {
        Object.entries(contractData.documents).forEach(([type, files]) => {
          if (Array.isArray(files)) {
            files.forEach(file => {
              formData.append(`documents_${type}`, file);
            });
          } else {
            formData.append(`documents_${type}`, files);
          }
        });
      }

      const { data } = await axios.post('/api/contracts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return this.formatContractData(data);
    } catch (error) {
      console.error('Erreur lors de la création du contrat:', error);
      throw new Error('Impossible de créer le contrat');
    }
  }

  async updateContract(id, contractData) {
    try {
      const formData = new FormData();
      
      Object.keys(contractData).forEach(key => {
        if (key !== 'documents') {
          if (typeof contractData[key] === 'object') {
            formData.append(key, JSON.stringify(contractData[key]));
          } else {
            formData.append(key, contractData[key]);
          }
        }
      });

      if (contractData.documents) {
        Object.entries(contractData.documents).forEach(([type, files]) => {
          if (Array.isArray(files)) {
            files.forEach(file => {
              formData.append(`documents_${type}`, file);
            });
          } else {
            formData.append(`documents_${type}`, files);
          }
        });
      }

      const { data } = await axios.put(`/api/contracts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return this.formatContractData(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat:', error);
      throw new Error('Impossible de mettre à jour le contrat');
    }
  }

  async cancelContract(id, reason) {
    try {
      const { data } = await axios.post(`/api/contracts/${id}/cancel`, { reason });
      return this.formatContractData(data);
    } catch (error) {
      console.error('Erreur lors de l\'annulation du contrat:', error);
      throw new Error('Impossible d\'annuler le contrat');
    }
  }

  async finalizeContract(id, returnDetails) {
    try {
      const { data } = await axios.post(`/api/contracts/${id}/finalize`, returnDetails);
      return this.formatContractData(data);
    } catch (error) {
      console.error('Erreur lors de la finalisation du contrat:', error);
      throw new Error('Impossible de finaliser le contrat');
    }
  }

  async generateContractPDF(id) {
    try {
      const response = await axios.get(`/api/contracts/${id}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrat_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw new Error('Impossible de générer le PDF du contrat');
    }
  }

  async validateSignature(id, partyType, signatureData) {
    try {
      const { data } = await axios.post(`/api/contracts/${id}/sign`, {
        partyType,
        signature: signatureData
      });
      return this.formatContractData(data);
    } catch (error) {
      console.error('Erreur lors de la signature du contrat:', error);
      throw new Error('Impossible de valider la signature');
    }
  }

  formatContractsData(contracts) {
    return contracts.map(contract => this.formatContractData(contract));
  }

  formatContractData(contract) {
    return {
      id: contract._id,
      contractNumber: contract.contractNumber,
      vehicle: contract.vehicle,
      renter: contract.renter,
      rental: {
        ...contract.rental,
        startDate: new Date(contract.rental.startDate),
        endDate: new Date(contract.rental.endDate)
      },
      documents: contract.documents,
      signatures: contract.signatures,
      status: contract.status,
      payment: contract.payment,
      returnDetails: contract.returnDetails,
      notes: contract.notes,
      createdAt: new Date(contract.createdAt),
      updatedAt: new Date(contract.updatedAt)
    };
  }
}

export default new ContractService();