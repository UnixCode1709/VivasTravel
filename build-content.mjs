// Rebuild editable visa text and prices from the content file, retaining page layout.
import { readFile, writeFile } from 'node:fs/promises';
const base = new URL('./', import.meta.url);
const data = JSON.parse(await readFile(new URL('visa-content.json', base), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for (const [slug, item] of Object.entries(data)) {
    if (!/^[a-z-]+$/.test(slug) || !item.intro || !item.price) throw new Error('Invalid visa content');
    const path = new URL(`${slug}.html`, base);
    let page = await readFile(path, 'utf8');
    const introduction = `<div class="detail-lead">${item.intro.split(/\n\s*\n/).map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}</div>`;
    page = page.replace(/<p class="detail-lead">[\s\S]*?<\/p>|<div class="detail-lead">[\s\S]*?<\/div>/, () => introduction);
    page = page.replace(/<section class="visa-price-panel"[\s\S]*?<\/section>/, () => `<section class="visa-price-panel" aria-labelledby="price-title"><div><span class="eyebrow">СТОИМОСТЬ ОФОРМЛЕНИЯ</span><h2 id="price-title">${escape(item.price)}</h2><p>${escape(item.priceDescription)}</p></div><div>${item.priceNotes.map(note => `<p>${escape(note)}</p>`).join('')}</div></section>`);
    await writeFile(path, page);
}
for (const slug of ['schengen', 'asia']) {
    const path = new URL(`${slug}.html`, base);
    let page = await readFile(path, 'utf8');
    page = page.replace(/<div class="visa-card[\s\S]*?(?=<div class="visa-card|<\/main>)/g, block => {
        for (const [country, item] of Object.entries(data)) if (block.includes(`href="${country}.html"`)) {
            return block.replace(/(<strong>Стоимость:<\/strong>)\s*[^<]+/, (_, label) => label + ' ' + escape(item.price));
        }
        return block;
    });
    await writeFile(path, page);
}
console.log(`Updated ${Object.keys(data).length} visa pages and price cards.`);
