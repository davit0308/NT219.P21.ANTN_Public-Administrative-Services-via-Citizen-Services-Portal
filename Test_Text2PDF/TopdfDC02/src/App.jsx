import React from "react";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

const App = () => {
  const handleGenerate = async () => {
    const existingPdfBytes = await fetch("/DC02.pdf").then(res => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Register fontkit to embed custom fonts
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = await fetch("/fonts/font-times-new-roman.ttf").then(res => res.arrayBuffer());
    const customFont = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.getPages()[0];

    const data = {
      fullName: "NGUYỄN ĐA VÍT",
      dob: "03      08      2005",
      gender: "Nam",
      idNumber: "066205001443",
      address: "SỐ NHÀ 37, THÔN AN BÌNH, Xã Ea Tih, Huyện Ea Kar, Tỉnh Đắk Lắk",
    };

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
        x: startX + i * (spacing+1),
        y: startY,
        size: 12,
        font: customFont,
      });
    }

    
    page.drawText(data.address, { x: 187.50, y: 433.12, size: 12, font: customFont });

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "phieu_de_nghi_da_dien.pdf";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Điền thông tin vào mẫu DC02.pdf</h2>
      <button onClick={handleGenerate}>Tải PDF đã điền</button>
    </div>
  );
};

export default App;
