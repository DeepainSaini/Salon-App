const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePdf = async (invoiceData) => {
  const invoicesDir = path.join(__dirname, '../../public/invoices');

  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const fileName = `${invoiceData.invoiceNumber}.pdf`;
  const filePath = path.join(invoicesDir, fileName);

  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(22).text('Salon Appointment Invoice', {
    align: 'center'
  });

  doc.moveDown();

  doc.fontSize(12).text(`Invoice Number: ${invoiceData.invoiceNumber}`);
  doc.text(`Invoice Date: ${invoiceData.invoiceDate}`);

  doc.moveDown();

  doc.text(`Salon: ${invoiceData.salonName}`);
  doc.text(`Customer: ${invoiceData.customerName}`);
  doc.text(`Service: ${invoiceData.serviceName}`);
  doc.text(`Staff: ${invoiceData.staffName}`);

  doc.moveDown();

  doc.text(`Appointment Date: ${invoiceData.appointmentDate}`);
  doc.text(`Appointment Time: ${invoiceData.appointmentTime}`);
  doc.text(`Payment Status: ${invoiceData.paymentStatus}`);

  doc.moveDown();

  doc.fontSize(16).text(`Amount Paid: Rs. ${invoiceData.amount}`);

  doc.moveDown();
  doc.fontSize(11).text('Thank you for booking with us.', {
    align: 'center'
  });

  doc.end();

  return `/invoices/${fileName}`;
};

module.exports = {
  generateInvoicePdf
};