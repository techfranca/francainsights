'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { formatCurrency } from '@/lib/utils'

interface ExportData {
  clientName: string
  companyName: string
  period: string
  totalRevenue: number
  avgRevenue: number
  totalInvestment?: number
  roi?: number
  partnershipMonths: number
  records: {
    month: string
    revenue: number
    investment?: number | null
  }[]
}

export function useExportPDF() {
  const [exporting, setExporting] = useState(false)

  const exportDashboardPDF = async (data: ExportData, chartElementId?: string) => {
    setExporting(true)

    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      let yPosition = margin

      // ============================================
      // CABEÇALHO
      // ============================================
      pdf.setFillColor(8, 21, 52) // franca-blue
      pdf.rect(0, 0, pageWidth, 45, 'F')

      // Logo/Título
      pdf.setTextColor(125, 224, 141) // franca-green
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text('FRANCA', margin, 20)
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Relatório de Desempenho', margin, 28)
      
      pdf.setFontSize(9)
      pdf.setTextColor(200, 200, 200)
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, margin, 36)

      // Info do cliente (lado direito)
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(data.companyName, pageWidth - margin, 20, { align: 'right' })
      
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text(data.clientName, pageWidth - margin, 28, { align: 'right' })
      pdf.text(`Período: ${data.period}`, pageWidth - margin, 36, { align: 'right' })

      yPosition = 55

      // ============================================
      // RESUMO EXECUTIVO
      // ============================================
      pdf.setTextColor(8, 21, 52)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Resumo Executivo', margin, yPosition)
      yPosition += 10

      // Cards de métricas
      const cardWidth = (pageWidth - margin * 2 - 10) / 2
      const cardHeight = 25

      // Card 1: Total Faturado
      pdf.setFillColor(240, 253, 244) // green-50
      pdf.roundedRect(margin, yPosition, cardWidth, cardHeight, 3, 3, 'F')
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      pdf.text('Total Faturado', margin + 5, yPosition + 8)
      pdf.setFontSize(14)
      pdf.setTextColor(34, 120, 69) // green-700
      pdf.setFont('helvetica', 'bold')
      pdf.text(formatCurrency(data.totalRevenue), margin + 5, yPosition + 18)

      // Card 2: Média Mensal
      pdf.setFillColor(239, 246, 255) // blue-50
      pdf.roundedRect(margin + cardWidth + 10, yPosition, cardWidth, cardHeight, 3, 3, 'F')
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Média Mensal', margin + cardWidth + 15, yPosition + 8)
      pdf.setFontSize(14)
      pdf.setTextColor(30, 64, 175) // blue-700
      pdf.setFont('helvetica', 'bold')
      pdf.text(formatCurrency(data.avgRevenue), margin + cardWidth + 15, yPosition + 18)

      yPosition += cardHeight + 8

      // Card 3 e 4: Investimento e ROI (se houver)
      if (data.totalInvestment && data.totalInvestment > 0) {
        // Card 3: Total Investido
        pdf.setFillColor(255, 251, 235) // amber-50
        pdf.roundedRect(margin, yPosition, cardWidth, cardHeight, 3, 3, 'F')
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        pdf.setFont('helvetica', 'normal')
        pdf.text('Total Investido', margin + 5, yPosition + 8)
        pdf.setFontSize(14)
        pdf.setTextColor(180, 83, 9) // amber-700
        pdf.setFont('helvetica', 'bold')
        pdf.text(formatCurrency(data.totalInvestment), margin + 5, yPosition + 18)

        // Card 4: ROI
        pdf.setFillColor(236, 253, 245) // emerald-50
        pdf.roundedRect(margin + cardWidth + 10, yPosition, cardWidth, cardHeight, 3, 3, 'F')
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        pdf.setFont('helvetica', 'normal')
        pdf.text('ROI (Retorno sobre Investimento)', margin + cardWidth + 15, yPosition + 8)
        pdf.setFontSize(14)
        pdf.setTextColor(4, 120, 87) // emerald-700
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${data.roi?.toFixed(0)}%`, margin + cardWidth + 15, yPosition + 18)

        yPosition += cardHeight + 8
      }

      yPosition += 5

      // ============================================
      // TABELA DE REGISTROS
      // ============================================
      pdf.setTextColor(8, 21, 52)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Histórico Mensal', margin, yPosition)
      yPosition += 8

      // Header da tabela
      pdf.setFillColor(248, 250, 252) // gray-50
      pdf.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F')
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Mês', margin + 5, yPosition + 5.5)
      pdf.text('Faturamento', margin + 60, yPosition + 5.5)
      if (data.totalInvestment && data.totalInvestment > 0) {
        pdf.text('Investimento', margin + 110, yPosition + 5.5)
        pdf.text('ROI', margin + 155, yPosition + 5.5)
      }
      yPosition += 8

      // Linhas da tabela
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(50, 50, 50)

      data.records.forEach((record, index) => {
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 30) {
          pdf.addPage()
          yPosition = margin
        }

        // Fundo alternado
        if (index % 2 === 0) {
          pdf.setFillColor(252, 252, 253)
          pdf.rect(margin, yPosition, pageWidth - margin * 2, 7, 'F')
        }

        pdf.setFontSize(9)
        pdf.text(record.month, margin + 5, yPosition + 5)
        pdf.text(formatCurrency(record.revenue), margin + 60, yPosition + 5)
        
        if (data.totalInvestment && data.totalInvestment > 0 && record.investment) {
          pdf.text(formatCurrency(record.investment), margin + 110, yPosition + 5)
          const recordRoi = ((record.revenue - record.investment) / record.investment * 100).toFixed(0)
          pdf.setTextColor(4, 120, 87)
          pdf.text(`${recordRoi}%`, margin + 155, yPosition + 5)
          pdf.setTextColor(50, 50, 50)
        }

        yPosition += 7
      })

      yPosition += 10

      // ============================================
      // CAPTURAR GRÁFICO (se existir)
      // ============================================
      if (chartElementId) {
        const chartElement = document.getElementById(chartElementId)
        if (chartElement) {
          // Verificar se precisa de nova página
          if (yPosition > pageHeight - 100) {
            pdf.addPage()
            yPosition = margin
          }

          pdf.setTextColor(8, 21, 52)
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Gráfico de Evolução', margin, yPosition)
          yPosition += 8

          const canvas = await html2canvas(chartElement, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
          })

          const imgData = canvas.toDataURL('image/png')
          const imgWidth = pageWidth - margin * 2
          const imgHeight = (canvas.height * imgWidth) / canvas.width

          pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, Math.min(imgHeight, 80))
        }
      }

      // ============================================
      // RODAPÉ
      // ============================================
      const totalPages = pdf.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text(
          `Página ${i} de ${totalPages} • Franca Assessoria • Relatório Confidencial`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
      }

      // ============================================
      // SALVAR
      // ============================================
      const fileName = `relatorio-${data.companyName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)

    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      throw error
    } finally {
      setExporting(false)
    }
  }

  return { exportDashboardPDF, exporting }
}