import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"

export const WriteOffForm = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: '',
    tax_code_id: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('write_offs')
        .insert([{
          amount: Number(formData.amount),
          description: formData.description,
          date: formData.date,
          tax_code_id: formData.tax_code_id
        }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Write-off has been recorded",
      })

      setFormData({
        amount: '',
        description: '',
        date: '',
        tax_code_id: ''
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record write-off",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 glass-card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Recording..." : "Record Write-off"}
        </Button>
      </form>
    </Card>
  )