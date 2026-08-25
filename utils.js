/* =========================================================
   PerralVPN — Utilities
   ========================================================= */

/** Escape any user/mock-provided string before injecting into innerHTML — prevents XSS. */
function escapeHTML(str){
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Basic client-side URL validation for avatar/link inputs. */
function isValidHttpUrl(value){
  try{
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  }catch{ return false; }
}

function safeExternalUrl(value, fallback = '#'){
  return isValidHttpUrl(value) ? String(value) : fallback;
}

function debounce(fn, wait = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

function formatCurrency(n){
  return new Intl.NumberFormat('vi-VN').format(n) + '₫';
}

function formatDate(dateStr, lang = 'vi'){
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatGB(n){
  return `${n} GB`;
}

async function copyToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
    return true;
  }catch{
    // Fallback for environments without Clipboard API permission
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try{ ok = document.execCommand('copy'); }catch{}
    document.body.removeChild(ta);
    return ok;
  }
}

function qs(sel, root = document){ return root.querySelector(sel); }
function qsa(sel, root = document){ return Array.from(root.querySelectorAll(sel)); }
