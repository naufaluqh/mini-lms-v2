const ExcelJS = require('exceljs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Export all users and training progress to Excel
// @route   GET /api/reports/excel
// @access  Private (admin, manager only)
exports.exportToExcel = async (req, res) => {
  try {
    // 1. Fetch users and courses from MongoDB
    const users = await User.find().select('-password');
    const courses = await Course.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('LMS Progress Report');

    // 2. Define sheet columns
    worksheet.columns = [
      { header: 'User ID', key: 'id', width: 30 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Registration Date', key: 'createdAt', width: 25 },
      { header: 'Completed Modules Count', key: 'progressCount', width: 25 },
      { header: 'Simulated Progress Status', key: 'progressStatus', width: 30 },
    ];

    // 3. Style the header row (Sleek Dark Navy theme)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1F4E78' },
      };
      cell.font = {
        name: 'Segoe UI',
        bold: true,
        color: { argb: 'FFFFFF' },
        size: 11,
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    headerRow.height = 28;

    // 4. Fill data rows and add alternating background colors
    users.forEach((user, index) => {
      // Simulate user progress based on course list length
      const totalCourses = courses.length || 1;
      const progressCount = index % (totalCourses + 1);
      const percentage = Math.round((progressCount / totalCourses) * 100);
      const progressStatus = progressCount === 0 ? '0% (Not Started)' : 
                             progressCount === totalCourses ? '100% (Completed)' : 
                             `${percentage}% (In Progress)`;

      const row = worksheet.addRow({
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        progressCount: progressCount,
        progressStatus: progressStatus,
      });

      // Alternating row styling
      const fillColor = index % 2 === 0 ? 'F7F9FB' : 'FFFFFF';
      row.eachCell((cell) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fillColor },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
      row.height = 22;
    });

    // 5. Send sheet back as attachment
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Laporan_LMS_SIG.xlsx'
    );

    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Issue completion certificate PDF & send via simulated email
// @route   POST /api/reports/certificate
// @access  Private (All authenticated roles)
exports.issueCertificate = async (req, res) => {
  try {
    const { courseTitle } = req.body;
    const username = req.user.username;

    if (!courseTitle) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseTitle',
      });
    }

    // 1. Generate PDF Certificate in-memory via pdf-lib
    const pdfDoc = await PDFDocument.create();
    // landscape A4 proportions (842 x 595 pt)
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();

    // Load standard core fonts
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw aesthetic double-line border
    page.drawRectangle({
      x: 25,
      y: 25,
      width: width - 50,
      height: height - 50,
      borderColor: rgb(0.12, 0.3, 0.47), // Deep Navy
      borderWidth: 6,
    });
    page.drawRectangle({
      x: 35,
      y: 35,
      width: width - 70,
      height: height - 70,
      borderColor: rgb(0.84, 0.69, 0.28), // Golden Accent
      borderWidth: 2,
    });

    // Draw certificate texts centered
    page.drawText('MINI LMS ACADEMY', {
      x: width / 2 - timesRoman.widthOfTextAtSize('MINI LMS ACADEMY', 26) / 2,
      y: height - 100,
      size: 26,
      font: timesRoman,
      color: rgb(0.12, 0.3, 0.47),
    });

    page.drawText('CERTIFICATE OF COMPLETION', {
      x: width / 2 - timesBoldItalic.widthOfTextAtSize('CERTIFICATE OF COMPLETION', 34) / 2,
      y: height - 170,
      size: 34,
      font: timesBoldItalic,
      color: rgb(0.84, 0.69, 0.28),
    });

    page.drawText('This certificate is proudly presented to', {
      x: width / 2 - helvetica.widthOfTextAtSize('This certificate is proudly presented to', 15) / 2,
      y: height - 240,
      size: 15,
      font: helvetica,
      color: rgb(0.25, 0.25, 0.25),
    });

    const uppercaseName = username.toUpperCase();
    page.drawText(uppercaseName, {
      x: width / 2 - timesRoman.widthOfTextAtSize(uppercaseName, 28) / 2,
      y: height - 300,
      size: 28,
      font: timesRoman,
      color: rgb(0.12, 0.3, 0.47),
    });

    // Horizontal line under recipient name
    page.drawLine({
      start: { x: width / 2 - 160, y: height - 315 },
      end: { x: width / 2 + 160, y: height - 315 },
      thickness: 1.5,
      color: rgb(0.84, 0.69, 0.28),
    });

    page.drawText('for successfully completing the course', {
      x: width / 2 - helvetica.widthOfTextAtSize('for successfully completing the course', 14) / 2,
      y: height - 355,
      size: 14,
      font: helvetica,
      color: rgb(0.25, 0.25, 0.25),
    });

    page.drawText(`"${courseTitle}"`, {
      x: width / 2 - timesBoldItalic.widthOfTextAtSize(`"${courseTitle}"`, 22) / 2,
      y: height - 405,
      size: 22,
      font: timesBoldItalic,
      color: rgb(0.12, 0.3, 0.47),
    });

    // Date & Signature line
    const dateStr = `Date: ${new Date().toLocaleDateString()}`;
    page.drawText(dateStr, {
      x: 100,
      y: 95,
      size: 12,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawLine({
      start: { x: width - 250, y: 110 },
      end: { x: width - 100, y: 110 },
      thickness: 1.5,
      color: rgb(0.12, 0.3, 0.47),
    });

    page.drawText('Authorized Signature', {
      x: width - 220,
      y: 95,
      size: 12,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });

    const pdfBytes = await pdfDoc.save();

    // 2. Transmit via Nodemailer using a simulated JSON transport (returns data output back as JSON)
    const simulatedRecipientEmail = `${username.replace(/\s+/g, '').toLowerCase()}@lms-v2.local`;
    
    const transporter = nodemailer.createTransport({
      jsonTransport: true, // Local simulation mode
    });

    const mailOptions = {
      from: '"Mini LMS Automation" <no-reply@lms-v2.local>',
      to: simulatedRecipientEmail,
      subject: `Training Accomplishment Certificate - ${courseTitle}`,
      text: `Dear ${username},\n\nWe are pleased to attach your professional certificate of completion for successfully finishing the training course "${courseTitle}".\n\nOutstanding work!\n\nSincerely,\nMini LMS Administration`,
      attachments: [
        {
          filename: `Completion_Certificate_${courseTitle.replace(/\s+/g, '_')}.pdf`,
          content: Buffer.from(pdfBytes),
          contentType: 'application/pdf',
        },
      ],
    };

    const emailResponse = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Certificate PDF compiled and simulated email dispatched.',
      recipient: simulatedRecipientEmail,
      simulatedEmailInfo: JSON.parse(emailResponse.message),
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
