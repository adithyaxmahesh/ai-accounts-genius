import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "LLC",
  "Corporation",
  "S Corporation",
];

const STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee",
  "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

export const BusinessSettings = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    business_name: "",
    business_type: "",
    ein: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
    industry: "",
    fiscal_year_end: "",
  });

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const { data, error } = await supabase
          .from("business_information")
          .select("*")
          .eq("user_id", session?.user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        if (data) setBusinessInfo(data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load business information",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user.id) {
      fetchBusinessInfo();
    }
  }, [session?.user.id]);

  const handleSave = async () => {
    if (!session?.user.id) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("business_information")
        .upsert({
          user_id: session.user.id,
          ...businessInfo,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business information saved successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save business information",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Business Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={businessInfo.business_name}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, business_name: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="business_type">Business Type</Label>
            <Select
              value={businessInfo.business_type}
              onValueChange={(value) =>
                setBusinessInfo({ ...businessInfo, business_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ein">EIN</Label>
            <Input
              id="ein"
              value={businessInfo.ein}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, ein: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={businessInfo.industry}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, industry: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              value={businessInfo.address_line1}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, address_line1: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input
              id="address_line2"
              value={businessInfo.address_line2}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, address_line2: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={businessInfo.city}
                onChange={(e) =>
                  setBusinessInfo({ ...businessInfo, city: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Select
                value={businessInfo.state}
                onValueChange={(value) =>
                  setBusinessInfo({ ...businessInfo, state: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                value={businessInfo.zip_code}
                onChange={(e) =>
                  setBusinessInfo({ ...businessInfo, zip_code: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={businessInfo.phone}
                onChange={(e) =>
                  setBusinessInfo({ ...businessInfo, phone: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </Card>
  );
};