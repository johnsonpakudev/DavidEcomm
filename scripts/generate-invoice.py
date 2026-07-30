#!/usr/bin/env python3
"""Generate DavidEcomm client invoice PDF."""

from datetime import date, timedelta
from pathlib import Path

from fpdf import FPDF


def build_invoice(output_path: Path) -> None:
    invoice_date = date(2026, 7, 30)
    due_date = invoice_date + timedelta(days=14)
    invoice_number = "INV-2026-0730-001"
    subtotal = 500.00
    gst = 50.00
    total = 550.00
    payid_mobile = "0406 938 895"

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(26, 39, 68)
    pdf.cell(0, 12, "TAX INVOICE", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 6, f"Invoice No: {invoice_number}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, f"Date: {invoice_date.strftime('%d %B %Y')}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, f"Due Date: {due_date.strftime('%d %B %Y')}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(8)

    col_w = 95

    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(26, 39, 68)
    pdf.cell(col_w, 7, "FROM", new_x="RIGHT", new_y="TOP")
    pdf.cell(col_w, 7, "BILL TO", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)

    from_lines = [
        "Johnson Paku",
        "johnsonpaku.dev@gmail.com",
        "ABN: 14 312 911 657",
    ]
    to_lines = [
        "BDK Supply",
        "bdksupply.com.au",
        "Australia",
    ]

    y_start = pdf.get_y()
    for i, line in enumerate(from_lines):
        pdf.set_xy(10, y_start + i * 6)
        pdf.cell(col_w, 6, line)

    for i, line in enumerate(to_lines):
        pdf.set_xy(10 + col_w, y_start + i * 6)
        pdf.cell(col_w, 6, line)

    pdf.set_y(y_start + max(len(from_lines), len(to_lines)) * 6 + 10)

    pdf.set_fill_color(26, 39, 68)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(110, 9, "Description", border=0, fill=True)
    pdf.cell(40, 9, "Amount (ex GST)", border=0, fill=True, align="R")
    pdf.cell(40, 9, "GST", border=0, fill=True, align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.set_text_color(40, 40, 40)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_fill_color(245, 247, 250)

    desc_y = pdf.get_y()
    pdf.multi_cell(
        110,
        7,
        "Professional services and website code - DavidEcomm\n"
        "e-commerce platform development (partial payment)",
        border="B",
        fill=True,
    )
    desc_end_y = pdf.get_y()
    row_height = desc_end_y - desc_y
    pdf.set_xy(120, desc_y)
    pdf.cell(40, row_height, f"${subtotal:,.2f}", border="B", align="R")
    pdf.cell(40, row_height, f"${gst:,.2f}", border="B", align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(6)

    totals_x = 120
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    pdf.set_x(totals_x)
    pdf.cell(40, 7, "Subtotal (ex GST):", align="R")
    pdf.cell(40, 7, f"${subtotal:,.2f}", align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.set_x(totals_x)
    pdf.cell(40, 7, "GST (10%):", align="R")
    pdf.cell(40, 7, f"${gst:,.2f}", align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(26, 39, 68)
    pdf.set_x(totals_x)
    pdf.cell(40, 10, "TOTAL DUE (inc. GST):", align="R")
    pdf.cell(40, 10, f"${total:,.2f}", align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(4)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(
        0,
        5,
        "All amounts in AUD. GST of $50.00 is payable on top of the $500.00 service fee.",
        new_x="LMARGIN",
        new_y="NEXT",
    )

    pdf.ln(8)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(26, 39, 68)
    pdf.cell(0, 7, "Payment Details", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    payment_lines = [
        f"PayID (mobile): {payid_mobile}",
        "Account Name: Johnson Paku",
        f"Amount: ${total:,.2f} inc. GST",
        f"Reference: {invoice_number}",
    ]
    for line in payment_lines:
        pdf.cell(0, 6, line, new_x="LMARGIN", new_y="NEXT")

    pdf.ln(8)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(
        0,
        5,
        "Thank you for your business. Please use the invoice number as the payment reference. "
        "For any questions, contact johnsonpaku.dev@gmail.com.",
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(output_path))


if __name__ == "__main__":
    out = Path(__file__).resolve().parents[1] / "invoices" / "INV-2026-0730-001-BDK-Supply.pdf"
    build_invoice(out)
    print(out)
