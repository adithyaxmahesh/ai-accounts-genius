import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"

export const DocumentUpload = () => {
  const { toast } = useToast()
  const [processing, setProcessing] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)

  const handleUpload = async () => {
    if (!files?.length) return

    setProcessing(true)
    toast({
      title: "Document Upload Started",
      description: "Processing your documents with AI OCR...",
    })

    try {
      // Here we would typically upload to Supabase storage and process with OCR
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: "Success",
        description: "Documents processed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process documents",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Document Processing</h3>
        <div className="flex gap-2">
          <Input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="max-w-[300px]"
          />
          <Button 
            onClick={handleUpload} 
            disabled={!files?.length || processing}
            className="hover-scale"
          >
            <Upload className="h-4 w-4 mr-2" />
            {processing ? "Processing..." : "Upload"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files && Array.from(files).map((file, i) => (
          <div key={i} className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <p className="font-semibold truncate">{file.name}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Status: {processing ? "Processing" : "Ready"}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )