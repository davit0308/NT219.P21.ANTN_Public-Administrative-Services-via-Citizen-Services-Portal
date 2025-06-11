import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export async function generateFilledPassportPDF(data) {
    const res = await fetch("/TK01.pdf");
    const existingPdfBytes = await res.arrayBuffer();

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fetch("/fonts/font-times-new-roman/font-times-new-roman.ttf").then(res => res.arrayBuffer());
    const customFont = await pdfDoc.embedFont(fontBytes);
    const page = pdfDoc.getPages()[0];

    // Vẽ text lên các vị trí mong muốn
    page.drawText(String(data.lastName || ""), { x: 59, y: 647, size: 12, font: customFont });
    page.drawText(String(data.middleAndFirstName || ""), { x: 246, y: 647, size: 12, font: customFont });
    // ... các trường khác ...

    function splitDate(dateStr) {
        if (!dateStr) return ["", "", ""];
        const [year, month, day] = dateStr.split("-");
        return [day || "", month || "", year || ""];
    }

    const [birthDay, birthMonth, birthYear] = splitDate(data.birthDate);
    const [issueDay, issueMonth, issueYear] = splitDate(data.cccdIssueDate);

    page.drawText(birthDay, { x: 99, y: 628, size: 12, font: customFont });
    page.drawText(birthMonth, { x: 145, y: 628, size: 12, font: customFont });
    page.drawText(birthYear, { x: 200, y: 628, size: 12, font: customFont });

    if (String(data.gender) === "Nam") {
        page.drawText("✓", { x: 528, y: 646, size: 12, font: customFont });
    } else if (String(data.gender) === "Nữ") {
        page.drawText("✓", { x: 562, y: 646, size: 12, font: customFont });
    }

    page.drawText(String(data.birthPlace || ""), { x: 110, y: 690, size: 12, font: customFont });
    page.drawText(String(data.nationality || ""), { x: 320, y: 690, size: 12, font: customFont });
    page.drawText(issueDay, { x: 433, y: 607, size: 12, font: customFont });
    page.drawText(issueMonth, { x: 460, y: 607, size: 12, font: customFont });
    page.drawText(issueYear, { x: 490, y: 607, size: 12, font: customFont });

    const cccd = String(data.cccdNumber || "");
    let startX = 181;
    const startY = 603;
    const spacing = 22;
    for (let i = 0; i < cccd.length; i++) {
        page.drawText(cccd[i], {
            x: startX + i * spacing,
            y: startY,
            size: 12,
            font: customFont,
        });
    }

    page.drawText(String(data.cccdIssuePlace || ""), { x: 110, y: 650, size: 12, font: customFont });
    page.drawText(String(data.ethnic || ""), { x: 320, y: 650, size: 12, font: customFont });
    page.drawText(String(data.religion || ""), { x: 110, y: 630, size: 12, font: customFont });
    page.drawText(String(data.occupation || ""), { x: 320, y: 630, size: 12, font: customFont });
    page.drawText(String(data.address || ""), { x: 110, y: 610, size: 12, font: customFont });
    page.drawText(String(data.temporaryAddress || ""), { x: 110, y: 590, size: 12, font: customFont });
    page.drawText(String(data.phone || ""), { x: 110, y: 570, size: 12, font: customFont });
    page.drawText(String(data.email || ""), { x: 320, y: 570, size: 12, font: customFont });
    page.drawText(String(data.passportRequest || ""), { x: 110, y: 550, size: 12, font: customFont });

    return await pdfDoc.save();
}
