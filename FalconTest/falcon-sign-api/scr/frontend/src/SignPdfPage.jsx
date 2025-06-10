import React, { useState } from "react";
import axios from "axios";

function SignPdfPage() {
  const [file, setFile] = useState(null);
  const [signedPdf, setSignedPdf] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSign = () => {
    const formData = new FormData();
    formData.append("pdf", file);

    axios
      .post("http://localhost:3001/sign-pdf", formData, {
        responseType: "blob",
      })
      .then((res) => {
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" })
        );
        setSignedPdf(url);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Ký PDF bằng Falcon</h1>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleSign} disabled={!file}>
        Ký và tải về
      </button>
      {signedPdf && (
        <div style={{ marginTop: "20px" }}>
          <a href={signedPdf} download="signed.pdf">
            Tải file đã ký
          </a>
        </div>
      )}
    </div>
  );
}

export default SignPdfPage;
