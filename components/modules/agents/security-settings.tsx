// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { apiService } from '@/services';

interface SecuritySettingsProps {
  agent: Agent;
  onAgentUpdate: () => Promise<void>;
}

export function SecuritySettings({ agent, onAgentUpdate }: SecuritySettingsProps) {
  const [dataStorage, setDataStorage] = useState(agent.data_storage_setting || 'everything');
  const [optInSecureUrls, setOptInSecureUrls] = useState(agent.opt_in_secure_urls || false);
  const [isPiiDialogOpen, setIsPiiDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (agent.pii_config?.categories) {
      setSelectedCategories(agent.pii_config.categories);
    }
  }, [agent.pii_config]);

  const handleDataStorageChange = async (value: string) => {
    try {
      setDataStorage(value);
      await apiService.updateAgent(agent.agent_id, { data_storage_setting: value });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating data storage setting:', error);
    }
  };

  const handleOptInSecureUrlsChange = async (checked: boolean) => {
    try {
      setOptInSecureUrls(checked);
      await apiService.updateAgent(agent.agent_id, { opt_in_secure_urls: checked });
      await onAgentUpdate();
    } catch (error) {
      console.error('Error updating opt in secure URLs:', error);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleSavePiiConfig = async () => {
    try {
      await apiService.updateAgent(agent.agent_id, {
        pii_config: {
          mode: 'post_call',
          categories: selectedCategories
        }
      });
      await onAgentUpdate();
      setIsPiiDialogOpen(false);
    } catch (error) {
      console.error('Error updating PII config:', error);
    }
  };

  const piiCategories = {
    'Identity Information': [
      { id: 'person_name', label: 'Person Name' },
      { id: 'date_of_birth', label: 'Date Of Birth' },
      { id: 'customer_account_number', label: 'Customer Account Number' }
    ],
    'Contact Information': [
      { id: 'address', label: 'Address' },
      { id: 'email', label: 'Email' },
      { id: 'phone_number', label: 'Phone Number' }
    ],
    'Government Identifiers': [
      { id: 'ssn', label: 'SSN' },
      { id: 'passport', label: 'Passport' },
      { id: 'driver_license', label: 'Driver License' }
    ],
    'Financial Information': [
      { id: 'credit_card', label: 'Credit Card' },
      { id: 'bank_account', label: 'Bank Account' }
    ],
    'Security Credentials': [
      { id: 'password', label: 'Password' },
      { id: 'pin', label: 'Pin' }
    ],
    'Health Information': [{ id: 'medical_id', label: 'Medical Id' }]
  };

  return (
    <div className="space-y-6 py-2 pl-7 pr-3">
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">Data Storage Settings</div>
          <p className="text-xs text-muted-foreground">Choose how Retell stores sensitive data (Learn more)</p>
        </div>

        <RadioGroup value={dataStorage} onValueChange={handleDataStorageChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="everything" id="everything" />
            <Label htmlFor="everything" className="cursor-pointer text-sm font-normal">
              Everything
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="everything_except_pii" id="everything_except_pii" />
            <Label htmlFor="everything_except_pii" className="cursor-pointer text-sm font-normal">
              Everything except PII
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="basic_attributes_only" id="basic_attributes_only" />
            <Label htmlFor="basic_attributes_only" className="cursor-pointer text-sm font-normal">
              Basic Attributes Only
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">Personal Info Redaction (PII)</div>
          <p className="text-xs text-muted-foreground">
            Only redact the specific categories of sensitive data you choose, while preserving other call recordings,
            transcripts, and analytics.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsPiiDialogOpen(true)}>
          <Settings className="h-4 w-4" />
          {selectedCategories.length > 0 ? `Set Up (${selectedCategories.length})` : 'Set Up'}
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium">Opt In Secure URLs</div>
            <p className="text-xs text-muted-foreground">
              Add security signatures to URLs. The URLs expire after 24 hours. (Learn more)
            </p>
          </div>
          <Switch checked={optInSecureUrls} onCheckedChange={handleOptInSecureUrlsChange} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">Fallback Voice ID</div>
          <p className="text-xs text-muted-foreground">
            If the current voice provider fails, assign a fallback voice to continue the call.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          + Add
        </Button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-sm font-medium">Default Dynamic Variables</div>
          <p className="text-xs text-muted-foreground">
            Set fallback values for dynamic variables across all endpoints if they are not provided.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Set Up
        </Button>
      </div>

      <Dialog open={isPiiDialogOpen} onOpenChange={setIsPiiDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Knowledge Base</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {Object.entries(piiCategories).map(([section, categories]) => (
              <div key={section} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">{section}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label htmlFor={category.id} className="cursor-pointer text-sm font-normal">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPiiDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePiiConfig}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
