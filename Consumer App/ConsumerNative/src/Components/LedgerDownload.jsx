import React, { useState } from 'react';
import {
  Alert,
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { generatePDF } from 'react-native-html-to-pdf';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const LedgerPDFGenerator = ({ ledgerData, dateFrom, dateTo }) => {
  const [fileName, setFileName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [generatedFilePath, setGeneratedFilePath] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAction, setCurrentAction] = useState(''); // 'save' or 'share'

  // Generate default filename based on dates and consumer
  const generateDefaultFileName = () => {
    const consumerName = ledgerData?.[0]?.consumerName || 'Ledger';
    const formattedFrom = moment(dateFrom).format('DD-MM-YYYY');
    const formattedTo = moment(dateTo).format('DD-MM-YYYY');
    return `${consumerName}_${formattedFrom}_to_${formattedTo}`;
  };

  const askFileName = (action = 'save') => {
    setCurrentAction(action);
    // Set default filename if empty
    if (!fileName.trim()) {
      setFileName(generateDefaultFileName());
    }
    setShowModal(true);
  };

  const handleGenerate = async () => {
    if (!fileName.trim()) {
      Alert.alert('File name required', 'Please enter a valid file name.');
      return;
    }

    setIsGenerating(true);
    const path = await createLedgerPDF(fileName.trim());

    if (path) {
      setGeneratedFilePath(path);

      if (currentAction === 'save') {
        Alert.alert('Success', 'PDF saved successfully!');
        setShowModal(false);
      } else if (currentAction === 'share') {
        await handleShare(path);
        setShowModal(false);
      }
    }

    setIsGenerating(false);
  };

  const handleShareDirectly = async () => {
    // For direct share, use default filename without showing modal
    const defaultFileName = generateDefaultFileName();

    setIsGenerating(true);
    const path = await createLedgerPDF(defaultFileName);

    if (path) {
      setGeneratedFilePath(path);
      await handleShare(path);
    }

    setIsGenerating(false);
  };

  const createLedgerPDF = async customName => {
    if (!ledgerData || ledgerData.length === 0) {
      Alert.alert('No Data', 'Please fetch ledger data first.');
      return null;
    }

    const consumerName = ledgerData[0].consumerName || 'N/A';
    const propertyNo = ledgerData[0].propertyNo || 'N/A';
    const formattedFrom = moment(dateFrom).format('DD-MM-YYYY');
    const formattedTo = moment(dateTo).format('DD-MM-YYYY');

    const rowsPerPage = 25;
    const totalPages = Math.ceil(ledgerData.length / rowsPerPage);
    let pagesHTML = '';

    for (let i = 0; i < totalPages; i++) {
      const start = i * rowsPerPage;
      const end = Math.min(start + rowsPerPage, ledgerData.length);

      const pageRows = ledgerData
        .slice(start, end)
        .map(
          (item, idx) => `
      <tr>
        <td>${start + idx + 1}</td>
        <td>${moment(item.date).format('DD-MM-YYYY')}</td>
        <td>${item.voucher_No || '-'}</td>
        <td>${item.descriptions || '-'}</td>
        <td>${parseFloat(item.debit || 0).toFixed(2)}</td>
        <td>${parseFloat(item.credit || 0).toFixed(2)}</td>
        <td>${
          item.openingBalance
            ? (
                parseFloat(item.openingBalance) +
                (parseFloat(item.credit || 0) - parseFloat(item.debit || 0))
              ).toFixed(2)
            : '0.00'
        }</td>
      </tr>`,
        )
        .join('');

      const pageBreak = i < totalPages - 1 ? 'page-break-after: always;' : '';

      pagesHTML += `
    <div style="${pageBreak}">
      <div>
        <h2 style="text-align:center; color:#007bff;">Account Ledger Report</h2>
        <!-- Circular Logo -->
          <!-- Logo and Consumer Info Section -->
<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
  <!-- Consumer Details -->
  <div style="flex: 1;">
    <p style="margin: 2px 0;"><strong>Consumer Name:</strong> ${consumerName}</p>
    <p style="margin: 2px 0;"><strong>Property No:</strong> ${propertyNo}</p>
    <p style="margin: 2px 0;"><strong>Date From:</strong> ${formattedFrom} - <strong>To:</strong> ${formattedTo}</p>
  </div>

  <!-- Circular Logo on Right -->
  <div style="margin-left: 15px; text-align: right;">
    <img 
      src="https://via.placeholder.com/80x80/007bff/ffffff?text=LOGO" 
      alt="Company Logo" 
      style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #007bff;"
    />
  </div>
</div>

        
        <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th>Sr</th><th>Date</th><th>Voucher</th><th>Description</th>
              <th>Debit</th><th>Credit</th><th>Balance</th>
            </tr>
          </thead>
          <tbody>${pageRows}</tbody>
        </table>
      </div>

      <div style="position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 12px; color: #666;">
        Page ${i + 1} / ${totalPages}
      </div>
    </div>`;
    }

    const htmlContent = `
    <html>
      <head>
        <style>
          body { 
            font-family: Arial; 
            font-size: 12px; 
            margin: 20px;
            position: relative;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: center; 
          }
          th { 
            background-color: #007bff; 
            color: white; 
          }
          tr:nth-child(even) { 
            background-color: #f2f2f2; 
          }
          @media print {
            div {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${pagesHTML}
      </body>
    </html>`;

    try {
      console.log('Generating PDF with filename:', customName);

      const file = await generatePDF({
        html: htmlContent,
        fileName: customName,
        base64: false,
        directory: 'Documents',
      });

      const downloadPath = `${RNFS.DownloadDirectoryPath}/${customName}.pdf`;
      const fileExists = await RNFS.exists(file.filePath);

      if (!fileExists) {
        throw new Error('Generated PDF file not found');
      }

      await RNFS.copyFile(file.filePath, downloadPath);

      // Verify the file was copied successfully
      const copiedFileExists = await RNFS.exists(downloadPath);
      if (!copiedFileExists) {
        throw new Error('Failed to copy PDF to download directory');
      }

      console.log('PDF generated successfully at:', downloadPath);
      return downloadPath;
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Alert.alert('Error', `Failed to generate PDF: ${error.message}`);
      return null;
    }
  };

  const handleShare = async (filePath = null) => {
    const pathToShare = filePath || generatedFilePath;

    if (!pathToShare) {
      Alert.alert('No PDF', 'Please generate the PDF first.');
      return;
    }

    try {
      // Verify file exists before sharing
      const fileExists = await RNFS.exists(pathToShare);
      if (!fileExists) {
        Alert.alert('Error', 'PDF file not found. Please generate it again.');
        return;
      }

      const options = {
        title: 'Share Ledger PDF',
        subject: 'Ledger Report',
        url: `file://${pathToShare}`,
        type: 'application/pdf',
        failOnCancel: false,
      };

      await Share.open(options);
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Share Error:', error);
        Alert.alert('Error', 'Failed to share PDF.');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentAction('');
  };

  return (
    <>
      <View style={styles.buttonContainer}>
        {/* Save Button - Shows Modal */}
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={() => askFileName('save')}
          disabled={isGenerating}
        >
          <Icon name="save" size={20} color="#fff" />
          {/* {isGenerating && currentAction === 'save' ? (
            <Text style={styles.buttonText}>Saving...</Text>
          ) : null} */}
        </TouchableOpacity>

        {/* Share Button - Uses default name directly */}
        <TouchableOpacity
          style={[styles.button, styles.shareButton]}
          onPress={handleShareDirectly}
          disabled={isGenerating}
        >
          <Icon name="share-alt" size={20} color="#fff" />
          {/* {isGenerating && currentAction === 'share' ? (
            <Text style={styles.buttonText}>Sharing...</Text>
          ) : null} */}
        </TouchableOpacity>
      </View>

      {/* Modal for filename input */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {currentAction === 'share'
                ? '💾 Save & Share Ledger Report'
                : '💾 Save Ledger Report'}
            </Text>

            <Text style={styles.fileNameLabel}>File Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter file name..."
              placeholderTextColor="#888"
              value={fileName}
              onChangeText={setFileName}
              autoFocus={true}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleModalClose}
                disabled={isGenerating}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.generateBtn,
                  isGenerating && styles.disabledButton,
                ]}
                onPress={handleGenerate}
                disabled={isGenerating}
              >
                <Icon
                  name={currentAction === 'share' ? 'share-alt' : 'save'}
                  color="#fff"
                  size={16}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.generateText}>
                  {isGenerating
                    ? 'Generating...'
                    : currentAction === 'share'
                    ? 'Save & Share'
                    : 'Save PDF'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 50,
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  shareButton: {
    backgroundColor: '#007bff',
  },
  shareExistingButton: {
    backgroundColor: '#6c757d',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  icon: {
    marginRight: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Modal Styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  fileNameLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: '#777',
    fontSize: 16,
    fontWeight: '500',
  },
  generateBtn: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  generateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LedgerPDFGenerator;
