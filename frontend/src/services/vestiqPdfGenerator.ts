import type { UserProfile } from '../types';
import type { VestiqChatMessage } from '../components/vestiq/VestiqMessage';

export interface VestiqPdfExportOptions {
  messages: VestiqChatMessage[];
  user: UserProfile | null;
}

/**
 * Strips or cleans basic markdown into safe printable HTML
 */
export function formatMarkdownForPdf(text: string): string {
  if (!text) return '';

  const lines = text.split('\n');
  const outLines: string[] = [];
  let inList = false;
  let inTable = false;
  let tableRows: string[] = [];

  const flushTable = () => {
    if (tableRows.length === 0) return '';
    const valid = tableRows.filter((r) => !r.match(/^\|\s*[-:]+[-|\s:]*\|$/));
    if (valid.length === 0) return '';
    const headers = valid[0].split('|').map((s) => s.trim()).filter(Boolean);
    const body = valid.slice(1).map((r) => r.split('|').map((s) => s.trim()).filter(Boolean));

    let html = '<div class="table-wrap"><table class="pdf-table"><thead><tr>';
    for (const h of headers) {
      html += `<th>${formatInlineMarkdown(h)}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (const row of body) {
      html += '<tr>';
      for (const cell of row) {
        html += `<td>${formatInlineMarkdown(cell)}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table></div>';
    tableRows = [];
    return html;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) inTable = true;
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      inTable = false;
      outLines.push(flushTable());
    }

    // Blank line
    if (!trimmed) {
      if (inList) {
        outLines.push('</ul>');
        inList = false;
      }
      outLines.push('<div class="spacer"></div>');
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      if (inList) { outLines.push('</ul>'); inList = false; }
      outLines.push(`<h4 class="pdf-h4">${formatInlineMarkdown(trimmed.substring(4))}</h4>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { outLines.push('</ul>'); inList = false; }
      outLines.push(`<h3 class="pdf-h3">${formatInlineMarkdown(trimmed.substring(3))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      if (inList) { outLines.push('</ul>'); inList = false; }
      outLines.push(`<h2 class="pdf-h2">${formatInlineMarkdown(trimmed.substring(2))}</h2>`);
      continue;
    }

    // List item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      if (!inList) {
        outLines.push('<ul class="pdf-list">');
        inList = true;
      }
      const itemContent = trimmed.replace(/^[-*]\s+|\d+\.\s+/, '');
      outLines.push(`<li>${formatInlineMarkdown(itemContent)}</li>`);
      continue;
    }

    // If we were in a list, close it
    if (inList) {
      outLines.push('</ul>');
      inList = false;
    }

    // Normal paragraph
    outLines.push(`<p class="pdf-p">${formatInlineMarkdown(trimmed)}</p>`);
  }

  if (inTable) {
    outLines.push(flushTable());
  }
  if (inList) {
    outLines.push('</ul>');
  }

  return outLines.join('\n');
}

/**
 * Format inline bold, code, and financial highlights
 */
export function formatInlineMarkdown(str: string): string {
  return str
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Inline code `code`
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
}

/**
 * Formats conversation into readable plain text for clipboard copying
 */
export function formatConversationAsPlainText(messages: VestiqChatMessage[]): string {
  if (!messages || messages.length === 0) return '';

  const header = [
    'VESTIQ CONVERSATION',
    '==================',
    `Exported: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    '',
  ];

  const body = messages.map((m) => {
    const roleLabel = m.sender === 'user' ? 'You:' : 'VestIQ:';
    return `${roleLabel}\n${m.text.trim()}\n`;
  });

  return [...header, ...body].join('\n');
}

/**
 * Generates and triggers printable PDF view in a new window with SmartVest branding
 */
export function generateVestiqPdf({ messages, user }: VestiqPdfExportOptions): boolean {
  if (!messages || messages.length === 0) return false;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const fileDate = now.toISOString().split('T')[0];
  const docTitle = `SmartVest-VestIQ-Conversation-${fileDate}`;

  const userName = user?.name || 'Investor';
  const userRisk = user?.riskTolerance || 'Moderate';

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open and download your VestIQ conversation PDF.');
    return false;
  }

  const messagesHtml = messages
    .map((msg, index) => {
      const isUser = msg.sender === 'user';
      const roleLabel = isUser ? 'USER' : 'VESTIQ';
      const roleBadgeClass = isUser ? 'badge-user' : 'badge-vestiq';
      const bubbleClass = isUser ? 'bubble-user' : 'bubble-vestiq';
      const formattedBody = isUser
        ? `<p class="pdf-p">${msg.text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')}</p>`
        : formatMarkdownForPdf(msg.text);

      return `
      <div class="turn-container ${isUser ? 'turn-user' : 'turn-vestiq'}" id="turn-${index}">
        <div class="turn-header">
          <span class="role-badge ${roleBadgeClass}">${roleLabel}</span>
          <span class="turn-time">${msg.timestamp || timeFormatted}</span>
        </div>
        <div class="message-bubble ${bubbleClass}">
          ${formattedBody}
        </div>
      </div>
      `;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${docTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #FFFFFF;
      color: #163A5D;
      padding: 40px;
      line-height: 1.6;
      font-size: 13.5px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #388DEB;
      padding-bottom: 20px;
      margin-bottom: 28px;
    }

    .brand-col {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .brand-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #163A5D;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-mark {
      background: #388DEB;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 13px;
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    .brand-sub {
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #4B6680;
    }

    .meta-col {
      text-align: right;
      font-size: 11.5px;
      color: #7A8FA3;
      line-height: 1.5;
    }

    .meta-col strong {
      color: #163A5D;
    }

    /* Advisory summary pill strip */
    .summary-strip {
      background: #F7FAFD;
      border: 1px solid #C3D7EC;
      border-radius: 10px;
      padding: 12px 18px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }

    .summary-strip .item {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .summary-strip .label {
      color: #7A8FA3;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 10.5px;
    }

    .summary-strip .val {
      font-weight: 700;
      color: #163A5D;
    }

    /* Conversation Stream */
    .conversation-stream {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .turn-container {
      page-break-inside: avoid;
      break-inside: avoid;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .turn-user {
      align-items: flex-end;
    }

    .turn-vestiq {
      align-items: flex-start;
    }

    .turn-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
    }

    .role-badge {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 4px;
    }

    .badge-user {
      background: #E4EDF7;
      color: #1B86DC;
      border: 1px solid #C3D7EC;
    }

    .badge-vestiq {
      background: #163A5D;
      color: #FFFFFF;
    }

    .turn-time {
      color: #7A8FA3;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
    }

    .message-bubble {
      padding: 14px 18px;
      border-radius: 12px;
      max-width: 90%;
      font-size: 13px;
      line-height: 1.6;
    }

    .bubble-user {
      background: #F7FAFD;
      border: 1px solid #C3D7EC;
      color: #163A5D;
      border-top-right-radius: 2px;
    }

    .bubble-vestiq {
      background: #FFFFFF;
      border: 1px solid #E4EDF7;
      color: #163A5D;
      border-top-left-radius: 2px;
      box-shadow: 0 1px 3px rgba(22, 58, 93, 0.04);
    }

    /* Typography in messages */
    .pdf-p {
      margin-bottom: 8px;
      color: #163A5D;
    }
    .pdf-p:last-child {
      margin-bottom: 0;
    }

    .pdf-h2 {
      font-size: 15px;
      font-weight: 800;
      color: #163A5D;
      margin: 12px 0 6px 0;
      border-bottom: 1px solid #E4EDF7;
      padding-bottom: 4px;
    }

    .pdf-h3 {
      font-size: 14px;
      font-weight: 700;
      color: #163A5D;
      margin: 10px 0 4px 0;
    }

    .pdf-h4 {
      font-size: 13px;
      font-weight: 700;
      color: #1B86DC;
      margin: 8px 0 4px 0;
    }

    .pdf-list {
      margin: 6px 0 10px 20px;
      color: #163A5D;
    }

    .pdf-list li {
      margin-bottom: 4px;
    }

    .inline-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      background: #E4EDF7;
      color: #0D6AC4;
      padding: 1px 5px;
      border-radius: 4px;
      border: 1px solid #C3D7EC;
    }

    .spacer {
      height: 6px;
    }

    /* Tables */
    .table-wrap {
      margin: 10px 0;
      overflow-x: auto;
    }

    .pdf-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    .pdf-table th {
      background: #F7FAFD;
      color: #163A5D;
      font-weight: 700;
      border: 1px solid #C3D7EC;
      padding: 6px 10px;
      text-align: left;
    }

    .pdf-table td {
      border: 1px solid #E4EDF7;
      padding: 6px 10px;
      color: #4B6680;
    }

    /* Footer & Disclaimer */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #C3D7EC;
      font-size: 10.5px;
      color: #7A8FA3;
      line-height: 1.5;
      page-break-inside: avoid;
    }

    .footer strong {
      color: #163A5D;
    }

    .action-bar {
      margin-top: 30px;
      text-align: center;
    }

    .btn-print {
      background: #388DEB;
      color: #FFFFFF;
      border: none;
      padding: 12px 28px;
      font-size: 14px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      box-shadow: 0 2px 8px rgba(56, 141, 235, 0.25);
    }

    @media print {
      body {
        padding: 20px 25px;
      }
      .action-bar {
        display: none !important;
      }
      .turn-container {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="brand-col">
      <div class="brand-title">
        <span>SmartVest</span>
        <span class="brand-mark">VestIQ</span>
      </div>
      <div class="brand-sub">Portfolio Advisory Conversation Record</div>
    </div>
    <div class="meta-col">
      <div><strong>Export Date:</strong> ${dateFormatted}</div>
      <div><strong>Time:</strong> ${timeFormatted}</div>
      <div><strong>Document ID:</strong> ${docTitle}</div>
    </div>
  </div>

  <!-- SUMMARY STRIP -->
  <div class="summary-strip">
    <div class="item">
      <span class="label">Client Mandate:</span>
      <span class="val">${userName}</span>
    </div>
    <div class="item">
      <span class="label">Risk Stance:</span>
      <span class="val">${userRisk}</span>
    </div>
    <div class="item">
      <span class="label">Total Dialog Turns:</span>
      <span class="val" style="font-family: 'JetBrains Mono', monospace;">${messages.length}</span>
    </div>
  </div>

  <!-- CONVERSATION STREAM -->
  <div class="conversation-stream">
    ${messagesHtml}
  </div>

  <!-- DISCLAIMER -->
  <div class="footer">
    <strong>Regulatory Notice & Institutional Disclosure:</strong><br />
    SmartVest VestIQ is an intelligent financial planning and decision-support advisory system. All analyses, projections, and market evaluations contained in this conversation record are for informational and strategic planning purposes. SmartVest is not a broker-dealer and does not execute securities transactions or custody client assets. Past performance models and simulations do not guarantee future investment returns.
  </div>

  <div class="action-bar">
    <button class="btn-print" onclick="window.print()">
      Print / Save as PDF
    </button>
  </div>

</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  return true;
}
