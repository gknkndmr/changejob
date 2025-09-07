// src/lib/export.ts
export async function exportDetayAsPDF(rootId: string, filename = "Teklif-Karsilastirma.pdf") {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const root = document.getElementById(rootId);
  if (!root) throw new Error(`Element not found: #${rootId}`);

  // Yüksek çözünürlüklü canvas alın (ölçek 2), arkaplanı beyaz yap
  const canvas = await html2canvas(root, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Görseli sayfa genişliğine sığdır
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // İlk sayfa
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, "", "FAST");
  heightLeft -= pageHeight;

  // Diğer sayfalar
  while (heightLeft > 0) {
    pdf.addPage();
    position = -(imgHeight - heightLeft);
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, "", "FAST");
    heightLeft -= pageHeight;
  }

  pdf.setProperties({ title: filename });
  pdf.save(filename);
}
