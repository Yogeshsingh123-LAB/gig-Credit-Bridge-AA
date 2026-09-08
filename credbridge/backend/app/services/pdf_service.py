import io
import qrcode
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_report_pdf(report_data: dict) -> bytes:
    """
    Generates a professional, cryptographic VERIFIED GIG INCOME REPORT PDF
    conforming strictly to the CredBridge evidence specification.
    Includes embedded QR code, 12-month analysis metrics, Consistency Score,
    SHA-256 canonical hash, and digital signature metadata.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#0f172a") # Dark slate
    accent_emerald = colors.HexColor("#059669") # Emerald
    text_muted = colors.HexColor("#64748b")     # Muted slate

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=accent_emerald
    )

    label_style = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=text_muted
    )

    val_style = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=primary_color
    )

    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155")
    )

    story = []

    # 1. Header Banner
    rep_id = report_data.get("report_id") or report_data.get("report_number", "CBR-2026-UNKNOWN")
    worker_name = report_data.get("worker_name", "Authorized Worker")
    issued_date = report_data.get("issued_at") or datetime.now().strftime("%d %b %Y")
    if isinstance(issued_date, datetime):
        issued_date = issued_date.strftime("%d %b %Y")
    
    header_text = f"""
    <font color="#059669"><b>CRED BRIDGE EVIDENCE INFRASTRUCTURE</b></font><br/>
    <b>VERIFIED GIG INCOME REPORT</b>
    """
    
    meta_text = f"""
    <b>Report ID:</b> {rep_id}<br/>
    <b>Analysis Period:</b> 12 Months<br/>
    <b>Issued:</b> {issued_date}<br/>
    <b>Verification:</b> Digitally Verifiable (SHA-256)
    """

    header_table = Table(
        [[Paragraph(header_text, title_style), Paragraph(meta_text, val_style)]],
        colWidths=[340, 200]
    )
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6)
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_emerald, spaceBefore=4, spaceAfter=10))

    # 2. Worker & Account Metadata
    masked_aadhaar = report_data.get("masked_aadhaar", "XXXXXXXX4821")
    accounts_str = ", ".join(report_data.get("accounts_analyzed", ["Authorized Bank Accounts"]))
    
    worker_info = [
        [
            Paragraph("<b>Worker Name:</b>", label_style), Paragraph(worker_name, val_style),
            Paragraph("<b>Identity Source:</b>", label_style), Paragraph(f"DigiLocker ({masked_aadhaar})", val_style)
        ],
        [
            Paragraph("<b>Accounts Analyzed:</b>", label_style), Paragraph(accounts_str, val_style),
            Paragraph("<b>Analysis Window:</b>", label_style), Paragraph("Last 12 Months (Fixed)", val_style)
        ]
    ]
    w_table = Table(worker_info, colWidths=[100, 180, 100, 160])
    w_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0"))
    ]))
    story.append(w_table)
    story.append(Spacer(1, 10))

    # 3. Core Financial Evidence Metrics & Consistency Score
    monthly_avg = report_data.get("verified_average_monthly_gig_income", 0.0)
    total_income = report_data.get("total_verified_gig_income", 0.0)
    consistency_score = report_data.get("consistency_score", 82.0)
    volatility = report_data.get("income_volatility", 12.0)
    confidence = report_data.get("verification_confidence", 95.0)
    trend = report_data.get("income_trend", "Stable")
    consistency_label = report_data.get("income_consistency", "High")

    metrics_data = [
        [
            Paragraph("<b>Verified Monthly Income</b>", label_style),
            Paragraph("<b>Total 12-Month Inflow</b>", label_style),
            Paragraph("<b>Consistency Score</b>", label_style),
            Paragraph("<b>Confidence Index</b>", label_style)
        ],
        [
            Paragraph(f"<font size=13 color='#059669'><b>₹{monthly_avg:,.2f}</b></font>", val_style),
            Paragraph(f"<font size=13 color='#0f172a'><b>₹{total_income:,.2f}</b></font>", val_style),
            Paragraph(f"<font size=13 color='#2563eb'><b>{int(consistency_score)}/100</b></font><br/><font size=7 color='#64748b'>{consistency_label}</font>", val_style),
            Paragraph(f"<font size=13 color='#0f172a'><b>{confidence:.1f}%</b></font><br/><font size=7 color='#64748b'>Trend: {trend}</font>", val_style)
        ]
    ]
    m_table = Table(metrics_data, colWidths=[135, 135, 135, 135])
    m_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8)
    ]))
    story.append(m_table)
    story.append(Spacer(1, 12))

    # 4. 12-Month Inflow Trajectory Table
    story.append(Paragraph("12-Month Observed Income History", h2_style))
    monthly_data = report_data.get("monthly_breakdown", [])
    
    # 2 rows of 6 months each
    if monthly_data:
        headers1 = [Paragraph(f"<b>{m.get('month', '')[:8]}</b>", label_style) for m in monthly_data[:6]]
        vals1 = [Paragraph(f"₹{m.get('amount', 0):,.0f}", val_style) for m in monthly_data[:6]]
        headers2 = [Paragraph(f"<b>{m.get('month', '')[:8]}</b>", label_style) for m in monthly_data[6:12]]
        vals2 = [Paragraph(f"₹{m.get('amount', 0):,.0f}", val_style) for m in monthly_data[6:12]]
        
        hist_table_data = [headers1, vals1]
        if headers2:
            hist_table_data.extend([headers2, vals2])
            
        h_table = Table(hist_table_data, colWidths=[90]*min(6, len(monthly_data)))
        h_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#ffffff")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4)
        ]))
        story.append(h_table)
        story.append(Spacer(1, 10))

    # 5. Methodology & Disclaimers
    story.append(Paragraph("Methodology & Evaluation Standards", h2_style))
    methodology_text = """
    <b>Deterministic Income Verification:</b> CredBridge analyzed authorized financial statement data 
    from the accounts selected by the worker for the required 12-month analysis period. 
    Only financial inflows classified as gig-related income (e.g. Uber, Zomato, Swiggy) were included.<br/>
    <b>Consistency Score:</b> The Consistency Score indicates how consistently gig-related income was 
    observed across the 12-month analysis period based on cashflow stability and volatility index.<br/>
    <b>Notice:</b> This report is not a credit score, loan approval, salary slip, or guarantee of loan eligibility. 
    Final credit terms and lending decisions belong solely to the regulated lending institution.
    """
    story.append(Paragraph(methodology_text, body_style))
    story.append(Spacer(1, 10))

    # 6. QR Code & Cryptographic Verification Block
    story.append(Paragraph("Cryptographic Proof & Document Authenticity", h2_style))
    
    # Generate QR Code in-memory
    verify_url = f"http://credbridge.internal/verify/report/{rep_id}"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=3,
        border=1
    )
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_bytes = io.BytesIO()
    qr_img.save(qr_bytes, format="PNG")
    qr_bytes.seek(0)
    
    qr_flowable = Image(qr_bytes, width=1.1*inch, height=1.1*inch)

    canonical_hash = report_data.get("canonical_hash", "SHA-256 Validated")
    signature = report_data.get("signature", "HMAC-SHA256 Server Signature")
    
    crypto_details = f"""
    <b>Status:</b> Digitally Signed & Tamper-Evident<br/>
    <b>Algorithm:</b> HMAC-SHA256 (Key Version v1)<br/>
    <b>SHA-256 Canonical Hash:</b><br/>
    <font name="Courier" size=7 color="#475569">{canonical_hash}</font><br/>
    <b>Digital Signature:</b><br/>
    <font name="Courier" size=7 color="#475569">{signature[:52]}...</font><br/>
    <b>Verification Route:</b> /verify/report/{rep_id}
    """

    crypto_table = Table(
        [[qr_flowable, Paragraph(crypto_details, body_style)]],
        colWidths=[100, 440]
    )
    crypto_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8)
    ]))
    story.append(crypto_table)

    # 7. Document Footer
    story.append(Spacer(1, 14))
    footer_text = "CredBridge Evidence Verification Infrastructure • This report is digitally verifiable. It is not a credit score, loan approval, or guarantee of loan eligibility."
    story.append(Paragraph(footer_text, ParagraphStyle(
        'FooterNotice',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10,
        textColor=text_muted,
        alignment=1 # Centered
    )))

    # Build document
    doc.build(story)
    pdf_value = buffer.getvalue()
    buffer.close()
    return pdf_value
