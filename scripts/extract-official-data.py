import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCAL_DEPS = ROOT / "data" / "pydeps"
if LOCAL_DEPS.exists():
    sys.path.insert(0, str(LOCAL_DEPS))

import pdfplumber  # type: ignore

OFFICIAL_DIR = ROOT / "data" / "official"
OUT_FILE = OFFICIAL_DIR / "official-degrees.json"

SUBJECTS = [
    ("ANALISI_MUSICAL", "Anàlisi Musical"),
    ("ARTS_ESCENIQUES", "Arts Escèniques"),
    ("BIO", "Biologia"),
    ("CIENCIES_GENERALS", "Ciències Generals"),
    ("COR_TECNICA_VOCAL", "Cor i tècnica Vocal"),
    ("DIBUIX_ARTISTIC", "Dibuix Artístic"),
    ("DIBUIX_TECNIC", "Dibuix Tècnic"),
    ("DIBUIX_TECNIC_APLICAT", "Dibuix Tècnic aplicat a les Arts Plàstiques i el Disseny"),
    ("DISS", "Disseny"),
    ("FIS", "Física"),
    ("FONAMENTS_ARTISTICS", "Fonaments Artístics"),
    ("EMPRESA", "Funcionament de l’Empresa i Models de Negoci"),
    ("GEO", "Geografia"),
    ("GEOLOGIA_AMBIENTALS", "Geologia i Ciències Ambientals"),
    ("HIST_MUSICA_DANSA", "Història de la Música i de la Dansa"),
    ("HISTART", "Història de l'Art"),
    ("LITCAST", "Literatura Castellana"),
    ("LITCAT", "Literatura Catalana"),
    ("LITDRAM", "Literatura Dramàtica"),
    ("GREC", "Llengua i Cultura Gregues"),
    ("LLATI", "Llengua i Cultura Llatines"),
    ("MATHII", "Matemàtiques"),
    ("MATHSS", "Matemàtiques Aplicades a les CC.SS"),
    ("MOVIMENTS_CULTURALS", "Moviments culturals i artístics"),
    ("QUI", "Química"),
    ("TECNIQUES_GRAFICOPLASTIQUES", "Tècniques d’Expressió Graficoplàstica"),
    ("TEC", "Tecnologia i Enginyeria"),
]

BRANCHES = {
    "AH": "Artes y humanidades",
    "C": "Ciencias",
    "CS": "Ciencias de la salud",
    "CSJ": "Ciencias sociales y juridicas",
    "EA": "Ingenieria y arquitectura",
}


def clean(value):
    return re.sub(r"\s+", " ", value or "").strip()


def parse_float(value):
    value = clean(value).replace(".", "").replace(",", ".")
    try:
        return float(value)
    except ValueError:
        return None


def parse_int(value):
    text = re.sub(r"[^\d]", "", clean(value))
    return int(text) if text else None


def ensure_degree(degrees, code):
    degrees.setdefault(
        code,
        {
            "code": code,
            "name": "",
            "universityCode": "",
            "branchCode": "",
            "branch": "",
            "city": "",
            "seats": None,
            "cutoff": None,
            "type": "grado",
            "modality": "presencial",
            "ownership": "public",
            "centerType": "",
            "weights": [],
        },
    )
    return degrees[code]


def extract_ponderations(degrees):
    path = OFFICIAL_DIR / "Ponderacions-2026_v6.pdf"
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables():
                for row in table:
                    if not row or not re.fullmatch(r"\d{5}", clean(row[0])):
                        continue
                    code = clean(row[0])
                    degree = ensure_degree(degrees, code)
                    degree["name"] = degree["name"] or clean(row[1])
                    degree["universityCode"] = degree["universityCode"] or clean(row[2])
                    degree["branchCode"] = clean(row[3])
                    degree["branch"] = BRANCHES.get(degree["branchCode"], degree["branchCode"])
                    degree["type"] = "doble grado" if "simultane" in degree["name"].lower() or "/" in degree["name"] else "grado"
                    lowered = degree["name"].lower()
                    if "virtual" in lowered:
                        degree["modality"] = "virtual"
                    elif "semipresencial" in lowered:
                        degree["modality"] = "semipresencial"
                    weights = []
                    for index, subject in enumerate(SUBJECTS, start=4):
                        weight = parse_float(row[index] if index < len(row) else "")
                        if weight in (0.1, 0.2):
                            weights.append(
                                {
                                    "subjectCode": subject[0],
                                    "subjectName": subject[1],
                                    "weight": weight,
                                }
                            )
                    degree["weights"] = weights


def extract_cutoffs(degrees):
    path = OFFICIAL_DIR / "Notes-tall-1a-assignacio_juny_2025_v3.pdf"
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables():
                for row in table:
                    if not row or not re.fullmatch(r"\d{5}", clean(row[0])):
                        continue
                    code = clean(row[0])
                    degree = ensure_degree(degrees, code)
                    name_city = clean(row[1])
                    match = re.search(r"\(([^()]*)\)\s*$", name_city)
                    if match:
                        degree["city"] = degree["city"] or clean(match.group(1))
                        degree["name"] = degree["name"] or clean(name_city[: match.start()])
                    else:
                        degree["name"] = degree["name"] or name_city
                    degree["universityCode"] = degree["universityCode"] or clean(row[2])
                    degree["cutoff"] = parse_float(row[3])


def extract_places(degrees):
    path = OFFICIAL_DIR / "Preins-2025-Juny_v2.pdf"
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables():
                for row in table:
                    if not row or not re.fullmatch(r"\d{5}", clean(row[0])):
                        continue
                    code = clean(row[0])
                    degree = ensure_degree(degrees, code)
                    degree["name"] = degree["name"] or clean(row[1])
                    degree["universityCode"] = degree["universityCode"] or clean(row[2])
                    degree["city"] = degree["city"] or clean(row[3])
                    degree["centerType"] = clean(row[4])
                    degree["ownership"] = "private" if "priv" in degree["centerType"].lower() else "public"
                    degree["seats"] = parse_int(row[5])


def main():
    degrees = {}
    extract_ponderations(degrees)
    extract_cutoffs(degrees)
    extract_places(degrees)

    payload = {
        "sources": {
            "ponderations": "https://universitats.gencat.cat/web/.content/02_preinscripcio/enllac-documents/Ponderacions-2026_v6.pdf",
            "cutoffs": "https://universitats.gencat.cat/web/.content/02_preinscripcio/enllac-documents/notes-de-tall/Notes-tall-1a-assignacio_juny_2025_v3.pdf",
            "places": "https://universitats.gencat.cat/web/.content/02_preinscripcio/enllac-documents/Preins-2025-Juny_v2.pdf",
        },
        "subjects": [{"code": code, "name": name} for code, name in SUBJECTS],
        "degrees": sorted(degrees.values(), key=lambda item: item["code"]),
    }
    OUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generated {OUT_FILE} with {len(payload['degrees'])} degrees")


if __name__ == "__main__":
    main()
