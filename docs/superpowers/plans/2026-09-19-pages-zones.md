# Pages de zone (SEO local) — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** publier 4 pages de zone (Presqu'île guérandaise, Pays de la Roche-Bernard, Saint-Nazaire – Brière, Muzillac – Vannes) conformes à la spec `docs/superpowers/specs/2026-09-19-pages-zones-design.md`, une PR par page.

**Architecture :** chaque page est un fichier HTML statique à la racine, construit sur le gabarit d'`a-propos.html` (mêmes classes CSS, aucun CSS nouveau). Un script de vérification hors dépôt contrôle chaque page avant la PR (balises, JSON-LD, mots interdits, chiffres, liens, unicité). Les articles de blog remplacés sont redirigés dans `vercel.json`.

**Tech stack :** HTML/CSS statique, Vercel (`vercel.json`), Python 3 (stdlib) pour la vérification, Playwright (venv claude-seo) pour le rendu, `gh` pour les PR.

**Règles du dépôt (`CLAUDE.md`) qui s'appliquent à chaque tâche :** une branche `seo/S-00X-<slug>` par ticket, jamais de commit sur `main`, 3 fichiers maximum par PR, aucune dépendance ni build step, aucun chiffre inventé, vouvoiement, phrases courtes, mots interdits proscrits. Un humain merge.

---

## Fichiers

| Fichier | Rôle | Tickets |
|---|---|---|
| `C:/Users/emart/seo-audits/tools/check_zone_page.py` | Vérification d'une page de zone (hors dépôt, jamais commité) | tous |
| `C:/Users/emart/seo-audits/tools/render_zone_page.py` | Captures Playwright 375 / 1366 px (hors dépôt) | tous |
| `C:/Users/emart/seo-audits/expia.fr-audit/zones/<slug>-faits.md` | Faits locaux sourcés d'une zone (hors dépôt) | S-006 à S-009 |
| `<slug>.html` | Page de zone | S-006 à S-009 |
| `sitemap.xml` | Ajout de la page, retrait de l'article redirigé | S-006 à S-009 |
| `vercel.json` | Redirection permanente de l'article de blog remplacé | S-006, S-007 |
| `index.html`, `blog/index.html` | Maillage (bloc « Zones d'intervention », retrait des articles) | S-010 |
| `llms.txt` | Pages de zone à la place des articles | S-011 |
| les 3 premières pages de zone | Liens retour vers les zones publiées après elles | S-012 |

## Paramètres par zone

| Clé | Presqu'île (S-006) | Roche-Bernard (S-007) | Saint-Nazaire (S-008) | Vannes (S-009) |
|---|---|---|---|---|
| `SLUG` | `agence-ia-presquile-guerandaise` | `agence-ia-la-roche-bernard` | `agence-ia-saint-nazaire` | `agence-ia-vannes-muzillac` |
| `URL` | `https://expia.fr/agence-ia-presquile-guerandaise.html` | `https://expia.fr/agence-ia-la-roche-bernard.html` | `https://expia.fr/agence-ia-saint-nazaire.html` | `https://expia.fr/agence-ia-vannes-muzillac.html` |
| `ZONE` | Presqu'île guérandaise | Pays de la Roche-Bernard | Saint-Nazaire et Brière | Muzillac et Vannes |
| `TITLE` (50–60) | Agence IA La Baule & Guérande pour artisans du BTP \| EXPIA (58) | Agence IA La Roche-Bernard & Férel · artisans BTP \| EXPIA (57) | Agence IA Saint-Nazaire & Brière · artisans BTP \| EXPIA (55) | Agence IA Vannes & Muzillac pour artisans du BTP \| EXPIA (56) |
| `DESC` (140–160) | Automatisation IA pour les artisans du BTP de La Baule, Guérande, Le Croisic et toute la presqu'île : devis, relances et suivi de chantier. Dès 397 €. (150) | Automatisation IA pour les artisans du BTP de La Roche-Bernard, Férel, Nivillac, Pénestin et Herbignac : devis, relances, suivi de chantier. Dès 397 €. (151) | Automatisation IA pour les artisans du BTP de Saint-Nazaire, Montoir, Trignac et de la Brière : devis, relances et suivi de chantier. Dès 397 €. (144) | Automatisation IA pour les artisans du BTP de Vannes, Muzillac, Damgan, Sarzeau et Theix-Noyalo : devis, relances et suivi de chantier. Dès 397 €. (146) |
| `H1` | Automatisation IA pour les artisans du BTP de La Baule, Guérande et de la presqu'île | Automatisation IA pour les artisans du BTP de La Roche-Bernard, Férel et alentours | Automatisation IA pour les artisans du BTP de Saint-Nazaire et de la Brière | Automatisation IA pour les artisans du BTP de Vannes, Muzillac et du littoral |
| `COMMUNES` | Guérande, La Baule-Escoublac, Le Croisic, Batz-sur-Mer, Le Pouliguen, Pornichet, La Turballe, Piriac-sur-Mer, Mesquer, Saint-Molf | Férel, Camoël, Pénestin, La Roche-Bernard, Nivillac, Arzal, Marzan, Herbignac, Assérac, Saint-Lyphard | Saint-Nazaire, Montoir-de-Bretagne, Trignac, Saint-André-des-Eaux, La Chapelle-des-Marais | Muzillac, Damgan, Ambon, Sarzeau, Theix-Noyalo, Vannes |
| `REDIRECT_FROM` | `/blog/agence-ia-presquile-guerandaise.html` | `/blog/automatisation-ia-la-roche-bernard-sud-morbihan.html` | — | — |
| `GUIDES` | `/blog/automatisation-taches-tpe-pme.html`, `/blog/agent-ia-c-est-quoi-artisan-tpe.html` | `/blog/automatisation-taches-tpe-pme.html`, `/blog/chatbot-site-web-tpe.html` | `/blog/agent-ia-c-est-quoi-artisan-tpe.html`, `/blog/chatbot-site-web-tpe.html` | `/blog/automatisation-taches-tpe-pme.html`, `/blog/agent-ia-c-est-quoi-artisan-tpe.html` |
| Zones déjà publiées à lier | aucune | Presqu'île | Presqu'île, Roche-Bernard | les 3 autres |
| Pistes locales (à vérifier) | résidences secondaires, saisonnalité, cité médiévale de Guérande et ses abords, marais salants | Petite Cité de Caractère, bords de Vilaine, pont, secteur rural | Parc naturel régional de Brière, chaumières et couvreurs chaumiers, bassin industriel (chantiers navals, aéronautique) | centre historique de Vannes, golfe du Morbihan, bassin plus urbain avec des entreprises BTP plus grosses |

Les tâches 1 et 2 ne se font qu'une fois. Les tâches 3 à 9 forment la procédure d'une page : on l'exécute pour S-006, puis on la répète pour S-007, S-008 et S-009 avec les valeurs de la colonne correspondante.

---

### Task 1 : script de vérification (une seule fois)

**Files :**
- Create : `C:/Users/emart/seo-audits/tools/check_zone_page.py`

- [ ] **Step 1 : écrire le script**

```python
#!/usr/bin/env python3
"""Vérifie une page de zone expia.fr selon la spec 2026-09-19-pages-zones-design.md.

Usage :
  python check_zone_page.py REPO PAGE --url URL --communes "A,B,C" [--compare AUTRE.html ...]
Sortie : une ligne PASS/FAIL par contrôle ; code 0 si tout passe, 1 sinon.
"""
import argparse
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

FORBIDDEN = [
    "révolutionner", "révolutionne", "propulsé par l'ia", "solution innovante",
    "booster", "game changer", "à l'ère de l'ia", "le meilleur", "leader",
    "fine-tuning", "time-to-market", "nos clients",
]
FORBIDDEN_WORDS = ["rag", "erp", "nous"]  # mots entiers
ALLOWED_NUMBERS = {"397", "48", "01", "02", "03", "04", "06", "95", "27", "44", "74", "56"}


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title, self.meta, self.links = "", {}, []
        self.canonical, self.h1, self.jsonld = None, 0, []
        self.main_text, self._in_main, self._capture, self._buf = [], 0, None, []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self._capture, self._buf = "title", []
        elif tag == "script" and a.get("type") == "application/ld+json":
            self._capture, self._buf = "jsonld", []
        elif tag in ("script", "style"):
            self._capture = "skip"
        elif tag == "meta" and a.get("name"):
            self.meta[a["name"]] = a.get("content", "")
        elif tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href")
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])
        if tag == "h1":
            self.h1 += 1
        if tag == "main":
            self._in_main += 1

    def handle_endtag(self, tag):
        if tag == "title" and self._capture == "title":
            self.title, self._capture = "".join(self._buf).strip(), None
        elif tag == "script" and self._capture in ("jsonld", "skip"):
            if self._capture == "jsonld":
                self.jsonld.append("".join(self._buf))
            self._capture = None
        elif tag == "style" and self._capture == "skip":
            self._capture = None
        if tag == "main":
            self._in_main -= 1

    def handle_data(self, data):
        if self._capture in ("title", "jsonld"):
            self._buf.append(data)
        elif self._capture is None and self._in_main > 0:
            self.main_text.append(data)


def parse(path):
    p = Page()
    p.feed(Path(path).read_text(encoding="utf-8"))
    return p


def words(page):
    return " ".join(page.main_text).split()


def shingles(ws, n=5):
    ws = [w.lower() for w in ws]
    return {tuple(ws[i:i + n]) for i in range(len(ws) - n + 1)}


def nodes(blocks):
    out = []
    for raw in blocks:
        data = json.loads(raw)
        out.extend(data.get("@graph", [data]))
    return out


def resolve(repo, page_path, href):
    href = href.split("#")[0].split("?")[0]
    if not href:
        return None
    if href.startswith("/"):
        target = repo / href.lstrip("/")
    else:
        target = (page_path.parent / href)
    if href.endswith("/") or target.is_dir():
        target = target / "index.html"
    return target


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repo")
    ap.add_argument("page")
    ap.add_argument("--url", required=True)
    ap.add_argument("--communes", required=True)
    ap.add_argument("--compare", nargs="*", default=[])
    args = ap.parse_args()

    repo, page_path = Path(args.repo), Path(args.repo) / args.page
    p = parse(page_path)
    text = " ".join(words(p))
    low = text.lower()
    results = []

    def check(name, ok, detail=""):
        results.append(ok)
        print(f"{'PASS' if ok else 'FAIL'} {name}{': ' + detail if detail else ''}")

    check("title 50-60", 50 <= len(p.title) <= 60, f"{len(p.title)} « {p.title} »")
    desc = p.meta.get("description", "")
    check("meta description 140-160", 140 <= len(desc) <= 160, str(len(desc)))
    check("un seul H1", p.h1 == 1, str(p.h1))
    check("canonical", p.canonical == args.url, str(p.canonical))
    check("robots index", "index" in p.meta.get("robots", "") and "noindex" not in p.meta.get("robots", ""))

    try:
        ns = nodes(p.jsonld)
        types = [n.get("@type") for n in ns]
        service = [n for n in ns if n.get("@type") == "Service"]
        crumbs = [n for n in ns if n.get("@type") == "BreadcrumbList"]
        check("JSON-LD valide", True, ", ".join(map(str, types)))
        check("Service rattaché à #business",
              bool(service) and service[0].get("provider", {}).get("@id") == "https://expia.fr/#business")
        check("BreadcrumbList vers la page",
              bool(crumbs) and crumbs[0]["itemListElement"][-1]["item"] == args.url)
        check("pas de FAQPage", "FAQPage" not in types)
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        check("JSON-LD valide", False, repr(e))

    n = len(words(p))
    check("700-1000 mots dans <main>", 700 <= n <= 1000, str(n))

    hits = [t for t in FORBIDDEN if t in low]
    hits += [w for w in FORBIDDEN_WORDS if re.search(rf"\b{w}\b", low)]
    check("aucun mot interdit", not hits, ", ".join(hits))

    nums = sorted(set(re.findall(r"\d+", text)) - ALLOWED_NUMBERS)
    check("aucun chiffre hors liste autorisée", not nums, ", ".join(nums))

    missing = [c for c in args.communes.split(",") if c.strip() and c.strip() not in text]
    check("toutes les communes citées", not missing, ", ".join(missing))

    broken = []
    for href in p.links:
        if href.startswith(("http", "mailto:", "tel:", "#")):
            continue
        target = resolve(repo, page_path, href)
        if target is not None and not target.exists():
            broken.append(href)
    check("liens internes existants", not broken, ", ".join(broken))

    mine = shingles(words(p))
    for other in args.compare:
        theirs = shingles(words(parse(repo / other)))
        ratio = len(mine & theirs) / max(len(mine), 1)
        check(f"unicité vs {other} < 40 %", ratio < 0.40, f"{ratio:.0%}")

    sys.exit(0 if all(results) else 1)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2 : vérifier qu'il échoue sur une page qui n'est pas une page de zone**

Run :
```bash
python C:/Users/emart/seo-audits/tools/check_zone_page.py C:/Users/emart/projects/EXPIA a-propos.html --url https://expia.fr/agence-ia-presquile-guerandaise.html --communes "Guérande,Le Croisic"
```
Expected : code de sortie 1, avec au minimum `FAIL title 50-60` (84 caractères), `FAIL canonical`, `FAIL Service rattaché à #business`, `FAIL toutes les communes citées: Le Croisic`.

### Task 2 : script de rendu (une seule fois)

**Files :**
- Create : `C:/Users/emart/seo-audits/tools/render_zone_page.py`

- [ ] **Step 1 : écrire le script**

```python
"""Capture une page locale à 375 et 1366 px et signale les débordements.
Usage : <venv claude-seo>/python render_zone_page.py REPO PAGE OUTDIR
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

repo, page, out = Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
url = (repo / page).resolve().as_uri()
with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for w, h in [(375, 812), (1366, 768)]:
        tab = browser.new_page(viewport={"width": w, "height": h})
        errors = []
        tab.on("pageerror", lambda e: errors.append(str(e)))
        tab.goto(url)
        tab.evaluate("document.querySelectorAll('.reveal').forEach(e => e.classList.add('visible'))")
        tab.wait_for_timeout(800)
        info = tab.evaluate("""() => ({
            h1: document.querySelector('h1')?.innerText,
            phoneVisible: getComputedStyle(document.querySelector('.nav-phone')).display !== 'none',
            overflowPx: document.documentElement.scrollWidth - innerWidth })""")
        print(w, info, "js errors:", errors)
        tab.screenshot(path=str(out / f"{Path(page).stem}_{w}.png"), full_page=True)
    browser.close()
```

- [ ] **Step 2 : le lancer sur `index.html` pour valider l'outil**

Run :
```bash
C:/Users/emart/AppData/Local/claude-seo/.venv/Scripts/python.exe C:/Users/emart/seo-audits/tools/render_zone_page.py C:/Users/emart/projects/EXPIA index.html C:/Users/emart/seo-audits/expia.fr-audit/zones/shots
```
Expected : deux lignes (375 et 1366), `phoneVisible: True` à 375 et `False` à 1366, aucune erreur JS, deux captures créées. Un `overflowPx` de 13 à 375 px sur l'accueil est connu (anneau décoratif du hero, présent sur `main`) et n'est pas bloquant.

---

## Procédure d'une page (S-006, puis S-007, S-008, S-009)

### Task 3 : branche

- [ ] **Step 1**

```bash
cd C:/Users/emart/projects/EXPIA && git checkout main && git pull && git checkout -b seo/S-006-page-presquile-guerandaise
```
Pour les tickets suivants : `seo/S-007-page-la-roche-bernard`, `seo/S-008-page-saint-nazaire`, `seo/S-009-page-vannes-muzillac`.

### Task 4 : faits locaux sourcés

**Files :**
- Create : `C:/Users/emart/seo-audits/expia.fr-audit/zones/<SLUG>-faits.md`

- [ ] **Step 1 : rechercher chaque piste locale de la zone** (ligne « Pistes locales » du tableau) avec WebSearch, puis ouvrir la source avec WebFetch. Sources acceptées : site officiel de la commune ou de l'intercommunalité (Cap Atlantique, Arc Sud Bretagne, CARENE, Golfe du Morbihan – Vannes agglomération), Parc naturel régional de Brière, Petites Cités de Caractère, CMA / CCI, INSEE, office de tourisme, Ministère de la Culture (monuments historiques).

- [ ] **Step 2 : écrire le fichier de faits**, un fait par ligne, au format :

```markdown
| # | Fait (tel qu'il sera écrit sur la page) | Source (URL) | Consultée le |
|---|---|---|---|
| 1 | La cité médiévale de Guérande est entourée de remparts classés monument historique. | https://… | 2026-09-19 |
```

Règles : ne garder que les faits lus dans la source ouverte ; aucun chiffre (population, nombre de logements…) — le vérificateur les refuse ; au moins 3 faits utilisables ; tout fait non confirmé est supprimé, pas reformulé.

### Task 5 : la page

**Files :**
- Create : `<SLUG>.html` (racine du dépôt)

- [ ] **Step 1 : créer le fichier avec ce gabarit**, en remplaçant les valeurs entre `«…»` par celles du tableau de paramètres et en rédigeant les textes selon les consignes en commentaire. Supprimer ces commentaires de consigne avant le commit.

```html
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script>document.documentElement.classList.add('js');</script>

    <!-- ========== SEO ========== -->
    <title>«TITLE»</title>
    <meta name="description" content="«DESC»">
    <link rel="canonical" href="«URL»">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="author" content="Esteban Marteil">
    <meta http-equiv="content-language" content="fr">

    <!-- ========== FAVICON ========== -->
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.png" type="image/png" sizes="512x512">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <!-- ========== Open Graph ========== -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="EXPIA">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:title" content="«TITLE»">
    <meta property="og:description" content="«DESC»">
    <meta property="og:url" content="«URL»">
    <meta property="og:image" content="https://expia.fr/og-image.jpg">

    <!-- ========== Twitter / X ========== -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="«TITLE»">
    <meta name="twitter:description" content="«DESC»">
    <meta name="twitter:image" content="https://expia.fr/og-image.jpg">

    <!-- Preload -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="styles.css">

    <!-- ========== Structured Data (JSON-LD) ========== -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": "«URL»#webpage",
          "url": "«URL»",
          "name": "«TITLE»",
          "description": "«DESC»",
          "inLanguage": "fr-FR",
          "isPartOf": { "@id": "https://expia.fr/#website" },
          "about": { "@id": "«URL»#service" },
          "breadcrumb": { "@id": "«URL»#breadcrumb" }
        },
        {
          "@type": "Service",
          "@id": "«URL»#service",
          "name": "Automatisation IA pour les artisans du BTP – «ZONE»",
          "serviceType": [
            "Automatisation des devis et des relances",
            "Suivi de chantier automatisé",
            "Tri et réponse aux e-mails"
          ],
          "provider": { "@id": "https://expia.fr/#business" },
          "areaServed": [
            «une entrée par commune de COMMUNES : { "@type": "City", "name": "Guérande" }, … »
          ],
          "offers": {
            "@type": "Offer",
            "priceSpecification": {
              "@type": "PriceSpecification",
              "minPrice": 397,
              "priceCurrency": "EUR"
            }
          }
        },
        {
          "@type": "BreadcrumbList",
          "@id": "«URL»#breadcrumb",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://expia.fr/" },
            { "@type": "ListItem", "position": 2, "name": "«ZONE»", "item": "«URL»" }
          ]
        }
      ]
    }
    </script>
</head>

<body>
    <!-- Grain Texture Overlay -->
    <div class="grain"></div>

    <!-- Ambient Blobs -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <!-- Cursor Glow -->
    <div class="cursor-glow" id="cursorGlow"></div>

    <!-- ========== NAVIGATION ========== -->
    <header class="navbar">
        <div class="container nav-container">
            <a href="/" class="logo">EXPIA</a>
            <nav class="nav-links">
                <a href="/#services">Services</a>
                <a href="/#processus">Processus</a>
                <a href="/#faq">FAQ</a>
                <a href="/#contact">Contact</a>
                <a href="a-propos.html">À propos</a>
                <a href="blog/">Blog</a>
            </nav>
            <a href="tel:+33695274474" class="btn btn-outline nav-phone" aria-label="Appeler le 06 95 27 44 74">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                06 95 27 44 74
            </a>
            <a href="/#contact" class="btn btn-outline nav-btn">
                Démarrer un projet
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
        </div>
    </header>

    <main>
        <!-- ========== HERO ========== -->
        <section class="hero">
            <div class="container hero-container">
                <div class="hero-content">
                    <div class="badge reveal">
                        <span class="badge-dot"></span>
                        «ZONE»
                    </div>
                    <h1 class="hero-title reveal">«H1»</h1>
                    <p class="hero-subtitle reveal">
                        <!-- Consigne : 2 à 3 phrases, 40 à 60 mots. Qui je suis (Esteban Marteil,
                             entreprise individuelle à Férel), je me déplace dans la zone, je vous
                             fais gagner du temps sur les devis, les relances et le suivi de chantier. -->
                    </p>
                    <div class="hero-actions reveal">
                        <a href="tel:+33695274474" class="btn btn-primary glow-effect">
                            Appeler le 06 95 27 44 74
                        </a>
                        <a href="#automatiser" class="btn btn-secondary">Ce que j'automatise</a>
                    </div>
                    <p class="hero-price reveal">Premières automatisations dès <strong>397 €</strong>.</p>
                </div>
                <div class="hero-visual reveal">
                    <div class="glass-orb">
                        <div class="orb-inner"></div>
                        <div class="orb-ring ring-1"></div>
                        <div class="orb-ring ring-2"></div>
                        <div class="orb-particle p-1"></div>
                        <div class="orb-particle p-2"></div>
                        <div class="orb-particle p-3"></div>
                        <div class="orb-particle p-4"></div>
                        <div class="orb-particle p-5"></div>
                        <div class="orb-particle p-6"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ========== LE SECTEUR ========== -->
        <section class="services">
            <div class="container">
                <div class="section-header reveal">
                    <span class="section-tag">Le secteur</span>
                    <h2 class="section-title"><!-- Consigne : titre court propre à la zone, avec un mot en <span class="text-gradient"> --></h2>
                    <p class="section-desc"><!-- Consigne : 40 à 60 mots sur ce qui marque le travail des artisans ici, à partir des faits du fichier <SLUG>-faits.md --></p>
                </div>

                <div class="bento-grid">
                    <div class="bento-card bento-hero reveal">
                        <div class="card-accent"></div>
                        <div class="card-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                        </div>
                        <div class="card-content">
                            <span class="card-tag">Où j'interviens</span>
                            <h3 class="card-title">Les communes de la zone</h3>
                            <p class="card-text"><!-- Consigne : 30 à 50 mots. Je me déplace sur vos chantiers et dans vos bureaux dans ces communes, ou en visio si vous préférez. --></p>
                            <ul class="card-features">
                                <!-- Une <li> par commune de COMMUNES, dans l'ordre du tableau -->
                            </ul>
                        </div>
                    </div>

                    <div class="bento-card reveal">
                        <div class="card-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>
                            </svg>
                        </div>
                        <div class="card-content">
                            <h3 class="card-title"><!-- Consigne : fait local n°1 en titre court --></h3>
                            <p class="card-text"><!-- Consigne : 60 à 90 mots. Le fait (sourcé), puis ce que ça change pour un artisan : contraintes, paperasse, délais. --></p>
                        </div>
                    </div>

                    <div class="bento-card reveal">
                        <div class="card-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                            </svg>
                        </div>
                        <div class="card-content">
                            <h3 class="card-title"><!-- Consigne : fait local n°2 en titre court --></h3>
                            <p class="card-text"><!-- Consigne : 60 à 90 mots, même logique que la carte précédente. --></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ========== CE QUE J'AUTOMATISE ICI ========== -->
        <section class="services" id="automatiser">
            <div class="container">
                <div class="section-header reveal">
                    <span class="section-tag">Ce que j'automatise</span>
                    <h2 class="section-title">Moins de paperasse, <span class="text-gradient">plus de chantier</span></h2>
                    <p class="section-desc"><!-- Consigne : 30 à 50 mots qui relient la section précédente aux automatisations ci-dessous. --></p>
                </div>

                <div class="bento-grid">
                    <!-- Consigne : 3 cartes, même balisage que la section précédente (la 1re avec bento-hero
                         et card-accent). Chaque carte = une automatisation reliée à un fait local :
                         card-title (4 à 8 mots), card-text (60 à 90 mots : la situation sur un chantier
                         de la zone, ce que l'automatisation fait, ce que l'artisan n'a plus à faire),
                         et pour la 1re carte une <ul class="card-features"> de 3 éléments.
                         Candidats : relance automatique des devis, compte rendu de chantier envoyé au
                         client, tri des e-mails et des demandes, rappel des rendez-vous, assistant qui
                         note les tâches dictées au téléphone. Aucun chiffre de gain. -->
                </div>
            </div>
        </section>

        <!-- ========== COMMENT ON TRAVAILLE ========== -->
        <section class="process">
            <div class="container">
                <div class="section-header reveal">
                    <span class="section-tag">Comment on travaille</span>
                    <h2 class="section-title">Simple, <span class="text-gradient">sur place</span> et à prix fixé</h2>
                </div>

                <div class="process-timeline">
                    <div class="process-line"></div>
                    <div class="process-steps">
                        <div class="process-step reveal">
                            <div class="step-marker"><span>01</span><div class="step-dot"></div></div>
                            <div class="step-content">
                                <h3>On s'appelle</h3>
                                <p>Vous m'expliquez ce qui vous prend du temps. Je vous pose des questions sur vos chantiers et vos outils actuels.</p>
                            </div>
                        </div>
                        <div class="process-step reveal">
                            <div class="step-marker"><span>02</span><div class="step-dot"></div></div>
                            <div class="step-content">
                                <h3>Je vous fais une proposition</h3>
                                <p>Ce que je mets en place, et le prix, fixé avant de commencer.</p>
                            </div>
                        </div>
                        <div class="process-step reveal">
                            <div class="step-marker"><span>03</span><div class="step-dot"></div></div>
                            <div class="step-content">
                                <h3>J'installe chez vous</h3>
                                <p>Je me déplace pour tout brancher sur vos outils et on teste ensemble.</p>
                            </div>
                        </div>
                        <div class="process-step reveal">
                            <div class="step-marker"><span>04</span><div class="step-dot"></div></div>
                            <div class="step-content">
                                <h3>Je reste joignable</h3>
                                <p>Si quelque chose coince, vous m'appelez.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ========== CONTACT ========== -->
        <section class="contact">
            <div class="container">
                <div class="contact-wrapper glass-panel reveal">
                    <div class="contact-info">
                        <span class="section-tag">Parlons de vos chantiers</span>
                        <h2 class="section-title">Vous êtes artisan <span class="text-gradient"><!-- Consigne : « sur la presqu'île », « autour de La Roche-Bernard »… --></span> ?</h2>
                        <p class="contact-text">Appelez-moi ou laissez un message : je vous réponds dans les 48h ouvrées, sans engagement.</p>
                        <ul class="contact-list">
                            <li>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z"/></svg>
                                <a href="tel:+33695274474" class="contact-phone">06 95 27 44 74</a>
                            </li>
                            <li>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                <a href="mailto:contact@expia.fr" class="contact-email">contact@expia.fr</a>
                            </li>
                            <li>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                Basé à Férel (56), je me déplace dans toute la zone
                            </li>
                        </ul>
                        <p class="contact-text">
                            <!-- Consigne : « Pour aller plus loin : » + un lien vers chaque URL de GUIDES
                                 (texte d'ancre = titre de l'article), puis, s'il y en a, « Autres zones : »
                                 + un lien vers chaque zone déjà publiée (texte d'ancre = nom de la zone). -->
                        </p>
                        <div class="hero-actions" style="margin-top:2rem;">
                            <a href="/#contact" class="btn btn-primary glow-effect">
                                Démarrer un projet
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- ========== FOOTER ========== -->
    <footer>
        <div class="container footer-container">
            <div class="footer-brand">
                <div class="logo">EXPIA</div>
                <p>Automatisation IA pour les artisans du BTP, depuis Férel (56).</p>
            </div>
            <nav class="footer-nav">
                <a href="/">Accueil</a>
                <a href="/#services">Services</a>
                <a href="/#processus">Processus</a>
                <a href="/#faq">FAQ</a>
                <a href="a-propos.html">À propos</a>
                <a href="blog/">Blog</a>
                <a href="mentions-legales.html">Mentions légales</a>
            </nav>
            <div class="footer-bottom">
                <p>© 2026 EXPIA. Tous droits réservés.</p>
            </div>
        </div>
    </footer>

    <script src="script.js"></script>
    <script defer src="/_vercel/insights/script.js"></script>
</body>

</html>
```

- [ ] **Step 2 : rédiger les textes** selon les consignes. Règles communes : vouvoiement, phrases courtes, « je » (jamais « nous »), vocabulaire de chantier, aucun mot interdit de `CLAUDE.md`, aucun chiffre sauf « 397 € », « 48h », « (56) », le téléphone et les numéros d'étape, aucun client ni témoignage. Chaque fait local vient du fichier `<SLUG>-faits.md`, formulé comme dans ce fichier.

- [ ] **Step 3 : supprimer tous les commentaires `Consigne`**

Run : `grep -c "Consigne" <SLUG>.html`
Expected : `0`

### Task 6 : vérification

- [ ] **Step 1 : lancer le vérificateur**

Run (S-006) :
```bash
python C:/Users/emart/seo-audits/tools/check_zone_page.py C:/Users/emart/projects/EXPIA agence-ia-presquile-guerandaise.html --url https://expia.fr/agence-ia-presquile-guerandaise.html --communes "Guérande,La Baule-Escoublac,Le Croisic,Batz-sur-Mer,Le Pouliguen,Pornichet,La Turballe,Piriac-sur-Mer,Mesquer,Saint-Molf" --compare blog/automatisation-taches-tpe-pme.html
```
Pour S-007 à S-009 : ajouter à `--compare` chaque page de zone déjà écrite.

Expected : toutes les lignes en `PASS`, code de sortie 0. Sinon corriger la page et relancer (unicité ≥ 40 % → réécrire les passages communs ; `nous` → reformuler en « je » ou « on »).

- [ ] **Step 2 : rendu**

Run :
```bash
C:/Users/emart/AppData/Local/claude-seo/.venv/Scripts/python.exe C:/Users/emart/seo-audits/tools/render_zone_page.py C:/Users/emart/projects/EXPIA <SLUG>.html C:/Users/emart/seo-audits/expia.fr-audit/zones/shots
```
Expected : `phoneVisible: True` à 375 et `False` à 1366, aucune erreur JS, `overflowPx` ≤ 13. Ouvrir les deux captures et vérifier : H1 lisible, cartes alignées, liste des communes complète, bouton d'appel dans le hero.

### Task 7 : sitemap

**Files :**
- Modify : `sitemap.xml`

- [ ] **Step 1 : ajouter l'entrée de la page** juste avant l'entrée `https://expia.fr/blog/` (fin de ligne CRLF, comme le reste du fichier) :

```xml
  <url>
    <loc>«URL»</loc>
    <lastmod>«date du jour, AAAA-MM-JJ»</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
```

- [ ] **Step 2 (S-006 et S-007 seulement) : supprimer l'entrée `<url>` de l'article redirigé** (`https://expia.fr«REDIRECT_FROM»`) : une URL redirigée ne doit pas figurer dans le sitemap.

- [ ] **Step 3 : valider**

Run : `python -c "import xml.dom.minidom as m; m.parse('sitemap.xml'); print('ok')"`
Expected : `ok`

### Task 8 : redirection (S-006 et S-007 seulement)

**Files :**
- Modify : `vercel.json` (tableau `redirects` existant)

- [ ] **Step 1 : ajouter une ligne à la fin du tableau `redirects`**, au format des lignes existantes (une ligne par objet) :

```json
    { "source": "«REDIRECT_FROM»", "destination": "/«SLUG».html", "permanent": true }
```
(ajouter la virgule à la fin de la ligne précédente)

- [ ] **Step 2 : valider**

Run : `python -c "import json; json.load(open('vercel.json')); print('ok')"`
Expected : `ok`

### Task 9 : commit, push, PR

- [ ] **Step 1 : vérifier le périmètre**

Run : `git status --short`
Expected : 3 fichiers au plus (`<SLUG>.html`, `sitemap.xml`, et `vercel.json` pour S-006/S-007).

- [ ] **Step 2 : commit et push**

```bash
git add «SLUG».html sitemap.xml vercel.json
git commit -m "feat: page de zone «ZONE» (S-00X)" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git push -u origin «branche»
```

- [ ] **Step 3 : ouvrir la PR** avec `gh pr create --base main`. Corps obligatoire :
  - **Quoi** : fichiers modifiés, URL de la page, redirection éventuelle.
  - **Pourquoi** : lien vers la spec et le ticket.
  - **Faits locaux à valider** : le tableau complet de `<SLUG>-faits.md` (fait + source). Esteban coche chaque fait avant de merger.
  - **Vérifications faites** : sortie du vérificateur, résultat du rendu.
  - **Quoi vérifier sur la preview Vercel** : la page s'affiche sur mobile et ordinateur ; `«REDIRECT_FROM»` redirige vers la page (S-006/S-007) ; aucune erreur console.
  - Dernière ligne : `🤖 Generated with [Claude Code](https://claude.com/claude-code)`

- [ ] **Step 4 : attendre le merge d'Esteban** avant de démarrer le ticket suivant (les pages suivantes lient les pages déjà publiées).

---

## Après les 4 pages

### Task 10 : S-010 maillage

**Files :**
- Modify : `index.html` (section FAQ ou juste avant le contact : nouveau bloc ; pied de page : 4 liens)
- Modify : `blog/index.html` (retirer les cartes des 2 articles redirigés)

- [ ] **Step 1 : branche** `seo/S-010-maillage-zones` depuis `main` à jour.
- [ ] **Step 2 : dans `index.html`, juste avant `<section id="contact"`**, ajouter :

```html
        <!-- ========== ZONES ========== -->
        <section class="services" id="zones">
            <div class="container">
                <div class="section-header reveal">
                    <span class="section-tag">Zones d'intervention</span>
                    <h2 class="section-title">Je me déplace <span class="text-gradient">sur vos chantiers</span></h2>
                    <p class="section-desc">
                        <a href="agence-ia-presquile-guerandaise.html">Presqu'île guérandaise</a> ·
                        <a href="agence-ia-la-roche-bernard.html">Pays de la Roche-Bernard</a> ·
                        <a href="agence-ia-saint-nazaire.html">Saint-Nazaire et Brière</a> ·
                        <a href="agence-ia-vannes-muzillac.html">Muzillac et Vannes</a>
                    </p>
                </div>
            </div>
        </section>
```
- [ ] **Step 3 : dans le `<nav class="footer-nav">` d'`index.html`**, ajouter après le lien Blog : `<a href="#zones">Zones d'intervention</a>`.
- [ ] **Step 4 : dans `blog/index.html`**, supprimer les éléments de liste qui pointent vers `agence-ia-presquile-guerandaise.html` et `automatisation-ia-la-roche-bernard-sud-morbihan.html` (repérer avec `grep -n` et supprimer l'élément complet, balise ouvrante à balise fermante).
- [ ] **Step 5 : vérifier** : `grep -c "agence-ia-" index.html` → au moins 4 ; `grep -c "presquile-guerandaise\|la-roche-bernard-sud" blog/index.html` → 0 ; rendu Playwright d'`index.html` et `blog/index.html` sans erreur.
- [ ] **Step 6 : commit, push, PR** (même corps que la Task 9, sans faits locaux).

### Task 11 : S-011 `llms.txt`

**Files :**
- Modify : `llms.txt` (fichier protégé — ticket explicite S-011)

- [ ] **Step 1 : branche** `seo/S-011-llms-zones`.
- [ ] **Step 2 : dans la section `## Ressources`**, remplacer les deux lignes des articles redirigés par :

```
- Presqu'île guérandaise (La Baule, Guérande, Le Croisic…) — https://expia.fr/agence-ia-presquile-guerandaise.html
- Pays de la Roche-Bernard (Férel, Nivillac, Pénestin, Herbignac…) — https://expia.fr/agence-ia-la-roche-bernard.html
- Saint-Nazaire et Brière — https://expia.fr/agence-ia-saint-nazaire.html
- Muzillac et Vannes — https://expia.fr/agence-ia-vannes-muzillac.html
```
- [ ] **Step 3 : vérifier** : `grep -c "expia.fr/blog/agence-ia-presquile\|la-roche-bernard-sud" llms.txt` → `0`.
- [ ] **Step 4 : commit, push, PR.**

### Task 12 : S-012 liens retour entre zones

**Files :**
- Modify : `agence-ia-presquile-guerandaise.html`, `agence-ia-la-roche-bernard.html`, `agence-ia-saint-nazaire.html`

- [ ] **Step 1 : branche** `seo/S-012-liens-entre-zones`.
- [ ] **Step 2 : dans le paragraphe « Autres zones » de chaque page**, compléter pour que chaque page lie les 3 autres :
  - Presqu'île : + Roche-Bernard, Saint-Nazaire, Vannes
  - Roche-Bernard : + Saint-Nazaire, Vannes
  - Saint-Nazaire : + Vannes
- [ ] **Step 3 : relancer le vérificateur (Task 6, Step 1) sur les 3 pages** → tout en `PASS`.
- [ ] **Step 4 : commit, push, PR.**

---

## Suivi (hors dépôt, par Esteban)

- Search Console : soumettre le sitemap après chaque merge ; demander l'indexation de la nouvelle URL.
- Échec si une page n'est pas indexée 4 semaines après son merge.
- Pages ville individuelles : seulement quand un vrai client existe dans la ville.
