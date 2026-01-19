import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportPDFOptions {
  title: string;
  subtitle?: string;
  dateRange: string;
  branchName?: string;
  kpis?: { label: string; value: string | number }[];
  tableHeaders: string[];
  tableData: (string | number)[][];
  fileName: string;
}

export function exportReportToPDF(options: ReportPDFOptions) {
  const {
    title,
    subtitle,
    dateRange,
    branchName,
    kpis,
    tableHeaders,
    tableData,
    fileName,
  } = options;

  // Create PDF in landscape for better table display
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, yPos);
  yPos += 8;

  // Subtitle
  if (subtitle) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(subtitle, margin, yPos);
    yPos += 6;
  }

  // Date Range and Branch
  doc.setFontSize(10);
  doc.setTextColor(120);
  const metaText = branchName ? `${branchName} | ${dateRange}` : dateRange;
  doc.text(metaText, margin, yPos);

  // Generated timestamp on the right
  const timestamp = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Generated: ${timestamp}`, pageWidth - margin, yPos, {
    align: "right",
  });
  yPos += 10;

  // KPI Section
  if (kpis && kpis.length > 0) {
    doc.setDrawColor(220);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 20, 2, 2, "FD");

    const kpiWidth = (pageWidth - margin * 2) / kpis.length;
    kpis.forEach((kpi, index) => {
      const xPos = margin + kpiWidth * index + kpiWidth / 2;

      // KPI Value
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30);
      doc.text(String(kpi.value), xPos, yPos + 9, { align: "center" });

      // KPI Label
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(kpi.label, xPos, yPos + 15, { align: "center" });
    });
    yPos += 28;
  }

  // Table
  doc.setTextColor(0);
  autoTable(doc, {
    startY: yPos,
    head: [tableHeaders],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235], // Blue
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      overflow: "linebreak",
      cellWidth: "auto",
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" },
      );
    },
  });

  // Save the PDF
  doc.save(`${fileName}.pdf`);
}

export function formatDateRange(
  from: Date | undefined,
  to: Date | undefined,
): string {
  if (!from && !to) return "All time";

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (from && to) {
    return `${formatDate(from)} - ${formatDate(to)}`;
  }
  if (from) {
    return `From ${formatDate(from)}`;
  }
  if (to) {
    return `Until ${formatDate(to)}`;
  }
  return "All time";
}
