import React from "react";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { generateFilledPassportPDF } from "../../utils/pdfUtils";

const ExportPassportPDFButton = ({ data, children }) => {
    const handleExport = async () => {
        const pdfBytes = await generateFilledPassportPDF(data);

        // TẢI FILE VỀ
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "ToKhai_TK01.pdf";
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <button onClick={handleExport} className="btn btn-success">
            {children || "Tải tờ khai TK01 PDF"}
        </button>
    );
};

export default ExportPassportPDFButton;