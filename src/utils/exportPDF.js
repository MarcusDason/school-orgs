import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const exportToPDF = async (element, fileName = "report.pdf", extraInfo = {}) => {
  if (!element) return;

  // Clone element to append extra info temporarily
  const clone = element.cloneNode(true);

  // Add schedule info at the top of the cloned element
  if (extraInfo.scheduleText) {
    const scheduleDiv = document.createElement("div");
    scheduleDiv.style.fontSize = "50px";
    scheduleDiv.style.font = "Arial, sans-serif";
    scheduleDiv.style.marginBottom = "8px";
    scheduleDiv.style.color = "#000";
    scheduleDiv.innerHTML = `<strong>Event Schedule:</strong> ${extraInfo.scheduleText}`;
    clone.prepend(scheduleDiv);
  }

  document.body.appendChild(clone);

  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  document.body.removeChild(clone);

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
};