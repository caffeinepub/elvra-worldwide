import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { countWords } from '@/utils/validation';

interface ProductOrderFormFieldsProps {
  brandName: string;
  description: string;
  onBrandNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export default function ProductOrderFormFields({
  brandName,
  description,
  onBrandNameChange,
  onDescriptionChange,
}: ProductOrderFormFieldsProps) {
  const wordCount = countWords(description);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="brandName" className="text-base font-medium">
          Shop / Brand Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="brandName"
          type="text"
          placeholder="Enter your Shop / Brand Name"
          value={brandName}
          onChange={(e) => onBrandNameChange(e.target.value)}
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium">
          Detailed Description
        </Label>
        <textarea
          id="description"
          placeholder="Describe your requirement (up to 1000 words)"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={6}
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        <p id="wordCount" className="text-sm text-muted-foreground">
          {wordCount} / 1000
        </p>
      </div>
    </div>
  );
}
