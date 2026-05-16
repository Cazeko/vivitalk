"""Parse uploaded documents into chunks."""
import io
import logging
import re
from typing import List

from pypdf import PdfReader

logger = logging.getLogger(__name__)


def extract_text_from_pdf_bytes(data: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(data))
        parts: List[str] = []
        for i, page in enumerate(reader.pages):
            try:
                t = page.extract_text() or ""
                parts.append(t)
            except Exception as e:
                logger.warning(f"PDF page {i} extract failed: {e}")
        return "\n\n".join(parts)
    except Exception as e:
        logger.error(f"PDF parse failed: {e}")
        return ""


def extract_text(filename: str, content_type: str | None, data: bytes) -> str:
    name = (filename or "").lower()
    ct = (content_type or "").lower()
    if name.endswith(".pdf") or "pdf" in ct:
        return extract_text_from_pdf_bytes(data)
    # txt / md / html etc.
    try:
        text = data.decode("utf-8", errors="ignore")
    except Exception:
        text = ""
    if name.endswith(".html") or name.endswith(".htm") or "html" in ct:
        text = re.sub(r"<[^>]+>", " ", text)
    return text


def split_into_chunks(text: str, chunk_size: int = 450, overlap: int = 80) -> List[str]:
    """Split text into overlapping chunks. Tries to break on sentence boundaries."""
    text = re.sub(r"\s+", " ", text or "").strip()
    if not text:
        return []

    chunks: List[str] = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + chunk_size, n)
        # Try snap to nearest sentence-ish boundary inside the window
        if end < n:
            window = text[start:end]
            # Look for boundary in last 200 chars
            slice_search = window[-200:]
            m = list(re.finditer(r"[\.\!\?。！？]\s+", slice_search))
            if m:
                last = m[-1]
                # offset within original
                end = start + (len(window) - 200) + last.end()
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= n:
            break
        start = max(end - overlap, start + 1)
    return chunks
