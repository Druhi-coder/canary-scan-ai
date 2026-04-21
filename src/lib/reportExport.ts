export const downloadPDFReport = (report: any) => {
  console.log("PDF export", report);
};

export const downloadReport = (report: any, type: "text" | "json") => {
  if (type === "text") {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.txt";
    a.click();
  } else {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.json";
    a.click();
  }
};

export const convertToExportable = (report: any) => {
  return report;
};
