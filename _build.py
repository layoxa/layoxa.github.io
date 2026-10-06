#!/usr/bin/env python3
"""Build leyoxa.com's text pages from _content/*.md.

Each source becomes two published files with the same words: an HTML page for
people and search (/how-it-works/index.html) and a raw markdown copy for agents
(/how-it-works.md). It also writes llms.txt, llms-full.txt and sitemap.xml.
The home page HTML is hand-made; only its markdown copy comes from here.

Run: python3 _build.py   (no dependencies; handles only the markdown used here)
"""
import html, json, re
from pathlib import Path

ROOT = Path(__file__).parent
SITE = "https://leyoxa.com"
SRC = ROOT / "_content"


def front(text):
    meta, body = {}, text
    if text.startswith("---\n"):
        head, body = text[4:].split("\n---\n", 1)
        for line in head.splitlines():
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip().strip('"')
    return meta, body.strip() + "\n"


def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    return re.sub(r"\[(.+?)\]\((.+?)\)", lambda m: f'<a href="{m[2].replace(".md", "/") if m[2].startswith(SITE) else m[2]}">{m[1]}</a>', s)


def render(body):
    out, faq, lines, i = [], [], body.splitlines(), 0
    while i < len(lines):
        ln = lines[i]
        if not ln.strip():
            i += 1
        elif ln.startswith("# "):
            out.append(f"<h1>{inline(ln[2:])}</h1>"); i += 1
        elif ln.startswith("## "):
            out.append(f"<h2>{inline(ln[3:])}</h2>"); i += 1
        elif ln.startswith("### "):  # a question: the next paragraph is its answer
            q, a = ln[4:], []
            i += 1
            while i < len(lines) and lines[i].strip() and not lines[i].startswith("#"):
                a.append(lines[i]); i += 1
            faq.append((q, " ".join(a)))
            out.append(f"<dt>{inline(q)}</dt><dd>{inline(' '.join(a))}</dd>")
        elif ln.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip("|").split("|")]
                if not set("".join(cells)) <= set("-: "): rows.append(cells)
                i += 1
            th = "".join(f"<th>{inline(c)}</th>" for c in rows[0])
            tb = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows[1:])
            out.append(f"<table><thead><tr>{th}</tr></thead><tbody>{tb}</tbody></table>")
        elif re.match(r"(- |\d+\. )", ln):
            tag = "ul" if ln.startswith("- ") else "ol"
            items = []
            while i < len(lines) and re.match(r"(- |\d+\. )", lines[i]):
                items.append(re.sub(r"^(- |\d+\. )", "", lines[i])); i += 1
            out.append(f"<{tag}>" + "".join(f"<li>{inline(x)}</li>" for x in items) + f"</{tag}>")
        else:
            para = []
            while i < len(lines) and lines[i].strip() and not re.match(r"(#|- |\d+\. |\|)", lines[i]):
                para.append(lines[i]); i += 1
            out.append(f"<p>{inline(' '.join(para))}</p>")
    htm = "\n".join(out)
    # questions sit in one definition list
    htm = re.sub(r"((?:<dt>.*?</dd>\n?)+)", r'<dl class="faq">\1</dl>', htm)
    # the first paragraph after the title is the lede
    htm = re.sub(r"(</h1>\n)<p>", r'\1<p class="lede">', htm, count=1)
    return htm, faq


NAV = """<header class="nav solid">
  <a class="brand" href="/" aria-label="Leyoxa home">
    <svg viewBox="0 0 40 40" width="26" height="26" aria-hidden="true"><defs><linearGradient id="g" x1="0" y1="0" x2="40" y2="40"><stop stop-color="#7b7bff"/><stop offset="1" stop-color="#b6d84a"/></linearGradient></defs><circle cx="20" cy="20" r="17" fill="none" stroke="url(#g)" stroke-width="2"/><g stroke="url(#g)" stroke-width="1.1" stroke-linecap="round"><path d="M20 20V8.5M20 20l7.5-9.5M20 20l11.5-3.5M20 20l10.8 4.5M20 20l5 10.5M20 20l-3.5 11.2M20 20l-10.2-6.5M20 20l-11.5-1.5M20 20l-7.5-8.7"/></g><circle cx="20" cy="20" r="3" fill="url(#g)"/></svg>
    <span>Leyoxa</span>
  </a>
  <nav><a href="/how-it-works/">How it works</a><a href="/praxis/">Praxis</a><a href="/faq/">FAQ</a><a class="pill" href="/#partner">Partner with us</a></nav>
</header>"""


def page(meta, htm, faq, slug):
    url = SITE + meta["path"]
    graph = [
        {"@type": "WebPage", "@id": url, "url": url, "name": meta["seo_title"], "description": meta["description"],
         "dateModified": meta["updated"], "isPartOf": {"@id": SITE + "/#site"}, "publisher": {"@id": SITE + "/#org"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Leyoxa", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": meta["title"], "item": url}]},
        {"@type": "Organization", "@id": SITE + "/#org", "name": "Leyoxa", "legalName": "Leyoxa LLC", "url": SITE + "/"},
    ]
    if faq:
        strip = lambda s: re.sub(r"\[(.+?)\]\(.+?\)", r"\1", s).replace("**", "")
        graph.append({"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": strip(a)}} for q, a in faq]})
    ld = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)
    e = lambda s: html.escape(s, quote=True)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(meta["seo_title"])}</title>
<meta name="description" content="{e(meta["description"])}">
<meta name="theme-color" content="#07070b">
<link rel="canonical" href="{url}">
<link rel="alternate" type="text/markdown" href="/{slug}.md" title="Markdown version">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="article">
<meta property="og:title" content="{e(meta["seo_title"])}">
<meta property="og:description" content="{e(meta["description"])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
<script type="application/ld+json">{ld}</script>
</head>
<body class="sub">
{NAV}
<main>
<article class="doc">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Leyoxa</a> / {e(meta["title"])}</nav>
{htm}
<p class="updated">Updated <time datetime="{meta["updated"]}">{meta["updated"]}</time> · <a href="/{slug}.md">Read as markdown</a></p>
<section class="end"><h2>Have the customers?</h2><p>Tell us about your business and the problem that keeps costing you.</p><a class="btn" href="mailto:contact@leyoxa.com?subject=Partnership">contact@leyoxa.com</a></section>
</article>
</main>
<footer><span>© 2026 Leyoxa LLC · Texas</span><span>Toronto · Austin</span></footer>
</body>
</html>
"""


def main():
    pages, full = [], []
    for src in sorted(SRC.glob("*.md")):
        meta, body = front(src.read_text())
        slug = src.stem
        (ROOT / f"{slug}.md").write_text(body)
        full.append(body)
        if slug == "index":
            continue
        htm, faq = render(body)
        out = ROOT / slug / "index.html"
        out.parent.mkdir(exist_ok=True)
        out.write_text(page(meta, htm, faq if meta.get("faq") else [], slug))
        pages.append((meta, slug))

    links = "\n".join(f"- [{m['title']}]({SITE}/{s}.md): {m['description']}" for m, s in pages)
    (ROOT / "llms.txt").write_text(f"""# Leyoxa

> Leyoxa LLC is an AI venture studio. It co-builds vertical AI companies with operators who already have customers: the operator brings customers, industry knowledge and a costly operational problem; Leyoxa brings the engineering, AI systems and security for regulated data, and takes part of its return in equity.

Every page is also published as markdown. Contact: contact@leyoxa.com. Founder: Sepehr Aflatounian (https://sepehrafla.github.io).

## Pages

- [Home]({SITE}/index.md): What Leyoxa is, how it builds, and its first partnership.
{links}

## Optional

- [Everything in one file]({SITE}/llms-full.txt)
""")
    (ROOT / "llms-full.txt").write_text("\n\n---\n\n".join(full))
    urls = [("/", "2026-10-06")] + [(m["path"], m["updated"]) for m, _ in pages]
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "".join(f"  <url><loc>{SITE}{p}</loc><lastmod>{d}</lastmod></url>\n" for p, d in urls) + "</urlset>\n")
    print("built", [s for _, s in pages])


if __name__ == "__main__":
    main()
