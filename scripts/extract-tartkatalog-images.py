"""Extract cake photos from tartkatalog.pdf into public/marketing/tartor/."""
from pathlib import Path

import fitz

PDF = Path(__file__).resolve().parents[1] / "public" / "marketing" / "tartkatalog.pdf"
OUT = Path(__file__).resolve().parents[1] / "public" / "marketing" / "tartor"

SLUGS = [
    "happysent-tarta",
    "budapesttarta",
    "jordgubbstarta",
    "chokladtrippel",
    "hallontarta",
    "princesstarta",
    "schwarzwaldtarta",
    "lyxprincesstarta",
    "jordgubb-rabarbertarta",
]


def images_on_page(doc: fitz.Document, page_num: int) -> list[int]:
    page = doc[page_num]
    positioned: list[tuple[float, float, int]] = []
    seen: set[int] = set()

    for img in page.get_images(full=True):
        xref = img[0]
        if xref in seen:
            continue
        seen.add(xref)
        for rect in page.get_image_rects(xref):
            positioned.append((rect.y0, rect.x0, xref))
            break

    positioned.sort()
    return [xref for _, __, xref in positioned]


def main() -> None:
    OUT.mkdir(exist_ok=True)
    doc = fitz.open(PDF)

    xrefs: list[int] = []
    xrefs.extend(images_on_page(doc, 0))
    if doc.page_count > 1:
        xrefs.extend(images_on_page(doc, 1))

    for index, xref in enumerate(xrefs[: len(SLUGS)]):
        base = doc.extract_image(xref)
        slug = SLUGS[index]
        path = OUT / f"{slug}.{base['ext']}"
        path.write_bytes(base["image"])
        print(f"wrote {path.name} ({base['width']}x{base['height']})")


if __name__ == "__main__":
    main()
