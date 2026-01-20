#!/usr/bin/env python3
"""
PDF Parser for Insurance Guarantees
Extracts text from PDFs and uses Claude to structure the data.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

import anthropic
import pdfplumber
from dotenv import load_dotenv

# Load environment variables from root .env
load_dotenv(Path(__file__).parent.parent / '.env')

DATA_DIR = Path(__file__).parent.parent / 'data'

EXTRACTION_PROMPT = """You are a French health insurance (mutuelle) expert. Extract guarantee data from this document into structured JSON.

## CATEGORIES
Use exactly one of these 5 categories for each guarantee:
- hospitalization: hospital stays, private room, daily fees, surgical fees
- general_care: doctor visits, medications, lab tests, medical transport
- optical: glasses frames, lenses, contact lenses
- dental: dental care, prosthetics, orthodontics, implants
- hearing_aids: hearing devices and accessories

## NORMALIZED KEYS
You MUST use ONLY these exact keys to enable comparison across insurers:

HOSPITALIZATION:
- hospital_stay         → "Frais de séjour"
- daily_hospital_fee    → "Forfait journalier hospitalier"
- private_room          → "Chambre particulière"
- surgical_fees         → "Honoraires chirurgicaux", "Actes médicaux"

GENERAL CARE:
- general_practitioner  → "Médecin généraliste", "Praticiens OPTAM"
- specialist            → "Spécialiste", "Praticiens non-OPTAM"
- lab_tests             → "Analyses", "Examens de biologie"
- medication            → "Pharmacie", "Médicaments"

OPTICAL:
- simple_lenses         → "Verres simples", "Verres unifocaux" (+ monture)
- complex_lenses        → "Verres complexes", "Verres progressifs" (+ monture)
- contact_lenses        → "Lentilles"

DENTAL:
- dental_care           → "Soins dentaires"
- dental_prosthetics    → "Prothèses dentaires", "Couronnes"
- orthodontics          → "Orthodontie"
- implants              → "Implants dentaires"

HEARING:
- hearing_aids          → "Appareils auditifs", "Aides auditives"

## REIMBURSEMENT FORMAT
Use exactly one of these 3 structures:

1. Percentage of social security base ("100% BR", "150% BR"):
   { "type": "percentage", "value": 150 }

2. Fixed amount ("50€/jour", "300€/an"):
   { "type": "fixed", "value": 50, "unit": "EUR/day" }
   Allowed units: "EUR", "EUR/day", "EUR/year"

3. Actual costs ("Frais réels", "100% FR"):
   { "type": "real_costs" }

## OUTPUT FORMAT
Return ONLY this JSON structure (no markdown, no explanation):

{
  "name": "INSURER_NAME",
  "brand": "Product line name",
  "plans": [
    {
      "level": 1,
      "name": "Plan name from document",
      "guarantees": [
        {
          "category": "hospitalization",
          "key": "private_room",
          "label": "Chambre particulière",
          "reimbursement": { "type": "fixed", "value": 60, "unit": "EUR/day" },
          "limit": "30 jours/an",
          "details": "hors hospitalisation ambulatoire"
        }
      ]
    }
  ]
}

## RULES
- Extract ALL plans/levels from the document
- Keep original French text in "label" field
- "limit" is optional: quantitative limits (e.g., "30 jours/an", "2 implants max")
- "details" is optional: additional info (e.g., "dont 80€ monture max", "hors ambulatoire")
- Skip guarantees marked as "-" or not covered
- Do NOT invent keys outside the allowed list
- Do NOT include markdown code blocks in response"""


def get_insurers() -> list[str]:
    """List available insurers (folders in data/ with source.pdf)."""
    insurers = []
    if DATA_DIR.exists():
        for folder in DATA_DIR.iterdir():
            if folder.is_dir() and (folder / 'source.pdf').exists():
                insurers.append(folder.name)
    return sorted(insurers)


def extract_text(insurer: str) -> str:
    """Extract text from PDF using pdfplumber."""
    pdf_path = DATA_DIR / insurer / 'source.pdf'

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    print(f"Extracting text from {pdf_path}...")

    text_parts = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages, 1):
            page_text = page.extract_text() or ""
            text_parts.append(f"--- Page {i} ---\n{page_text}")

    full_text = "\n\n".join(text_parts)

    # Save extracted text
    output_path = DATA_DIR / insurer / 'extracted-text.txt'
    output_path.write_text(full_text, encoding='utf-8')
    print(f"✓ Saved {len(full_text)} chars to {output_path}")

    return full_text


def parse_with_claude(insurer: str, text: str) -> dict:
    """Send text to Claude for structured extraction."""
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not set in environment")

    client = anthropic.Anthropic(api_key=api_key)

    print("Sending to Claude for parsing...")

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=16000,
        messages=[
            {
                "role": "user",
                "content": f"{EXTRACTION_PROMPT}\n\n--- DOCUMENT CONTENT ---\n\n{text}"
            }
        ]
    )

    response_text = message.content[0].text

    # Save raw Claude response
    raw_path = DATA_DIR / insurer / 'claude-response.txt'
    raw_path.write_text(response_text, encoding='utf-8')
    print(f"✓ Raw response saved to {raw_path}")

    # Extract JSON from response
    json_str = response_text

    # Try markdown code block first
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)```', response_text)
    if json_match:
        json_str = json_match.group(1).strip()
    else:
        # Try to find raw JSON object
        raw_match = re.search(r'\{[\s\S]*\}', response_text)
        if raw_match:
            json_str = raw_match.group(0)

    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"✗ Failed to parse JSON: {e}")
        print(f"Raw response preview: {response_text[:500]}")
        raise


def save_json(insurer: str, data: dict) -> None:
    """Save parsed data to JSON file."""
    output_path = DATA_DIR / insurer / 'parsed.json'
    output_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"✓ Saved to {output_path}")


def cmd_list(_args: argparse.Namespace) -> None:
    """List available insurers."""
    insurers = get_insurers()
    if not insurers:
        print("No insurers found. Create folders in data/ with source.pdf")
        return

    print("Available insurers:")
    for name in insurers:
        status = []
        if (DATA_DIR / name / 'extracted-text.txt').exists():
            status.append("text")
        if (DATA_DIR / name / 'parsed.json').exists():
            status.append("json")
        status_str = f" [{', '.join(status)}]" if status else ""
        print(f"  - {name}{status_str}")


def cmd_extract(args: argparse.Namespace) -> None:
    """Extract text from PDF (no API call)."""
    insurer = args.insurer
    if insurer not in get_insurers():
        print(f"Error: insurer '{insurer}' not found")
        print("Available:", ", ".join(get_insurers()) or "none")
        sys.exit(1)
    extract_text(insurer)


def cmd_extract_all(_args: argparse.Namespace) -> None:
    """Extract text from all PDFs."""
    insurers = get_insurers()
    if not insurers:
        print("No insurers found.")
        return

    extracted = 0
    errors = 0

    for insurer in insurers:
        try:
            print(f"\n{'='*50}")
            print(f"Extracting: {insurer}")
            print('='*50)
            extract_text(insurer)
            extracted += 1
        except Exception as e:
            print(f"✗ Error extracting {insurer}: {e}")
            errors += 1

    print(f"\n{'='*50}")
    print(f"Summary: {extracted} extracted, {errors} errors")


def cmd_parse(args: argparse.Namespace) -> None:
    """Full parsing: extract text + Claude API."""
    insurer = args.insurer
    if insurer not in get_insurers():
        print(f"Error: insurer '{insurer}' not found")
        print("Available:", ", ".join(get_insurers()) or "none")
        sys.exit(1)

    text = extract_text(insurer)
    data = parse_with_claude(insurer, text)
    save_json(insurer, data)
    print(f"✓ Done: {data.get('name', insurer)} with {len(data.get('plans', []))} plans")


def cmd_parse_all(_args: argparse.Namespace) -> None:
    """Parse all insurers with Claude API."""
    insurers = get_insurers()
    if not insurers:
        print("No insurers found.")
        return

    parsed = 0
    errors = 0

    for insurer in insurers:
        try:
            print(f"\n{'='*50}")
            print(f"Processing: {insurer}")
            print('='*50)
            text = extract_text(insurer)
            data = parse_with_claude(insurer, text)
            save_json(insurer, data)
            print(f"✓ Done: {data.get('name', insurer)} with {len(data.get('plans', []))} plans")
            parsed += 1
        except Exception as e:
            print(f"✗ Error parsing {insurer}: {e}")
            errors += 1

    print(f"\n{'='*50}")
    print(f"Summary: {parsed} parsed, {errors} errors")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="PDF Parser for Insurance Guarantees",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    subparsers = parser.add_subparsers(dest='command', required=True)

    # list
    list_parser = subparsers.add_parser('list', help='List available insurers')
    list_parser.set_defaults(func=cmd_list)

    # extract <insurer>
    extract_parser = subparsers.add_parser('extract', help='Extract text from PDF')
    extract_parser.add_argument('insurer', help='Insurer name (folder in data/)')
    extract_parser.set_defaults(func=cmd_extract)

    # extract-all
    extract_all_parser = subparsers.add_parser('extract-all', help='Extract text from all PDFs')
    extract_all_parser.set_defaults(func=cmd_extract_all)

    # parse <insurer>
    parse_parser = subparsers.add_parser('parse', help='Full parsing with Claude API')
    parse_parser.add_argument('insurer', help='Insurer name (folder in data/)')
    parse_parser.set_defaults(func=cmd_parse)

    # parse-all
    parse_all_parser = subparsers.add_parser('parse-all', help='Parse all insurers with Claude API')
    parse_all_parser.set_defaults(func=cmd_parse_all)

    args = parser.parse_args()
    args.func(args)


if __name__ == '__main__':
    main()
