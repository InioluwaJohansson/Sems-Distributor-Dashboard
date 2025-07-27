import { format } from "date-fns"

// Define types for our PDF generator
export interface TableColumn {
  header: string
  dataKey: string
}

export interface TableData {
  [key: string]: string | number
}

export const generatePDF = async (
  title: string,
  filename: string,
  sections: {
    title: string
    content?: string
    table?: {
      columns: TableColumn[]
      data: TableData[]
    }
  }[],
): Promise<boolean> => {
  try {
    // Dynamically import jsPDF and jspdf-autotable
    const [jsPDFModule, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")])

    const jsPDF = jsPDFModule.default

    // Create a new PDF document
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text(title, 14, 22)

    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 30)

    let yPos = 40

    // Add sections
    for (const section of sections) {
      // Add section title
      doc.setFontSize(14)
      doc.text(section.title, 14, yPos)
      yPos += 8

      // Add section content if available
      if (section.content) {
        doc.setFontSize(10)
        const contentLines = doc.splitTextToSize(section.content, 180)
        doc.text(contentLines, 14, yPos)
        yPos += contentLines.length * 6 + 5
      }

      // Add table if available
      if (section.table) {
        // @ts-ignore - autoTable is added by the import
        doc.autoTable({
          startY: yPos,
          head: [section.table.columns.map((col) => col.header)],
          body: section.table.data.map((row) => section.table!.columns.map((col) => row[col.dataKey])),
          margin: { left: 14, right: 14 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          alternateRowStyles: { fillColor: [240, 240, 240] },
          tableLineColor: [200, 200, 200],
          tableLineWidth: 0.1,
        })

        // Update yPos after table
        // @ts-ignore - lastAutoTable is added by the plugin
        yPos = doc.lastAutoTable.finalY + 15
      } else {
        yPos += 10
      }
    }

    // Save the PDF
    doc.save(filename)
    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    return false
  }
}
