import React from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fontkit from '@pdf-lib/fontkit';

const ExportDC02PDFButton = ({ data, children }) => {
    const handleExport = async () => {
        const res = await fetch("/DC02.pdf");
        const contentType = res.headers.get("content-type");
        const status = res.status;
        console.log("PDF status:", status, "type:", contentType);
        const existingPdfBytes = await res.arrayBuffer();


        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Register fontkit to embed custom fonts
        pdfDoc.registerFontkit(fontkit);

        const fontBytes = await fetch("/fonts/font-times-new-roman/font-times-new-roman.ttf").then(res => res.arrayBuffer());
        const customFont = await pdfDoc.embedFont(fontBytes);

        const page = pdfDoc.getPages()[0];

        console.log("Data to fill:", data);

        page.drawText(data.fullName, { x: 262.80, y: 585, size: 12, font: customFont });
        page.drawText(data.dob, { x: 243.60, y: 565.50, size: 12, font: customFont });
        page.drawText(data.gender, { x: 441.60, y: 645, size: 12, font: customFont });
        // page.drawText(data.idNumber, { x: 269, y: 540, size: 12, font: customFont });
        let startX = 275;
        const startY = 540;
        const spacing = 22;

        for (let i = 0; i < 6; i++) {
            const char = data.idNumber[i];
            page.drawText(char, {
                x: startX + i * spacing,
                y: startY,
                size: 12,
                font: customFont,
            });
        }
        for (let i = 6; i < 12; i++) {
            const char = data.idNumber[i];
            page.drawText(char, {
                x: startX + i * (spacing + 1),
                y: startY,
                size: 12,
                font: customFont,
            });
        }


        page.drawText(data.address, { x: 187.50, y: 433.12, size: 12, font: customFont });

        const newPdfBytes = await pdfDoc.save();

        const blob = new Blob([newPdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "phieu_de_nghi_da_dien.pdf";
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <button onClick={handleExport} className="btn btn-success">
            {children || "Tải PDF đã điền"}
        </button>
    );
};

export default ExportDC02PDFButton;