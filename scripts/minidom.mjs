// Kleiner HTML-Leser ohne Abhängigkeiten – gerade genug DOM für die nuLiga-Tabellen.
// Unterstützt: doc.querySelectorAll('table.result-set'), table.rows, row.cells,
// el.textContent, el.querySelector('[title]'), el.querySelector('a[href*="…"]'), el.getAttribute().

const ENT = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß', eacute: 'é', acute: '´', ndash: '–', mdash: '—' };
export const decode = s => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e] ?? m));

const textOf = h => decode(h
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, ''));

function attrs(tag) {
  const a = {};
  tag.replace(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g, (_, k, __, d, s, b) => { a[k.toLowerCase()] = decode(d ?? s ?? b ?? ''); });
  return a;
}

class El {
  constructor(tag, html) { this.tag = tag; this.html = html; this._a = attrs(tag); }
  get textContent() { return textOf(this.html); }
  getAttribute(n) { return this._a[n.toLowerCase()] ?? null; }
  get className() { return this._a.class || ''; }
  /** Erstes Element, das passt: '[title]', 'a[href*="x"]' oder ein Tagname */
  querySelector(sel) {
    let m;
    if ((m = sel.match(/^\[(\w+)\]$/))) return firstTag(this.html, null, a => m[1] in a);
    if ((m = sel.match(/^(\w+)\[(\w+)\*="([^"]+)"\]$/))) return firstTag(this.html, m[1], a => (a[m[2]] || '').includes(m[3]));
    if ((m = sel.match(/^(\w+)$/))) return firstTag(this.html, m[1], () => true);
    throw new Error('minidom: Selektor nicht unterstützt: ' + sel);
  }
}

function firstTag(html, name, test) {
  const re = name ? new RegExp(`<(${name})\\b([^>]*)>`, 'gi') : /<([a-z][\w-]*)\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(html))) {
    const a = attrs(m[0]);
    if (!test(a)) continue;
    const tag = m[1].toLowerCase();
    const close = new RegExp(`</${tag}\\s*>`, 'i');
    const rest = html.slice(m.index + m[0].length);
    const c = rest.search(close);
    return new El(m[0], c < 0 ? '' : rest.slice(0, c));
  }
  return null;
}

/** Teilt HTML in gleichnamige Blöcke auf und berücksichtigt dabei Verschachtelung */
function blocks(html, tag) {
  const out = [], re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  let depth = 0, start = -1, open = '', m;
  while ((m = re.exec(html))) {
    if (!m[1]) { if (depth === 0) { start = re.lastIndex; open = m[0]; } depth++; }
    else if (depth > 0 && --depth === 0) out.push(new El(open, html.slice(start, m.index)));
  }
  return out;
}

class Table extends El {
  get rows() {
    return blocks(this.html, 'tr').map(r => Object.assign(r, { cells: blocks(r.html, 't[dh]') }));
  }
}

export class MiniDocument {
  constructor(html) { this.html = String(html).replace(/<!--[\s\S]*?-->/g, ''); }
  querySelectorAll(sel) {
    const m = sel.match(/^table\.([\w-]+)$/);
    if (!m) throw new Error('minidom: Selektor nicht unterstützt: ' + sel);
    // Alle Tabellen in jeder Verschachtelungstiefe finden (nuLiga steckt sie teils in Layout-Tabellen)
    const out = [], re = /<(\/?)table\b[^>]*>/gi, stack = [];
    let t;
    while ((t = re.exec(this.html))) {
      if (!t[1]) stack.push({ open: t[0], start: re.lastIndex });
      else if (stack.length) {
        const o = stack.pop();
        const el = new Table(o.open, this.html.slice(o.start, t.index));
        if (el.className.split(/\s+/).includes(m[1])) out.push({ pos: o.start, el });
      }
    }
    return out.sort((x, y) => x.pos - y.pos).map(x => x.el);
  }
}
