'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface PostCallAnalysisProps {
  agent: Agent;
  onAgentUpdate: () => void;
}

interface PostCallDataField {
  name: string;
  type: string;
}

const FIELD_TYPE_ICONS: Record<string, JSX.Element> = {
  string: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 3.25037V4.75037H3.25V3.25037H10ZM13 15.2504V16.7504H3.25V15.2504H13ZM17.5 9.25037V10.7504H3.25V9.25037H17.5Z"
        fill="currentColor"
        className="text-muted-foreground"
      />
    </svg>
  ),
  boolean: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 17.5004C5.85775 17.5004 2.5 14.1426 2.5 10.0004C2.5 5.85812 5.85775 2.50037 10 2.50037C14.1423 2.50037 17.5 5.85812 17.5 10.0004C17.5 14.1426 14.1423 17.5004 10 17.5004ZM10 16.0004C11.5913 16.0004 13.1174 15.3682 14.2426 14.243C15.3679 13.1178 16 11.5917 16 10.0004C16 8.40907 15.3679 6.88294 14.2426 5.75773C13.1174 4.63251 11.5913 4.00037 10 4.00037C8.4087 4.00037 6.88258 4.63251 5.75736 5.75773C4.63214 6.88294 4 8.40907 4 10.0004C4 11.5917 4.63214 13.1178 5.75736 14.243C6.88258 15.3682 8.4087 16.0004 10 16.0004ZM13.6683 7.39262L7.39225 13.6686C6.98228 13.3765 6.62387 13.0181 6.33175 12.6081L12.6077 6.33212C13.0177 6.62424 13.3761 6.98265 13.6683 7.39262Z"
        fill="currentColor"
        className="text-muted-foreground"
      />
    </svg>
  ),
  number: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10.0001 2.12537C10.8574 2.12518 11.6996 2.35107 12.4417 2.78026C13.1838 3.20945 13.7997 3.82675 14.2271 4.56991C14.6545 5.31307 14.8784 6.1558 14.8761 7.0131C14.8739 7.8704 14.6456 8.71195 14.2143 9.45287L9.56733 17.4996H7.83558L11.1648 11.7351C10.4953 11.8993 9.79852 11.9196 9.12055 11.7947C8.44258 11.6697 7.79881 11.4025 7.23173 11.0104C6.66466 10.6184 6.18718 10.1106 5.83081 9.52045C5.47443 8.93033 5.24728 8.27132 5.16433 7.58695C5.08138 6.90257 5.14452 6.20838 5.34959 5.5502C5.55466 4.89203 5.897 4.28483 6.354 3.76868C6.811 3.25254 7.37227 2.83919 8.00077 2.55592C8.62927 2.27265 9.3107 2.12591 10.0001 2.12537ZM10.0001 3.62537C9.10498 3.62537 8.24653 3.98095 7.6136 4.61388C6.98066 5.24682 6.62508 6.10526 6.62508 7.00037C6.62508 7.89547 6.98066 8.75392 7.6136 9.38685C8.24653 10.0198 9.10498 10.3754 10.0001 10.3754C10.8952 10.3754 11.7536 10.0198 12.3866 9.38685C13.0195 8.75392 13.3751 7.89547 13.3751 7.00037C13.3751 6.10526 13.0195 5.24682 12.3866 4.61388C11.7536 3.98095 10.8952 3.62537 10.0001 3.62537Z"
        fill="currentColor"
        className="text-muted-foreground"
      />
    </svg>
  ),
  array: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M7.8125 6.87537C7.8125 6.18501 7.25286 5.62537 6.5625 5.62537C5.87214 5.62537 5.3125 6.18501 5.3125 6.87537C5.3125 7.56572 5.87214 8.12537 6.5625 8.12537C7.25286 8.12537 7.8125 7.56572 7.8125 6.87537ZM9.0625 6.87537C9.0625 8.25608 7.94321 9.37537 6.5625 9.37537C5.18179 9.37537 4.0625 8.25608 4.0625 6.87537C4.0625 5.49465 5.18179 4.37537 6.5625 4.37537C7.94321 4.37537 9.0625 5.49465 9.0625 6.87537ZM15.625 5.00037H10.625V6.25037H15.625V5.00037ZM15.625 9.37537H10.625V10.6254H15.625V9.37537ZM15.625 13.7504H10.625V15.0004H15.625V13.7504ZM6.5625 14.3754C5.87214 14.3754 5.3125 13.8157 5.3125 13.1254C5.3125 12.435 5.87214 11.8754 6.5625 11.8754C7.25286 11.8754 7.8125 12.435 7.8125 13.1254C7.8125 13.8157 7.25286 14.3754 6.5625 14.3754ZM6.5625 15.6254C7.94321 15.6254 9.0625 14.5061 9.0625 13.1254C9.0625 11.7447 7.94321 10.6254 6.5625 10.6254C5.18179 10.6254 4.0625 11.7447 4.0625 13.1254C4.0625 14.5061 5.18179 15.6254 6.5625 15.6254ZM6.5625 7.50037C6.90768 7.50037 7.1875 7.22054 7.1875 6.87537C7.1875 6.53019 6.90768 6.25037 6.5625 6.25037C6.21732 6.25037 5.9375 6.53019 5.9375 6.87537C5.9375 7.22054 6.21732 7.50037 6.5625 7.50037Z"
        fill="currentColor"
        className="text-muted-foreground"
      />
    </svg>
  )
};

export function PostCallAnalysis({ agent, onAgentUpdate }: PostCallAnalysisProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<PostCallDataField | null>(null);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('string');
  const [deletingField, setDeletingField] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('GPT-5');

  const handleAddField = () => {
    setEditingField(null);
    setFieldName('');
    setFieldType('string');
    setIsDialogOpen(true);
  };

  const handleAddFieldWithType = (type: string) => {
    setEditingField(null);
    setFieldName('');
    setFieldType(type);
    setIsDialogOpen(true);
  };

  const handleEditField = (field: PostCallDataField) => {
    setEditingField(field);
    setFieldName(field.name);
    setFieldType(field.type);
    setIsDialogOpen(true);
  };

  const handleDeleteField = async (fieldName: string) => {
    setDeletingField(fieldName);
    try {
      // API call to delete field
      await onAgentUpdate();
    } catch (error) {
      console.error('Error deleting field:', error);
    } finally {
      setDeletingField(null);
    }
  };

  const handleSaveField = async () => {
    try {
      // API call to save field
      await onAgentUpdate();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving field:', error);
    }
  };

  // Mock data - replace with actual agent data
  const fields: PostCallDataField[] = [
    { name: 'test', type: 'string' },
    { name: 'finish_2', type: 'boolean' },
    { name: 's', type: 'number' },
    { name: 's1', type: 'array' }
  ];

  return (
    <div className="flex flex-col px-4 pb-4 pt-0">
      <div className="flex flex-col rounded-lg p-4">
        <div className="text-xs font-medium leading-normal">Post Call Data Retrieval</div>
        <div className="text-xs font-normal leading-none text-muted-foreground">
          Define the information that you need to extract from the voice.{' '}
          <a
            href="https://docs.retellai.com/features/post-call-analysis-overview"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:underline"
          >
            (Learn more)
          </a>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {fields.map((field) => (
            <div
              key={field.name}
              className="inline-flex h-8 w-full items-center justify-start gap-1 rounded-lg border-none bg-muted/50 p-1.5"
            >
              <div className="flex items-center justify-center">{FIELD_TYPE_ICONS[field.type]}</div>
              <div className="truncate text-sm font-normal leading-tight text-muted-foreground">{field.name}</div>
              <div className="ml-auto flex items-center justify-center gap-0.5 p-px">
                <button
                  className="cursor-pointer rounded-sm p-px"
                  onClick={() => handleEditField(field)}
                  disabled={deletingField === field.name}
                >
                  <div className="flex h-[18px] w-[18px] items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M5.23023 11.7L12.0761 4.85415L11.1216 3.8997L4.27578 10.7455V11.7H5.23023ZM5.78981 13.05H2.92578V10.186L10.6444 2.46735C10.771 2.3408 10.9426 2.26971 11.1216 2.26971C11.3006 2.26971 11.4723 2.3408 11.5989 2.46735L13.5084 4.37692C13.635 4.5035 13.7061 4.67516 13.7061 4.85415C13.7061 5.03313 13.635 5.20479 13.5084 5.33137L5.78981 13.05ZM2.92578 14.4H15.0758V15.75H2.92578V14.4Z"
                        fill="currentColor"
                        className="text-muted-foreground"
                      />
                    </svg>
                  </div>
                </button>
                <button
                  className="cursor-pointer rounded-sm p-px"
                  onClick={() => handleDeleteField(field.name)}
                  disabled={deletingField === field.name}
                >
                  <div className="flex h-[18px] w-[18px] cursor-pointer items-center justify-center p-0">
                    {deletingField === field.name ? (
                      <Loader2 className="h-[18px] w-[18px] animate-spin text-muted-foreground" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M12.375 4.95H15.75V6.3H14.4V15.075C14.4 15.254 14.3289 15.4257 14.2023 15.5523C14.0757 15.6789 13.904 15.75 13.725 15.75H4.275C4.09598 15.75 3.92429 15.6789 3.7977 15.5523C3.67112 15.4257 3.6 15.254 3.6 15.075V6.3H2.25V4.95H5.625V2.925C5.625 2.74598 5.69612 2.57429 5.8227 2.4477C5.94929 2.32112 6.12098 2.25 6.3 2.25H11.7C11.879 2.25 12.0507 2.32112 12.1773 2.4477C12.3039 2.57429 12.375 2.74598 12.375 2.925V4.95ZM13.05 6.3H4.95V14.4H13.05V6.3ZM6.975 8.325H8.325V12.375H6.975V8.325ZM9.675 8.325H11.025V12.375H9.675V8.325ZM6.975 3.6V4.95H11.025V3.6H6.975Z"
                          fill="currentColor"
                          className="text-muted-foreground"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex h-8 w-full items-center justify-between rounded-lg bg-white p-0">
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 gap-0.5 rounded-lg border-input p-1.5 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M9.25 9.25V4.75H10.75V9.25H15.25V10.75H10.75V15.25H9.25V10.75H4.75V9.25H9.25Z"
                      fill="currentColor"
                      className="text-muted-foreground"
                    />
                  </svg>
                  <div className="px-1 text-sm font-medium leading-normal">Add</div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="flex flex-col items-start gap-1 rounded-lg bg-white p-2">
                <DropdownMenuItem
                  className="flex w-full cursor-pointer items-center justify-between"
                  onClick={() => handleAddFieldWithType('string')}
                >
                  <div className="flex flex-row items-center gap-2">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M10 3.25037V4.75037H3.25V3.25037H10ZM13 15.2504V16.7504H3.25V15.2504H13ZM17.5 9.25037V10.7504H3.25V9.25037H17.5Z"
                          fill="var(--icon-sub-600)"
                        />
                      </svg>
                    </div>
                    <div className="text-sm font-normal leading-tight">Text</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex w-full cursor-pointer items-center justify-between"
                  onClick={() => handleAddFieldWithType('array')}
                >
                  <div className="flex flex-row items-center gap-2">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M7.8125 6.87537C7.8125 6.18501 7.25286 5.62537 6.5625 5.62537C5.87214 5.62537 5.3125 6.18501 5.3125 6.87537C5.3125 7.56572 5.87214 8.12537 6.5625 8.12537C7.25286 8.12537 7.8125 7.56572 7.8125 6.87537ZM9.0625 6.87537C9.0625 8.25608 7.94321 9.37537 6.5625 9.37537C5.18179 9.37537 4.0625 8.25608 4.0625 6.87537C4.0625 5.49465 5.18179 4.37537 6.5625 4.37537C7.94321 4.37537 9.0625 5.49465 9.0625 6.87537ZM15.625 5.00037H10.625V6.25037H15.625V5.00037ZM15.625 9.37537H10.625V10.6254H15.625V9.37537ZM15.625 13.7504H10.625V15.0004H15.625V13.7504ZM6.5625 14.3754C5.87214 14.3754 5.3125 13.8157 5.3125 13.1254C5.3125 12.435 5.87214 11.8754 6.5625 11.8754C7.25286 11.8754 7.8125 12.435 7.8125 13.1254C7.8125 13.8157 7.25286 14.3754 6.5625 14.3754ZM6.5625 15.6254C7.94321 15.6254 9.0625 14.5061 9.0625 13.1254C9.0625 11.7447 7.94321 10.6254 6.5625 10.6254C5.18179 10.6254 4.0625 11.7447 4.0625 13.1254C4.0625 14.5061 5.18179 15.6254 6.5625 15.6254ZM6.5625 7.50037C6.90768 7.50037 7.1875 7.22054 7.1875 6.87537C7.1875 6.53019 6.90768 6.25037 6.5625 6.25037C6.21732 6.25037 5.9375 6.53019 5.9375 6.87537C5.9375 7.22054 6.21732 7.50037 6.5625 7.50037Z"
                          fill="var(--icon-sub-600)"
                        />
                      </svg>
                    </div>
                    <div className="text-sm font-normal leading-tight">Selector</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex w-full cursor-pointer items-center justify-between"
                  onClick={() => handleAddFieldWithType('boolean')}
                >
                  <div className="flex flex-row items-center gap-2">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M10 17.5004C5.85775 17.5004 2.5 14.1426 2.5 10.0004C2.5 5.85812 5.85775 2.50037 10 2.50037C14.1423 2.50037 17.5 5.85812 17.5 10.0004C17.5 14.1426 14.1423 17.5004 10 17.5004ZM10 16.0004C11.5913 16.0004 13.1174 15.3682 14.2426 14.243C15.3679 13.1178 16 11.5917 16 10.0004C16 8.40907 15.3679 6.88294 14.2426 5.75773C13.1174 4.63251 11.5913 4.00037 10 4.00037C8.4087 4.00037 6.88258 4.63251 5.75736 5.75773C4.63214 6.88294 4 8.40907 4 10.0004C4 11.5917 4.63214 13.1178 5.75736 14.243C6.88258 15.3682 8.4087 16.0004 10 16.0004ZM13.6683 7.39262L7.39225 13.6686C6.98228 13.3765 6.62387 13.0181 6.33175 12.6081L12.6077 6.33212C13.0177 6.62424 13.3761 6.98265 13.6683 7.39262Z"
                          fill="var(--icon-sub-600)"
                        />
                      </svg>
                    </div>
                    <div className="text-sm font-normal leading-tight">Boolean</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex w-full cursor-pointer items-center justify-between"
                  onClick={() => handleAddFieldWithType('number')}
                >
                  <div className="flex flex-row items-center gap-2">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M10.0001 2.12537C10.8574 2.12518 11.6996 2.35107 12.4417 2.78026C13.1838 3.20945 13.7997 3.82675 14.2271 4.56991C14.6545 5.31307 14.8784 6.1558 14.8761 7.0131C14.8739 7.8704 14.6456 8.71195 14.2143 9.45287L9.56733 17.4996H7.83558L11.1648 11.7351C10.4953 11.8993 9.79852 11.9196 9.12055 11.7947C8.44258 11.6697 7.79881 11.4025 7.23173 11.0104C6.66466 10.6184 6.18718 10.1106 5.83081 9.52045C5.47443 8.93033 5.24728 8.27132 5.16433 7.58695C5.08138 6.90257 5.14452 6.20838 5.34959 5.5502C5.55466 4.89203 5.897 4.28483 6.354 3.76868C6.811 3.25254 7.37227 2.83919 8.00077 2.55592C8.62927 2.27265 9.3107 2.12591 10.0001 2.12537ZM10.0001 3.62537C9.10498 3.62537 8.24653 3.98095 7.6136 4.61388C6.98066 5.24682 6.62508 6.10526 6.62508 7.00037C6.62508 7.89547 6.98066 8.75392 7.6136 9.38685C8.24653 10.0198 9.10498 10.3754 10.0001 10.3754C10.8952 10.3754 11.7536 10.0198 12.3866 9.38685C13.0195 8.75392 13.3751 7.89547 13.3751 7.00037C13.3751 6.10526 13.0195 5.24682 12.3866 4.61388C11.7536 3.98095 10.8952 3.62537 10.0001 3.62537Z"
                          fill="var(--icon-sub-600)"
                        />
                      </svg>
                    </div>
                    <div className="text-sm font-normal leading-tight">Number</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="inline-flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-white pl-3 pr-2.5">
                <div className="flex items-center gap-2">
                  <div>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M7.51453 3.99906L9.46979 2.04381C9.61043 1.90321 9.80116 1.82422 10 1.82422C10.1989 1.82422 10.3896 1.90321 10.5303 2.04381L12.4855 3.99906H15.25C15.4489 3.99906 15.6397 4.07808 15.7804 4.21873C15.921 4.35938 16 4.55015 16 4.74906V7.51356L17.9553 9.46881C18.0959 9.60945 18.1749 9.80018 18.1749 9.99906C18.1749 10.1979 18.0959 10.3887 17.9553 10.5293L16 12.4846V15.2491C16 15.448 15.921 15.6387 15.7804 15.7794C15.6397 15.92 15.4489 15.9991 15.25 15.9991H12.4855L10.5303 17.9543C10.3896 18.0949 10.1989 18.1739 10 18.1739C9.80116 18.1739 9.61043 18.0949 9.46979 17.9543L7.51453 15.9991H4.75003C4.55112 15.9991 4.36036 15.92 4.21971 15.7794C4.07905 15.6387 4.00003 15.448 4.00003 15.2491V12.4846L2.04479 10.5293C1.90418 10.3887 1.8252 10.1979 1.8252 9.99906C1.8252 9.80018 1.90418 9.60945 2.04479 9.46881L4.00003 7.51356V4.74906C4.00003 4.55015 4.07905 4.35938 4.21971 4.21873C4.36036 4.07808 4.55112 3.99906 4.75003 3.99906H7.51453ZM5.50003 5.49906V8.13531L3.63629 9.99906L5.50003 11.8628V14.4991H8.13629L10 16.3628L11.8638 14.4991H14.5V11.8628L16.3638 9.99906L14.5 8.13531V5.49906H11.8638L10 3.63531L8.13629 5.49906H5.50003ZM10 12.9991C9.20438 12.9991 8.44132 12.683 7.87871 12.1204C7.31611 11.5578 7.00003 10.7947 7.00003 9.99906C7.00003 9.20341 7.31611 8.44035 7.87871 7.87774C8.44132 7.31513 9.20438 6.99906 10 6.99906C10.7957 6.99906 11.5587 7.31513 12.1214 7.87774C12.684 8.44035 13 9.20341 13 9.99906C13 10.7947 12.684 11.5578 12.1214 12.1204C11.5587 12.683 10.7957 12.9991 10 12.9991ZM10 11.4991C10.3979 11.4991 10.7794 11.341 11.0607 11.0597C11.342 10.7784 11.5 10.3969 11.5 9.99906C11.5 9.60123 11.342 9.2197 11.0607 8.9384C10.7794 8.65709 10.3979 8.49906 10 8.49906C9.60221 8.49906 9.22068 8.65709 8.93937 8.9384C8.65807 9.2197 8.50003 9.60123 8.50003 9.99906C8.50003 10.3969 8.65807 10.7784 8.93937 11.0597C9.22068 11.341 9.60221 11.4991 10 11.4991Z"
                        fill="#525866"
                      />
                    </svg>
                  </div>
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-normal leading-tight">
                    {selectedModel}
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GPT-5">GPT-5</SelectItem>
                <SelectItem value="GPT-4">GPT-4</SelectItem>
                <SelectItem value="GPT-3.5">GPT-3.5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Field Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingField ? 'Edit Field' : 'Add Field'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fieldName">Field Name</Label>
              <Input id="fieldName" value={fieldName} onChange={(e) => setFieldName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type</Label>
              <Select value={fieldType} onValueChange={setFieldType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveField}>{editingField ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
