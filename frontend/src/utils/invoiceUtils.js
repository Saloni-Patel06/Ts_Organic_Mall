import { jsPDF } from "jspdf";

// Convert Image to Base64
export const getBase64ImageFromURL = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result);
  });
};

// Main Invoice Generator
export const generateInvoice = async (order) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y;

  // ===== LOGO =====
  const logo = await getBase64ImageFromURL(
    process.env.PUBLIC_URL + "/img/logots.png"
  );
  doc.addImage(logo, "PNG", margin, 10, 40, 40);

  // ===== HEADER =====
  doc.setFontSize(16);
  doc.setTextColor(60, 184, 21);
  doc.setFont(undefined, "bold");
  doc.text("TS Organic Mall", pageWidth / 2, 22, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.setFont(undefined, "normal");
  doc.text("Fresh Organic Products", pageWidth / 2, 29, { align: "center" });
  doc.text("Email: tsorganicmall0623@gmail.com", pageWidth / 2, 35, { align: "center" });
  doc.text("Mobile: +91 9104427875", pageWidth / 2, 40, { align: "center" });
  doc.text(
    "Address: TS Organic Mall, Kishor Plaza, Anand - 388001",
    pageWidth / 2,
    45,
    { align: "center" }
  );

  // ===== LINE =====
  y = 52;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  // ===== INVOICE INFO =====
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont(undefined, "normal");

  doc.text(`Invoice No: ${order.id || ""}`, margin, y);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, y, {
    align: "right",
  });

  y += 15;

  // ===== BILL TO =====
  doc.setFont(undefined, "bold");
  doc.text("Bill To:", margin, y);

  doc.setFont(undefined, "normal");
  doc.text(order.customerName || "", margin, y + 7);
  doc.text(`Mobile: ${order.deliveryAddress?.mobile || ""}`, margin, y + 13);
  doc.text(order.deliveryAddress?.address || "", margin, y + 19);

  y += 30;

  // ===== DELIVERY AGENT =====
  doc.setFont(undefined, "bold");
  doc.text("Delivery Agent:", margin, y);

  doc.setFont(undefined, "normal");
  doc.text(`Name: ${order.agentName || "N/A"}`, margin, y + 7);
  doc.text(`Mobile: ${order.mobile || "N/A"}`, margin, y + 13);

  y += 25;

  // ===== TABLE HEADER =====
  doc.setFillColor(60, 184, 21);
  doc.setTextColor(255);
  doc.rect(margin, y, pageWidth - margin * 2, 8, "F");

  doc.text("Item", margin + 2, y + 5);
  doc.text("Qty", margin + 90, y + 5);
  doc.text("Price", margin + 110, y + 5);
  doc.text("Total", margin + 140, y + 5);

  y += 15;
  doc.setTextColor(0);

  // ===== ITEMS =====
  let subtotal = 0;

  order.items?.forEach((item) => {
    const total = item.quantity * item.price;
    subtotal += total;

    doc.text(item.productName || "", margin + 2, y);
    doc.text(String(item.quantity || 0), margin + 95, y);
    doc.text(`Rs.${item.price || 0}`, margin + 110, y);
    doc.text(`Rs.${total}`, margin + 140, y);

    y += 8;
  });

  y += 5;
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ===== TOTAL =====
  const gstRate = 0.05;
  const gstAmount = subtotal * gstRate;
  const delivery = order.deliveryCharge || 0;
  const orderTotal = subtotal + gstAmount + delivery;

  doc.setFont(undefined, "bold");

  doc.text(`Subtotal: Rs.${subtotal.toFixed(2)}`, pageWidth - margin, y, { align: "right" });
  y += 8;

  doc.text(`GST (5%): Rs.${gstAmount.toFixed(2)}`, pageWidth - margin, y, { align: "right" });
  y += 8;

  doc.text(`Delivery Charge: Rs.${delivery.toFixed(2)}`, pageWidth - margin, y, { align: "right" });
  y += 12;

  doc.setFontSize(14);
  doc.setTextColor(60, 184, 21);
  doc.text(`Order Total: Rs.${orderTotal.toFixed(2)}`, pageWidth - margin, y, {
    align: "right",
  });

  y += 20;

  // ===== FOOTER =====
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    "Thank you for shopping with TS Organic Mall!",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  doc.save(`Invoice-${order.id}.pdf`);
};