import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { AuditReport, AuditRiskAssessment } from "./types";

export const generateAuditReport = async (audit: AuditReport) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.text("Internal Audit Report", 20, yPos);
  yPos += 15;

  // Executive Summary
  doc.setFontSize(16);
  doc.text("Executive Summary", 20, yPos);
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Audit Title: ${audit.title}`, 20, yPos);
  yPos += 10;
  doc.text(`Status: ${audit.status}`, 20, yPos);
  yPos += 10;
  doc.text(`Overall Risk Rating: ${audit.risk_level}`, 20, yPos);
  yPos += 10;
  doc.text(`Date: ${new Date(audit.created_at).toLocaleDateString()}`, 20, yPos);
  yPos += 20;

  // Audit Scope & Objective
  if (audit.audit_objective) {
    doc.setFontSize(16);
    doc.text("Audit Scope & Objective", 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(audit.audit_objective, 20, yPos, { maxWidth: 170 });
    yPos += 20;
  }

  // Risk Assessment Matrix
  if (audit.risk_scores) {
    doc.setFontSize(16);
    doc.text("Risk Assessment", 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    
    const risks = [
      { category: "Critical", count: audit.risk_scores.critical || 0 },
      { category: "Major", count: audit.risk_scores.major || 0 },
      { category: "Moderate", count: audit.risk_scores.moderate || 0 }
    ];
    
    risks.forEach(risk => {
      doc.text(`${risk.category}: ${risk.count} findings`, 20, yPos);
      yPos += 10;
    });
    yPos += 10;
  }

  // Key Findings
  if (audit.findings?.length) {
    doc.setFontSize(16);
    doc.text("Key Findings", 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    audit.findings.forEach((finding: string) => {
      doc.text(`• ${finding}`, 20, yPos, { maxWidth: 170 });
      yPos += 10;
    });
    yPos += 10;
  }

  // Control Effectiveness
  if (audit.control_effectiveness) {
    doc.setFontSize(16);
    doc.text("Control Effectiveness", 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    Object.entries(audit.control_effectiveness).forEach(([control, rating]) => {
      doc.text(`${control}: ${rating}`, 20, yPos);
      yPos += 10;
    });
    yPos += 10;
  }

  // Recommendations
  if (audit.recommendations?.length) {
    doc.setFontSize(16);
    doc.text("Recommendations", 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    audit.recommendations.forEach((rec: string) => {
      doc.text(`• ${rec}`, 20, yPos, { maxWidth: 170 });
      yPos += 10;
    });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const fileName = `${audit.id}_report.pdf`;
  const filePath = `${user.id}/${fileName}`;
  
  const pdfBlob = doc.output('blob');
  
  const { error: uploadError } = await supabase.storage
    .from('audit-reports')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (uploadError) throw uploadError;

  const { error: dbError } = await supabase
    .from('audit_report_documents')
    .insert({
      audit_id: audit.id,
      document_path: filePath
    });

  if (dbError) throw dbError;

  return filePath;
};