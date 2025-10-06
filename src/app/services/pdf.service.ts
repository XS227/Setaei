import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  async exportElement(element: HTMLElement, fileName: string): Promise<void> {
    const canvas = await html2canvas(element, {
      scale: window.devicePixelRatio > 1 ? window.devicePixelRatio : 2,
      backgroundColor: getComputedStyle(document.body).getPropertyValue('--surface') || '#ffffff',
      useCORS: true,
    });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

    while (imgHeight - position > pageHeight) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    }

    pdf.save(fileName);
  }
}
