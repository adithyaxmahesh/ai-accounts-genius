import { supabase } from "@/integrations/supabase/client";

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
    .insert([{
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
      risk_scores: {
        critical: 0,
        major: 0,
        moderate: 0
      },
      control_effectiveness: {
        "Internal Controls": "Not Evaluated",
        "Risk Management": "Not Evaluated",
        "Governance": "Not Evaluated"
      }
    }])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("No data returned after creating audit");

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
      await supabase
        .from('audit_items')
        .insert(auditItems);
    }
  }

  return data;
};