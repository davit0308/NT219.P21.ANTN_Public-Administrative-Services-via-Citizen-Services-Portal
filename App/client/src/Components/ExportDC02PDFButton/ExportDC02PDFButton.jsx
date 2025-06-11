import React from "react";
import { generateFilledDC02PDF } from "../../utils/pdfUtils";

const ExportDC02PDFButton = ({ data, children }) => {
    const handleExport = async () => {
        const newPdfBytes = await generateFilledDC02PDF(data);

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