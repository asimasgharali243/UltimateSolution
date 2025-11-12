export const generateInvoicePDF = (invoiceData) => {
  const {
    customer,
    invoiceNumber,
    date,
    dueDate,
    reference,
    subject,
    items,
    comments,
    totals,
    payment,
  } = invoiceData;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return Number(amount).toFixed(2);
  };

  const getProductName = (productValue) => {
    const products = [
      { value: "product1", label: "Product 1" },
      { value: "product2", label: "Product 2" },
      { value: "product3", label: "Product 3" },
      { value: "product4", label: "Product 4" },
      { value: "product5", label: "Product 5" },
      { value: "product6", label: "Product 6" },
      { value: "product7", label: "Product 7" },
      { value: "product8", label: "Product 8" },
      { value: "product9", label: "Product 9" },
      { value: "product10", label: "Product 10" },
      { value: "product11", label: "Product 11" },
      { value: "product12", label: "Product 12" },
    ];
    const product = products.find((p) => p.value === productValue);
    return product ? product.label : "";
  };

  // Generate table rows for items
  const generateItemRows = () => {
    const filledItems = items.filter((item) => item.product && item.filled);
    const emptyRowsCount = Math.max(0, 6 - filledItems.length);

    let rows = "";

    // Add filled items
    filledItems.forEach((item, index) => {
      const rowClass = index % 2 === 0 ? "row-even" : "row-odd";
      rows += `
        <tr class="${rowClass}">
          <td style="text-align: center; padding: 8px; border: 1px solid #4F46E5; font-size: 12px;">
            ${index + 1}
          </td>
          <td style="padding: 8px; border: 1px solid #4F46E5; font-size: 12px;">
            <div style="font-weight: bold; margin-bottom: 4px;">
              ${getProductName(item.product)}
            </div>
            ${
              item.description
                ? `<div style="font-size: 10px; color: #666;">${item.description}</div>`
                : ""
            }
          </td>
          <td style="text-align: center; padding: 8px; border: 1px solid #4F46E5; font-size: 12px;">
            ${item.quantity}
          </td>
          <td style="text-align: center; padding: 8px; border: 1px solid #4F46E5; font-size: 12px;">
            ${formatCurrency(item.price)}
          </td>
          <td style="text-align: center; padding: 8px; border: 1px solid #4F46E5; font-size: 12px;">
            5%
          </td>
          <td style="text-align: center; padding: 8px; border: 1px solid #4F46E5; font-size: 12px;">
            ${formatCurrency(item.amount)}
          </td>
        </tr>
      `;
    });

    // Add empty rows
    for (let i = 0; i < emptyRowsCount; i++) {
      const rowClass =
        (filledItems.length + i) % 2 === 0 ? "row-even" : "row-odd";
      rows += `
        <tr class="${rowClass}">
          <td style="text-align: center; padding: 8px; border: 1px solid #4F46E5; font-size: 12px;">
            ${filledItems.length + i + 1}
          </td>
          <td style="padding: 8px; border: 1px solid #4F46E5; font-size: 12px;">-</td>
          <td style="text-align: center; padding: 8px; border: 1px solid #4F46E5; font-size: 12px;">-</td>
          <td style="text-align: center; padding: 8px; border: 1px solid #4F46E5; font-size: 12px;">-</td>
          <td style="text-align: center; padding: 8px; border: 1px solid #4F46E5; font-size: 12px;">-</td>
          <td style="text-align: center; padding: 8px; border: 1px solid #4F46E5; font-size: 12px;">-</td>
        </tr>
      `;
    }

    return rows;
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        
        .invoice-container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          border-bottom: 2px solid #4F46E5;
          padding-bottom: 20px;
        }
        
        .company-logo {
          width: 120px;
          height: 60px;
          background: #4F46E5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
        
        .invoice-title {
          font-size: 32px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
          text-align: right;
        }
        
        .company-info {
          font-size: 10px;
          color: #6b7280;
          text-align: right;
          line-height: 1.6;
        }
        
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        
        .client-info {
          flex: 1;
          margin-right: 20px;
        }
        
        .invoice-details {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .section-header {
          background: #4F46E5;
          color: white;
          padding: 8px;
          font-weight: bold;
          margin-bottom: 10px;
          font-size: 11px;
        }
        
        .client-details {
          font-size: 11px;
          line-height: 1.6;
        }
        
        .detail-box {
          border: 1px solid #4F46E5;
          margin-bottom: 10px;
          width: 150px;
        }
        
        .detail-header {
          background: #4F46E5;
          color: white;
          padding: 6px;
          text-align: center;
          font-weight: bold;
          font-size: 10px;
        }
        
        .detail-value {
          padding: 8px;
          text-align: center;
          font-weight: bold;
          font-size: 11px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          border: 2px solid #4F46E5;
        }
        
        .items-table th {
          background: #4F46E5;
          color: white;
          padding: 10px 8px;
          text-align: center;
          font-weight: bold;
          font-size: 11px;
          border: 1px solid #4F46E5;
        }
        
        .items-table td {
          border: 1px solid #4F46E5;
        }
        
        .row-even {
          background: #f0f0f0;
        }
        
        .row-odd {
          background: white;
        }
        
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin: 20px 0;
        }
        
        .totals-table {
          width: 300px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 12px;
        }
        
        .final-total {
          border-top: 2px solid #374151;
          border-bottom: 2px solid #374151;
          font-weight: bold;
          font-size: 14px;
          margin-top: 5px;
          background: #f3f4f6;
        }
        
        .comments-section {
          margin: 20px 0;
        }
        
        .comments-header {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #1f2937;
        }
        
        .comments-text {
          font-size: 11px;
          line-height: 1.6;
          color: #374151;
          background: #f9fafb;
          padding: 12px;
          border-left: 4px solid #4F46E5;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 10px;
          line-height: 1.6;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .invoice-container {
            padding: 10px;
            margin: 0;
            max-width: none;
          }
        }
        
        @page {
          margin: 0.5in;
          size: A4;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div>
            <div class="company-logo">
              Company Logo
            </div>
          </div>
          <div>
            <div class="invoice-title">INVOICE</div>
            <div class="company-info">
              <div><strong>ABC LLC</strong></div>
              <div>63152 Cydney Course, Argentina</div>
            </div>
          </div>
        </div>

        <!-- Client and Invoice Info -->
        <div class="info-section">
          <div class="client-info">
            <div class="section-header">Client Information</div>
            <div class="client-details">
              <div><strong>Attention:</strong> ${
                customer.name || "Ali Khan"
              }</div>
              <div><strong>Company:</strong> Company Name</div>
              <div><strong>Address:</strong> Address Line 1</div>
              <div><strong>City:</strong> City, Country</div>
            </div>
          </div>
          
          <div class="invoice-details">
            <div class="detail-box">
              <div class="detail-header">Number</div>
              <div class="detail-value">${invoiceNumber}</div>
            </div>
            <div class="detail-box">
              <div class="detail-header">Date</div>
              <div class="detail-value">${formatDate(date)}</div>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 8%;">#</th>
              <th style="width: 35%;">Description</th>
              <th style="width: 12%;">Quantity</th>
              <th style="width: 15%;">Unit Cost</th>
              <th style="width: 12%;">Tax Rate</th>
              <th style="width: 18%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${generateItemRows()}
          </tbody>
        </table>

        <!-- Totals Section -->
        <div class="totals-section">
          <div class="totals-table">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(totals.gross)}</span>
            </div>
            <div class="total-row">
              <span>Discount:</span>
              <span>-${formatCurrency(totals.discount)}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span>${formatCurrency(totals.tax)}</span>
            </div>
            <div class="total-row">
              <span>Shipping:</span>
              <span>${formatCurrency(totals.shippingCharges)}</span>
            </div>
            <div class="total-row final-total">
              <span><strong>Total:</strong></span>
              <span><strong>${formatCurrency(totals.net)} PKR</strong></span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div><strong>Thank you for your business!</strong></div>
          <div>For any queries, please contact us at info@company.com</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
        
        window.onafterprint = function() {
          window.close();
        };
      </script>
    </body>
    </html>
  `;

  // Create new window and write HTML content
  const printWindow = window.open("", "_blank", "width=800,height=600");

  if (printWindow) {
    printWindow.document.write(htmlContent);
    // printWindow.document.close();
    printWindow.focus();
  } else {
    alert("Please allow pop-ups for this website to generate PDF");
  }
};
