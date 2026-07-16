import DOMPurify from 'dompurify'

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

export function escapeHtml(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/[&<>"']/g, ch => HTML_ESCAPE_MAP[ch])
}

// DOMPurify-Config: erlaubt Layout/Formatierungs-HTML, verbietet Scripts, on*-Handler, iframes etc.
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'div', 'span', 'strong', 'em', 'b', 'i', 'u', 'br', 'hr',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'code', 'pre', 'kbd', 'sub', 'sup',
    'a'
  ],
  ALLOWED_ATTR: ['style', 'class', 'href', 'target', 'rel', 'colspan', 'rowspan'],
  ALLOW_DATA_ATTR: false,
  // Kein javascript: in href
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
}

/**
 * HTML-Inhalte aus statischen JSON-Datenfiles sanitizen.
 * Erlaubt legitimes Formatierungs-HTML (Tabellen, Listen, style-Attribute),
 * blockiert aber <script>, on*-Attribute, javascript:-URLs und andere XSS-Vektoren.
 */
export function sanitizeHtml(value) {
  if (value === null || value === undefined) return ''
  return DOMPurify.sanitize(String(value), SANITIZE_CONFIG)
}
