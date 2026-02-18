"""
Resume parser service - extracts text from PDF and images
Adapted from resume-analyzer-main/src/file_reader.py
"""
import os
from pathlib import Path
from typing import Optional
from pypdf import PdfReader
from app.config import settings

# Optional: cv2, pdf2image, pytesseract for OCR (skip on LinuxONE/s390x)
_cv2 = _pdf2image = _pytesseract = _np = None
try:
    import cv2 as _cv2
    import numpy as _np
    from pdf2image import convert_from_path as _pdf2image
    import pytesseract as _pytesseract
except ImportError:
    pass


class ResumeParser:
    """Parse resumes from PDF and image files"""
    
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
    
    async def extract_text_from_pdf(self, file_path: str, preserve_case: bool = False) -> str:
        """
        Extract text from PDF file (all pages).

        Args:
            file_path: Path to PDF file
            preserve_case: If True, do not lowercase (use for transcripts/grade reports).

        Returns:
            Extracted text content
        """
        try:
            reader = PdfReader(file_path)
            data = ""
            for page in reader.pages:
                data = data + (page.extract_text() or "") + "\n"
            data = data.strip()
            if not preserve_case:
                data = data.lower()
            return data
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    async def extract_text_from_image(self, file_path: str) -> str:
        """
        Extract text from image PDF using OCR (requires opencv, pdf2image, pytesseract).
        Returns empty string if OCR libs unavailable (e.g. LinuxONE minimal build).
        """
        if _cv2 is None or _pdf2image is None or _pytesseract is None:
            return ""
        try:
            pages = _pdf2image(file_path)
            extracted_text = []
            for page in pages:
                preprocessed_image = self._deskew(_np.array(page))
                text = self._get_text_from_image(preprocessed_image)
                extracted_text.append(text)
            return "\n".join(extracted_text).strip().lower()
        except Exception:
            return ""
    
    async def parse_resume(self, file_path: str, preserve_case: bool = False) -> str:
        """
        Parse resume or transcript file (PDF or image).

        Args:
            file_path: Path to PDF/image file
            preserve_case: If True, do not lowercase (use for transcripts/grade reports).

        Returns:
            Extracted text content
        """
        # Try PDF text extraction first
        data = await self.extract_text_from_pdf(file_path, preserve_case=preserve_case)
        # If extraction yields very little text, try OCR (resume parser uses lowercased OCR)
        if len(data) <= 100:
            data = await self.extract_text_from_image(file_path)
            if preserve_case:
                data = data  # OCR already returns mixed case
            # else keep .lower() from extract_text_from_image
        return data
    
    @staticmethod
    def _deskew(image) -> "np.ndarray":
        """
        Deskew the given image to correct any tilt
        
        Args:
            image: Image array
            
        Returns:
            Deskewed image
        """
        if _cv2 is None or _np is None:
            return image
        gray = _cv2.cvtColor(image, _cv2.COLOR_BGR2GRAY)
        gray = _cv2.bitwise_not(gray)
        coords = _np.column_stack(_np.where(gray > 0))
        if len(coords) == 0:
            return image
        angle = _cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = _cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = _cv2.warpAffine(
            image, M, (w, h),
            flags=_cv2.INTER_CUBIC,
            borderMode=_cv2.BORDER_REPLICATE
        )
        return rotated
    
    @staticmethod
    def _get_text_from_image(image) -> str:
        """
        Extract text from image using OCR
        
        Args:
            image: Image array
            
        Returns:
            Extracted text
        """
        if _pytesseract is None:
            return ""
        try:
            return _pytesseract.image_to_string(image)
        except Exception:
            return ""
