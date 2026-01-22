"""
PDF Generator for Maintenance History Reports
Uses ReportLab to create professional PDF documents
"""
from io import BytesIO
from datetime import datetime
from typing import Optional, List, Dict, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY


class MaintenanceHistoryPDFGenerator:
    """Generate PDF reports for maintenance histories"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a365d'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#2c5282'),
            spaceAfter=12,
            spaceBefore=20,
            fontName='Helvetica-Bold'
        ))
        
        # Normal text with justify
        self.styles.add(ParagraphStyle(
            name='JustifiedBody',
            parent=self.styles['BodyText'],
            alignment=TA_JUSTIFY,
            fontSize=11,
            spaceAfter=12
        ))
        
        # Footer style
        self.styles.add(ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.grey,
            alignment=TA_CENTER
        ))
    
    def _add_header(self, elements: List, title: str, created_at: datetime):
        """Add document header"""
        # Title
        title_para = Paragraph(title, self.styles['CustomTitle'])
        elements.append(title_para)
        
        # Date
        date_str = created_at.strftime("%d de %B de %Y - %H:%M")
        date_para = Paragraph(
            f"<i>Fecha de generación: {date_str}</i>",
            self.styles['Footer']
        )
        elements.append(date_para)
        elements.append(Spacer(1, 1*cm))
    
    def _add_summary_section(self, elements: List, summary: str):
        """Add summary section"""
        elements.append(Paragraph("📝 Resumen Ejecutivo", self.styles['SectionHeader']))
        summary_para = Paragraph(summary, self.styles['JustifiedBody'])
        elements.append(summary_para)
        elements.append(Spacer(1, 0.5*cm))
    
    def _add_aircraft_info_section(self, elements: List, aircraft_info: Optional[Dict[str, Any]]):
        """Add aircraft information section"""
        if not aircraft_info:
            return
        
        elements.append(Paragraph("✈️ Información de Aeronave", self.styles['SectionHeader']))
        
        # Create table data
        table_data = []
        
        if aircraft_info.get('model'):
            table_data.append(['Modelo', aircraft_info['model']])
        if aircraft_info.get('registration'):
            table_data.append(['Matrícula', aircraft_info['registration']])
        if aircraft_info.get('operator'):
            table_data.append(['Operador', aircraft_info['operator']])
        
        if table_data:
            # Create table
            table = Table(table_data, colWidths=[5*cm, 11*cm])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e2e8f0')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 11),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            
            elements.append(table)
            elements.append(Spacer(1, 0.5*cm))
    
    def _add_maintenance_actions_section(self, elements: List, actions: Optional[List[Dict[str, Any]]]):
        """Add maintenance actions section"""
        if not actions or len(actions) == 0:
            return
        
        elements.append(Paragraph("🔧 Acciones de Mantenimiento", self.styles['SectionHeader']))
        
        for idx, action in enumerate(actions, 1):
            action_title = f"<b>{idx}. {action.get('action', 'N/A')}</b>"
            elements.append(Paragraph(action_title, self.styles['BodyText']))
            
            if action.get('result'):
                result_text = f"<i>Resultado:</i> {action['result']}"
                elements.append(Paragraph(result_text, self.styles['BodyText']))
            
            if action.get('date'):
                date_text = f"<i>Fecha:</i> {action['date']}"
                elements.append(Paragraph(date_text, self.styles['BodyText']))
            
            elements.append(Spacer(1, 0.3*cm))
        
        elements.append(Spacer(1, 0.3*cm))
    
    def _add_parts_used_section(self, elements: List, parts: Optional[List[Dict[str, Any]]]):
        """Add parts used section"""
        if not parts or len(parts) == 0:
            return
        
        elements.append(Paragraph("🔩 Piezas Utilizadas", self.styles['SectionHeader']))
        
        # Create table data
        table_data = [['Pieza', 'Número de Parte', 'Cantidad']]
        
        for part in parts:
            table_data.append([
                part.get('part_name', 'N/A'),
                part.get('part_number', 'N/A'),
                str(part.get('quantity', 'N/A'))
            ])
        
        # Create table
        table = Table(table_data, colWidths=[7*cm, 6*cm, 3*cm])
        table.setStyle(TableStyle([
            # Header row styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5282')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            
            # Data rows styling
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('ALIGN', (0, 1), (1, -1), 'LEFT'),
            ('ALIGN', (2, 1), (2, -1), 'CENTER'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            
            # All cells
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            
            # Alternating row colors
            *[('BACKGROUND', (0, i), (-1, i), colors.white) 
              for i in range(1, len(table_data)) if i % 2 == 0]
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.5*cm))
    
    def _add_footer(self, canvas, doc):
        """Add page footer"""
        canvas.saveState()
        
        # Page number
        page_num = canvas.getPageNumber()
        text = f"Página {page_num}"
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(colors.grey)
        canvas.drawCentredString(A4[0] / 2, 1.5*cm, text)
        
        # Generation timestamp
        timestamp = datetime.now().strftime("%d/%m/%Y %H:%M")
        footer_text = f"Informe generado el {timestamp} - Plane Assistant"
        canvas.drawCentredString(A4[0] / 2, 1*cm, footer_text)
        
        canvas.restoreState()
    
    def generate_pdf(
        self,
        title: str,
        summary: str,
        created_at: datetime,
        aircraft_info: Optional[Dict[str, Any]] = None,
        maintenance_actions: Optional[List[Dict[str, Any]]] = None,
        parts_used: Optional[List[Dict[str, Any]]] = None
    ) -> BytesIO:
        """
        Generate PDF document for maintenance history
        
        Args:
            title: Report title
            summary: Executive summary
            created_at: Creation timestamp
            aircraft_info: Aircraft information dictionary
            maintenance_actions: List of maintenance actions
            parts_used: List of parts used
        
        Returns:
            BytesIO: PDF file in memory
        """
        buffer = BytesIO()
        
        # Create document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2.5*cm,
            bottomMargin=2.5*cm,
            title=title,
            author="Plane Assistant"
        )
        
        # Build content
        elements = []
        
        self._add_header(elements, title, created_at)
        self._add_summary_section(elements, summary)
        self._add_aircraft_info_section(elements, aircraft_info)
        self._add_maintenance_actions_section(elements, maintenance_actions)
        self._add_parts_used_section(elements, parts_used)
        
        # Build PDF
        doc.build(elements, onFirstPage=self._add_footer, onLaterPages=self._add_footer)
        
        # Get PDF from buffer
        buffer.seek(0)
        return buffer


def generate_maintenance_history_pdf(
    title: str,
    summary: str,
    created_at: datetime,
    aircraft_info: Optional[Dict[str, Any]] = None,
    maintenance_actions: Optional[List[Dict[str, Any]]] = None,
    parts_used: Optional[List[Dict[str, Any]]] = None
) -> BytesIO:
    """
    Convenience function to generate maintenance history PDF
    
    Args:
        title: Report title
        summary: Executive summary
        created_at: Creation timestamp
        aircraft_info: Aircraft information dictionary
        maintenance_actions: List of maintenance actions
        parts_used: List of parts used
    
    Returns:
        BytesIO: PDF file in memory
    """
    generator = MaintenanceHistoryPDFGenerator()
    return generator.generate_pdf(
        title=title,
        summary=summary,
        created_at=created_at,
        aircraft_info=aircraft_info,
        maintenance_actions=maintenance_actions,
        parts_used=parts_used
    )
