import React from "react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { Button, Box, Group } from "@mantine/core";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getBase64ImageFromURL } from "../utils/invoiceUtils";

const CommonTable = ({
  columns,
  data,
  fileName = "export-data",
  showSelection = true,
  onDeleteSelected,
}) => {

  const handleExportRows = async (rows) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    const exportableColumns = columns.filter(
      (c) => c.header !== "Actions" && c.header !== "Action"
    );

    const tableHeaders = exportableColumns.map((c) => c.header);
    const tableData = rows.map((row) => {
      return exportableColumns.map((col) => {
        if (col.Cell) {
          try {
            const cellValue = col.Cell({ row, cell: { getValue: () => col.accessorKey ? row.original[col.accessorKey] : '' } });
            
            // Better React element handling
            if (typeof cellValue === 'string') {
              return cellValue.substring(0, 50);
            } else if (cellValue && typeof cellValue === 'object' && 'props' in cellValue) {
              // Extract text from React element props (common pattern)
              if (cellValue.props && cellValue.props.children) {
                const childrenText = typeof cellValue.props.children === 'string' 
                  ? cellValue.props.children 
                  : String(cellValue.props.children);
                return childrenText.substring(0, 50);
              }
              return row.original[col.accessorKey ?? col.id ?? 'status'] || 'N/A';
            }
            return String(cellValue || row.original.status || row.original[col.accessorKey ?? ''] || '').substring(0, 50);
          } catch {
            return row.original[col.accessorKey ?? 'status'] ?? row.original.status ?? '';
          }
        } else if (col.accessorKey) {
          let value = row.original[col.accessorKey];
          if (col.accessorKey === 'totalAmount') value = `Rs. ${value}`;
          return String(value ?? '').substring(0, 50);
        }
        return '';
      });
    });

    // ✅ LOGO
    try {
      const logo = await getBase64ImageFromURL("/img/logots.png");
      doc.addImage(logo, "PNG", margin, 10, 25, 25);
    } catch (e) { }

    // ✅ 🔥 HEADER (FULL DETAILS)
    doc.setFont(undefined, "bold");
    doc.setFontSize(18);
    doc.setTextColor(60, 184, 21);

    doc.text("TS Organic Mall", pageWidth / 2, 20, { align: "center" });

    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);

    doc.text("Fresh Organic Products", pageWidth / 2, 27, { align: "center" });

    doc.text("Email: tsorganicmall0623@gmail.com", pageWidth / 2, 33, { align: "center" });
    doc.text("Mobile: +91 9104427875", pageWidth / 2, 38, { align: "center" });

    doc.text(
      "Address: TS Organic Mall, Kishor Plaza, Anand - 388001",
      pageWidth / 2,
      43,
      { align: "center" }
    );

    // ✅ DATE (RIGHT SIDE)
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-GB")}`,
      pageWidth - margin,
      50,
      { align: "right" }
    );

    // ✅ DIVIDER
    doc.setDrawColor(60, 184, 21);
    doc.setLineWidth(0.5);
    doc.line(margin, 52, pageWidth - margin, 52);

    // ✅ 🔥 TABLE
    autoTable(doc, {
      startY: 58,   // 👈 important spacing
      head: [tableHeaders],
      body: tableData,

      headStyles: {
        fillColor: [60, 184, 21],
        textColor: 255,
        fontStyle: "bold",
      },

      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },

      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
    });

    doc.save(`${fileName}.pdf`);
  };

  const table = useMantineReactTable({
    columns,
    data,

    defaultColumn: {
      minSize: 80,
      size: 120,
      maxSize: 300,
    },

    enableColumnResizing: true,
    columnResizeMode: "onChange",

    enableRowSelection: showSelection,

    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
      density: "xs",
    },

    mantineTableHeadCellProps: {
      style: {
        fontSize: "14px",
        fontWeight: 600,
        padding: "6px 8px",
        whiteSpace: "nowrap",
      },
    },

    mantineTableBodyCellProps: {
      style: {
        fontSize: "13px",
        padding: "6px 8px",
        whiteSpace: "nowrap",
      },
    },

    renderTopToolbarCustomActions: ({ table }) => (
      <Group gap="sm">
        <Button
          variant="outline"
          leftSection={<IconDownload size={16} />}
          disabled={
            !table.getIsSomeRowsSelected() &&
            !table.getIsAllRowsSelected()
          }
          onClick={() =>
            handleExportRows(table.getSelectedRowModel().rows)
          }
        >
          Export Selected
        </Button>

        {onDeleteSelected && (
          <Button
            size="sm"
            variant="outline"
            color="red"
            leftSection={<IconTrash size={16} />}
            disabled={
              !table.getIsSomeRowsSelected() &&
              !table.getIsAllRowsSelected()
            }
            onClick={() => {
              const selectedRows = table.getSelectedRowModel().rows;
              if (window.confirm(`Delete ${selectedRows.length} rows?`)) {
                onDeleteSelected(selectedRows.map(r => r.original));
                table.resetRowSelection();
              }
            }}
          >
            Delete Selected
          </Button>
        )}
      </Group>
    ),
  });

  return (
    <Box>
      <MantineReactTable table={table} />
    </Box>
  );
};

export default CommonTable;