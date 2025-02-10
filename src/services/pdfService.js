import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import logoBase64 from '../assets/logo-base64';
import { TERMS_AND_CONDITIONS } from '../constants/contractTerms';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;


export const generateContractPDF = async (contractData) => {
  const formatDate = (date) => format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  const formatCurrency = (amount) => `${amount.toLocaleString('fr-FR')}€`;

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 100, 40, 60],
  
    header: {
      columns: [
        logoBase64 ? {
          image: logoBase64,
          width: 100,
          margin: [40, 20]
        } : {
          text: '',
          width: 100,
          margin: [40, 20]
        },
        {
          text: 'CONTRAT DE LOCATION',
          alignment: 'right',
          margin: [0, 20, 40, 0],
          fontSize: 16,
          bold: true
        }
      ]
    },

    footer: (currentPage, pageCount) => ({
      columns: [
        { text: 'Locoto - Service de location de véhicules', alignment: 'left' },
        { text: `Page ${currentPage} sur ${pageCount}`, alignment: 'right' }
      ],
      margin: [40, 20, 40, 20],
      fontSize: 8,
      color: 'grey'
    }),

    content: [
      {
        text: `Contrat N° ${contractData.id}`,
        style: 'subheader',
        margin: [0, 0, 0, 20]
      },

      {
        columns: [
          {
            width: '50%',
            text: [
              { text: 'PROPRIÉTAIRE\n', style: 'sectionHeader' },
              `Nom: ${contractData.ownerName}\n`,
              `Adresse: ${contractData.ownerAddress}\n`,
              `Téléphone: ${contractData.ownerPhone}\n`,
              `Email: ${contractData.ownerEmail}\n`,
            ]
          },
          {
            width: '50%',
            text: [
              { text: 'LOCATAIRE\n', style: 'sectionHeader' },
              `Nom: ${contractData.renterName}\n`,
              `Adresse: ${contractData.renterAddress}\n`,
              `Téléphone: ${contractData.renterPhone}\n`,
              `Email: ${contractData.renterEmail}\n`,
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },

      {
        text: 'VÉHICULE',
        style: 'sectionHeader',
        margin: [0, 0, 0, 10]
      },

      {
        columns: [
          {
            width: '50%',
            text: [
              `Marque: ${contractData.vehicle.brand}\n`,
              `Modèle: ${contractData.vehicle.model}\n`,
              `Immatriculation: ${contractData.vehicle.licensePlate}\n`,
            ]
          },
          {
            width: '50%',
            text: [
              `Type: ${contractData.vehicle.type}\n`,
              `Carburant: ${contractData.vehicle.fuel}\n`,
              `Année: ${contractData.vehicle.year}\n`,
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },

      {
        text: 'CONDITIONS DE LOCATION',
        style: 'sectionHeader',
        margin: [0, 0, 0, 10]
      },

      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 0,
          widths: ['*', '*'],
          body: [
            [
              { text: 'Début de location', bold: true },
              { text: formatDate(contractData.startDate) }
            ],
            [
              { text: 'Fin de location', bold: true },
              { text: formatDate(contractData.endDate) }
            ],
            [
              { text: 'Kilométrage initial', bold: true },
              { text: `${contractData.initialMileage} km` }
            ],
            [
              { text: 'Kilométrage autorisé', bold: true },
              { text: `${contractData.allowedMileage} km` }
            ],
            [
              { text: 'Niveau de carburant initial', bold: true },
              { text: `${contractData.fuelLevel}%` }
            ]
          ]
        },
        margin: [0, 0, 0, 20]
      },

      {
        text: 'CONDITIONS FINANCIÈRES',
        style: 'sectionHeader',
        margin: [0, 0, 0, 10]
      },

      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 0,
          widths: ['*', '*'],
          body: [
            [
              { text: 'Montant de la location', bold: true },
              { text: formatCurrency(contractData.rentalAmount) }
            ],
            [
              { text: 'Caution', bold: true },
              { text: formatCurrency(contractData.deposit) }
            ]
          ]
        },
        margin: [0, 0, 0, 20]
      },

      {
        text: 'SIGNATURES',
        style: 'sectionHeader',
        pageBreak: 'before',
        margin: [0, 0, 0, 10]
      },

      {
        text: `Fait à _____________, le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`,
        margin: [0, 0, 0, 20]
      },

      {
        columns: [
          {
            width: '50%',
            stack: [
              {
                image: contractData.renterSignature,
                width: 200,
                height: 100
              },
              { text: 'Le locataire', alignment: 'center', margin: [0, 5] }
            ]
          },
          {
            width: '50%',
            stack: [
              {
                image: contractData.ownerSignature,
                width: 200,
                height: 100
              },
              { text: 'Le propriétaire', alignment: 'center', margin: [0, 5] }
            ]
          }
        ]
      },

      {
        text: 'CONDITIONS GÉNÉRALES DE LOCATION',
        style: 'sectionHeader',
        pageBreak: 'before',
        margin: [0, 0, 0, 10]
      },

      {
        stack: [
          { text: TERMS_AND_CONDITIONS.title, style: 'sectionHeader', margin: [0, 0, 0, 10] },
          ...TERMS_AND_CONDITIONS.sections.map(section => ({
            stack: [
              { text: section.title, bold: true, margin: [0, 10, 0, 5] },
              { text: section.content, margin: [0, 0, 0, 10] }
            ]
          })),
          { text: TERMS_AND_CONDITIONS.footer, italics: true, margin: [0, 20, 0, 0] }
        ]
      }
    ],

    styles: {
      header: {
        fontSize: 20,
        bold: true
      },
      subheader: {
        fontSize: 16,
        bold: true
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        margin: [0, 0, 0, 5]
      }
    },

    defaultStyle: {
      fontSize: 11,
      lineHeight: 1.5
    },

    info: {
      title: `Contrat de location - ${contractData.vehicle.brand} ${contractData.vehicle.model}`,
      author: 'Locoto',
      subject: 'Contrat de location de véhicule',
      keywords: 'location, véhicule, contrat'
    }
  };

  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      
      pdfDoc.getBuffer((buffer) => {
        resolve({
          doc: pdfDoc,
          buffer: buffer
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};