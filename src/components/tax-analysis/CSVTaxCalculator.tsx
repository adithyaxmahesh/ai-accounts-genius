import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FinancialRecord, TaxResult } from '@/types/financial'
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

export const CSVTaxCalculator = () => {
  const [file, setFile] = useState<File | null>(null)
  const [taxResult, setTaxResult] = useState<TaxResult | null>(null)
  const [financialData, setFinancialData] = useState<FinancialRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file) return

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const { data, error } = await supabase.functions.invoke('process-csv', {
        body: formData
      })

      if (error) throw error

      setTaxResult(data.taxesOwed)
      setFinancialData(data.financialData)
      
      toast({
        title: "Tax Calculation Complete",
        description: "Your tax calculation has been processed successfully.",
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "An error occurred while processing the file",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>CSV Tax Calculator</CardTitle>
          <CardDescription>Upload a CSV file to calculate taxes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Upload CSV</Label>
              <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
            </div>
            <Button type="submit" disabled={!file || isLoading}>
              {isLoading ? 'Processing...' : 'Calculate Taxes'}
            </Button>
          </form>

          {taxResult && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Tax Calculation Results</h2>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Total Income</TableCell>
                    <TableCell>${taxResult.totalIncome.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Expenses</TableCell>
                    <TableCell>${taxResult.totalExpenses.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Taxable Income</TableCell>
                    <TableCell>${taxResult.taxableIncome.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Taxes Owed</TableCell>
                    <TableCell>${taxResult.taxesOwed.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {financialData.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Financial Data</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialData.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell>${record.amount.toFixed(2)}</TableCell>
                      <TableCell>{record.type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}