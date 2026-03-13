const { verifyToken } = require('../middleware/auth');
const { query } = require('../utils/database');
const archiver = require('archiver');
const axios = require('axios');
const path = require('path');

module.exports = async function (context, req) {
  try {
    const token = req.query.token;
    
    if (!token) {
      context.res = { status: 401, body: 'Unauthorized', headers: { 'Content-Type': 'text/plain' } };
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded || !['reviewer', 'admin'].includes(decoded.role)) {
      context.res = { status: 403, body: 'Forbidden', headers: { 'Content-Type': 'text/plain' } };
      return;
    }

    const applicationId = req.params.id;
    const applications = await query(
      'SELECT * FROM Applications WHERE application_id = @applicationId',
      { applicationId: parseInt(applicationId) }
    );

    if (applications.length === 0) {
      context.res = { status: 404, body: 'Application not found', headers: { 'Content-Type': 'text/plain' } };
      return;
    }

    const app = applications[0];
    context.log('Download for:', app.application_id);

    const escapeHtml = (text) => {
      if (!text) return '';
      return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    const formatDate = (date) => {
      if (!date) return 'Not provided';
      return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatCurrency = (value) => {
      if (!value) return 'Not provided';
      return `$${value.toLocaleString()}`;
    };

    const downloadFile = async (url) => {
      const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
      return Buffer.from(response.data);
    };

    const getExt = (url) => url ? path.extname(url.split('?')[0]).toLowerCase() || '.bin' : '.bin';

    const photoFile = app.photo_url ? `${app.application_id}-photo${getExt(app.photo_url)}` : null;
    const transcriptFile = app.transcript_url ? `${app.application_id}-transcript${getExt(app.transcript_url)}` : null;
    const statementFile = app.personal_statement_attachment ? `${app.application_id}-statement${getExt(app.personal_statement_attachment)}` : null;

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Application #${app.application_id}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;line-height:1.6;color:#333;background:#f5f5f5;padding:20px}
.instructions{background:#e3f2fd;border:2px solid #2196f3;padding:20px;margin-bottom:30px;border-radius:8px}
.instructions h2{color:#1976d2;margin-bottom:10px}
.instructions ol{margin-left:20px;margin-top:10px}
.container{max-width:900px;margin:0 auto;background:white;padding:40px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;margin:-40px -40px 30px -40px;border-radius:8px 8px 0 0}
.header h1{font-size:24px;margin-bottom:8px}
.section{margin-bottom:25px;page-break-inside:avoid}
.section-title{font-size:16px;color:#667eea;margin-bottom:15px;padding-bottom:8px;border-bottom:2px solid #667eea}
.field{margin-bottom:12px}
.field-label{font-weight:600;color:#555;font-size:11px;text-transform:uppercase;margin-bottom:4px}
.field-value{color:#333;font-size:13px;padding:6px 0}
.long-text{background:#f8f9fa;padding:12px;border-radius:4px;white-space:pre-wrap}
@media print{body{padding:0;background:white}.instructions{display:none}.container{box-shadow:none;padding:20px}}
</style>
</head><body>
<div class="instructions">
<h2>📄 Save as PDF</h2>
<p><strong>Press Ctrl+P (Windows) or Cmd+P (Mac)</strong>, then select "Save as PDF"</p>
<p><em>This box won't appear in the PDF.</em></p>
</div>
<div class="container">
<div class="header"><h1>2025 Urbanek Education Fund</h1><p>KLA Corporation Scholarship</p></div>
<div class="section"><h2 class="section-title">Application #${app.application_id}</h2>
<div class="field"><div class="field-label">Name</div><div class="field-value">${escapeHtml(app.first_name)} ${escapeHtml(app.last_name)}</div></div>
<div class="field"><div class="field-label">Email</div><div class="field-value">${escapeHtml(app.email)}</div></div>
<div class="field"><div class="field-label">Status</div><div class="field-value">${app.status}</div></div>
<div class="field"><div class="field-label">Submitted</div><div class="field-value">${formatDate(app.submitted_at)}</div></div>
</div>
<div class="section"><h2 class="section-title">Personal Information</h2>
<div class="field"><div class="field-label">Birthday</div><div class="field-value">${formatDate(app.birthday)}</div></div>
<div class="field"><div class="field-label">Gender</div><div class="field-value">${escapeHtml(app.gender)}</div></div>
<div class="field"><div class="field-label">Phone</div><div class="field-value">${escapeHtml(app.phone)}</div></div>
<div class="field"><div class="field-label">Address</div><div class="field-value">${escapeHtml(app.home_address)}, ${escapeHtml(app.city)}, ${escapeHtml(app.state_province)} ${escapeHtml(app.zip_postal_code)}</div></div>
</div>
<div class="section"><h2 class="section-title">Academic</h2>
<div class="field"><div class="field-label">GPA (Weighted)</div><div class="field-value">${app.gpa_weighted || 'N/A'}</div></div>
<div class="field"><div class="field-label">GPA (Non-Weighted)</div><div class="field-value">${app.gpa_non_weighted || 'N/A'}</div></div>
<div class="field"><div class="field-label">University Preference 1</div><div class="field-value">${escapeHtml(app.university_preference_1)}</div></div>
<div class="field"><div class="field-label">Major</div><div class="field-value">${escapeHtml(app.possible_major)}</div></div>
</div>
<div class="section"><h2 class="section-title">Attachments</h2>
<p>${photoFile ? '✅ Photo: '+photoFile : '❌ No photo'}</p>
<p>${transcriptFile ? '✅ Transcript: '+transcriptFile : '❌ No transcript'}</p>
<p>${statementFile ? '✅ Statement: '+statementFile : '❌ No statement'}</p>
<p><small>All files included in this ZIP</small></p>
</div>
<div class="section"><h2 class="section-title">Personal Statement</h2>
<div class="long-text">${escapeHtml(app.personal_statement)}</div>
</div>
</div></body></html>`;

    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks = [];
    archive.on('data', chunk => chunks.push(chunk));
    archive.on('error', err => { throw err; });
    
    archive.append(html, { name: `Application-${app.application_id}.html` });

    if (app.photo_url) {
      try {
        const data = await downloadFile(app.photo_url);
        archive.append(data, { name: photoFile });
        context.log('Photo added');
      } catch (e) { context.log.error('Photo failed:', e.message); }
    }

    if (app.transcript_url) {
      try {
        const data = await downloadFile(app.transcript_url);
        archive.append(data, { name: transcriptFile });
        context.log('Transcript added');
      } catch (e) { context.log.error('Transcript failed:', e.message); }
    }

    if (app.personal_statement_attachment) {
      try {
        const data = await downloadFile(app.personal_statement_attachment);
        archive.append(data, { name: statementFile });
        context.log('Statement added');
      } catch (e) { context.log.error('Statement failed:', e.message); }
    }

    await archive.finalize();
    const buffer = Buffer.concat(chunks);
    context.log('ZIP size:', buffer.length);

    context.res = {
      status: 200,
      body: buffer,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="Application-${app.application_id}-${app.first_name}_${app.last_name}.zip"`,
        'Content-Length': buffer.length.toString()
      },
      isRaw: true
    };

  } catch (error) {
    context.log.error('Error:', error);
    context.res = { status: 500, body: `Failed: ${error.message}`, headers: { 'Content-Type': 'text/plain' } };
  }
};
