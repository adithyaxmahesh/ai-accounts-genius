import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BusinessFormFieldsProps {
  businessInfo: {
    business_name: string;
    business_type: string;
    ein: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    zip_code: string;
    phone: string;
    industry: string;
    fiscal_year_end: string;
  };
  setBusinessInfo: (info: any) => void;
  BUSINESS_TYPES: string[];
  STATES: string[];
}

export const BusinessFormFields = ({
  businessInfo,
  setBusinessInfo,
  BUSINESS_TYPES,
  STATES
}: BusinessFormFieldsProps) => {
  return (
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
          <Label htmlFor="ein">EIN (Optional)</Label>
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
  );
};