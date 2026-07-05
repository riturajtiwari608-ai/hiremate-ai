import fitz
from fastapi import HTTPException, UploadFile, status


ALLOWED_CONTENT_TYPES = [
    "application/pdf"
]


async def extract_text_from_pdf(uploaded_file: UploadFile) -> str:
    if uploaded_file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resume files are allowed"
        )

    file_bytes = await uploaded_file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded PDF file is empty"
        )

    try:
        pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or corrupted PDF file"
        )

    extracted_text = ""

    for page in pdf_document:
        extracted_text += page.get_text()

    pdf_document.close()

    extracted_text = extracted_text.strip()

    if len(extracted_text) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract enough text from this PDF. Please upload a text-based resume PDF."
        )

    return extracted_text