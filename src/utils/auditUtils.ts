import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";

export const getStatusExplanation = (status: string) => {
  switch (status) {
    case 'planning':
      return "Initial phase: Defining audit scope, objectives, and materiality thresholds";
    case 'control_evaluation':
      return "Evaluating internal controls and assessing their effectiveness";
    case 'evidence_gathering':
      return "Collecting and analyzing financial data, documentation, and conducting tests";
    case 'review':
      return "Evaluating findings, preparing draft conclusions, and formulating audit opinion";
    case 'completed':
      return "Audit completed with final opinion issued and recommendations provided";
    default:
      return "Status pending or unknown";
  }
};

export const getRiskLevelExplanation = (level: string) => {
  switch (level) {
    case 'high':
      return "Significant issues identified requiring immediate attention";
    case 'medium':
      return "Notable concerns that should be addressed";
    case 'low':
      return "Minor or no issues identified";
    default:
      return "Risk level not assessed";
  }
};

export const startNewAudit = async (title: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: transactions } = await supabase
    .from('revenue_records')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(100);

  const totalAmount = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const avgAmount = totalAmount / (transactions?.length || 1);
  const hasLargeTransactions = transactions?.some(t => t.amount > avgAmount * 2);
  
  const initialRiskLevel = hasLargeTransactions ? 'high' : 'medium';

  const { data, error } = await supabase
    .from('audit_reports')
    .insert([
      {
        title,
        status: 'planning',
        risk_level: initialRiskLevel,
        description: "Initial audit scope and planning phase",
        findings: [],
        recommendations: [
          "Define clear audit objectives and scope",
          "Identify key stakeholders and their requirements",
          "Establish materiality thresholds",
          "Assess internal control environment"
        ],
        user_id: user.id,
        audit_objective: null,
        stakeholders: [],
        engagement_letter: null,
        materiality_threshold: null,
        internal_control_assessment: null,
        evidence_collected: null,
        audit_assertions: null,
        audit_opinion: null
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating audit:', error);
    throw new Error(`Failed to create audit: ${error.message}`);
  }

  if (!data) {
    throw new Error("No data returned after creating audit");
  }

  if (transactions) {
    const auditItems = transactions
      .filter(t => t.amount > avgAmount * 1.5)
      .map(t => ({
        audit_id: data.id,
        category: t.category,
        description: `Large transaction: ${t.description || 'No description'}`,
        amount: t.amount,
        status: t.amount > avgAmount * 2 ? 'flagged' : 'pending'
      }));

    if (auditItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('audit_items')
        .insert(auditItems);

      if (itemsError) {
        console.error('Error creating audit items:', itemsError);
      }
    }
  }

  return data;
};

export const generateAuditReport = async (audit: any) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.text(audit.title, 20, yPos);
  yPos += 20;

  // Audit Details
  doc.setFontSize(12);
  doc.text(`Status: ${audit.status}`, 20, yPos);
  yPos += 10;
  doc.text(`Risk Level: ${audit.risk_level}`, 20, yPos);
  yPos += 10;
  doc.text(`Created: ${new Date(audit.created_at).toLocaleDateString()}`, 20, yPos);
  yPos += 20;

  // Objective
  if (audit.audit_objective) {
    doc.setFontSize(16);
    doc.text("Audit Objective", 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(audit.audit_objective, 20, yPos, { maxWidth: 170 });
    yPos += 20;
  }

  // Findings
  if (audit.findings?.length) {
    doc.setFontSize(16);
    doc.text("Findings", 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    audit.findings.forEach((finding: string) => {
      doc.text(`• ${finding}`, 20, yPos, { maxWidth: 170 });
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
  
  // Convert PDF to Blob
  const pdfBlob = doc.output('blob');
  
  // Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from('audit-reports')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (uploadError) throw uploadError;

  // Save document reference
  const { error: dbError } = await supabase
    .from('audit_report_documents')
    .insert({
      audit_id: audit.id,
      document_path: filePath
    });

  if (dbError) throw dbError;

  return filePath;
};

export const updateAuditStatus = async (id: string, status: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: audit } = await supabase
    .from('audit_reports')
    .select('*, audit_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!audit) throw new Error("Audit not found");

  const recommendations = [];
  const findings = [];

  if (audit.audit_items) {
    const flaggedItems = audit.audit_items.filter(item => item.status === 'flagged');
    if (flaggedItems.length > 0) {
      findings.push(`Found ${flaggedItems.length} suspicious transactions`);
      recommendations.push("Review all flagged transactions in detail");
      recommendations.push("Consider implementing additional controls for large transactions");
    }

    const totalAmount = audit.audit_items.reduce((sum, item) => sum + (item.amount || 0), 0);
    if (totalAmount > 100000) {
      findings.push(`High total transaction volume: $${totalAmount.toLocaleString()}`);
      recommendations.push("Consider quarterly review cycles");
    }
  }

  const { data, error } = await supabase
    .from('audit_reports')
    .update({
      status,
      findings: findings.length ? findings : undefined,
      recommendations: recommendations.length ? recommendations : undefined,
      risk_level: findings.length > 2 ? 'high' : findings.length > 0 ? 'medium' : 'low'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  // Generate report when audit is completed
  if (status === 'completed') {
    try {
      await generateAuditReport(data);
    } catch (error) {
      console.error('Error generating audit report:', error);
    }
  }

  return data;
};
