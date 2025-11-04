import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface PromptTreePreviewProps {
  onEdit?: () => void;
}

export function PromptTreePreview({ onEdit }: PromptTreePreviewProps) {
  return (
    <div className="relative flex min-h-[400px] w-full cursor-pointer items-center justify-center rounded-lg border bg-card p-8 text-card-foreground shadow-sm md:min-h-[500px] lg:min-h-[50vh]">
      <div className="relative h-full w-full max-w-[600px]">
        <Image
          alt="Árbol de Prompts"
          src="/assets/tree_preview.webp"
          width={452}
          height={227}
          className="h-auto w-full object-contain"
          priority
        />
      </div>
      <Button
        onClick={onEdit}
        variant="outline"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-6 py-5 text-base font-medium shadow-md"
      >
        Editar árbol de prompts
      </Button>
    </div>
  );
}
