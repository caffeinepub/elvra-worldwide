import { useState } from 'react';
import { useUpdateShowcaseSamples } from '../../hooks/useShowcaseSamples';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { ExternalBlob, ShowcaseSampleUpdate, ShowcaseCategory } from '../../backend';

interface SampleFileState {
  file: File | null;
  preview: string | null;
  uploadProgress: number;
}

const CATEGORY_LABELS: Record<ShowcaseCategory, string> = {
  [ShowcaseCategory.businessCard]: 'Business Card',
  [ShowcaseCategory.logoDesign]: 'Logo Design',
  [ShowcaseCategory.productBanner]: 'Product Banner',
  [ShowcaseCategory.photoFrame]: 'Photo Frame',
};

export default function ExploreWorkSamplesAdminPanel() {
  const [selectedCategory, setSelectedCategory] = useState<ShowcaseCategory>(ShowcaseCategory.businessCard);
  const updateMutation = useUpdateShowcaseSamples(selectedCategory);
  
  const [samples, setSamples] = useState<Record<number, SampleFileState>>(() => {
    const initial: Record<number, SampleFileState> = {};
    for (let i = 1; i <= 12; i++) {
      initial[i] = { file: null, preview: null, uploadProgress: 0 };
    }
    return initial;
  });
  
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category as ShowcaseCategory);
    setError('');
    setSuccess('');
    // Reset samples when changing category
    const resetSamples: Record<number, SampleFileState> = {};
    for (let i = 1; i <= 12; i++) {
      resetSamples[i] = { file: null, preview: null, uploadProgress: 0 };
    }
    setSamples(resetSamples);
  };

  const handleFileSelect = (position: number, file: File | null) => {
    setError('');
    setSuccess('');

    if (!file) {
      setSamples((prev) => ({
        ...prev,
        [position]: { file: null, preview: null, uploadProgress: 0 },
      }));
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError(`Sample ${position}: Please select a JPG or PNG image file.`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSamples((prev) => ({
        ...prev,
        [position]: { file, preview: e.target?.result as string, uploadProgress: 0 },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Check if at least one sample is selected
    const hasSelection = Object.values(samples).some((s) => s.file !== null);
    if (!hasSelection) {
      setError('Please select at least one sample image to upload.');
      return;
    }

    try {
      const updates: ShowcaseSampleUpdate[] = [];

      for (const [positionStr, sampleState] of Object.entries(samples)) {
        if (sampleState.file) {
          const position = parseInt(positionStr, 10);
          const arrayBuffer = await sampleState.file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);

          // Create ExternalBlob with upload progress tracking
          const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
            setSamples((prev) => ({
              ...prev,
              [position]: { ...prev[position], uploadProgress: percentage },
            }));
          });

          updates.push({
            position: BigInt(position),
            sample: {
              file: blob,
              description: `Sample ${position}`,
            },
          });
        }
      }

      await updateMutation.mutateAsync(updates);

      setSuccess(`${CATEGORY_LABELS[selectedCategory]} samples updated successfully! The changes will appear on the product page.`);
      
      // Clear selections after successful upload
      const resetSamples: Record<number, SampleFileState> = {};
      for (let i = 1; i <= 12; i++) {
        resetSamples[i] = { file: null, preview: null, uploadProgress: 0 };
      }
      setSamples(resetSamples);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to update samples. Please try again.');
    }
  };

  const renderSampleInput = (position: number) => {
    const sampleState = samples[position];
    const isUploading = updateMutation.isPending && sampleState.uploadProgress > 0;

    return (
      <div key={position} className="space-y-2">
        <Label htmlFor={`sample-${position}`} className="text-sm font-medium">
          Sample {position}
        </Label>
        <div className="flex flex-col gap-2">
          <Input
            id={`sample-${position}`}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => handleFileSelect(position, e.target.files?.[0] || null)}
            disabled={updateMutation.isPending}
            className="cursor-pointer text-sm"
          />
          {sampleState.preview && (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img
                src={sampleState.preview}
                alt={`Sample ${position} preview`}
                className="w-full h-24 object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-xs font-medium">
                    {sampleState.uploadProgress}%
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-luxury">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <CardTitle>Explore Our Work - Sample Management</CardTitle>
        </div>
        <CardDescription>
          Upload or replace sample images for all product categories. Select a category and upload up to 12 samples. Only JPG and PNG files are accepted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300">Success</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="category-select">Select Category</Label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger id="category-select">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ShowcaseCategory.businessCard}>Business Card</SelectItem>
              <SelectItem value={ShowcaseCategory.logoDesign}>Logo Design</SelectItem>
              <SelectItem value={ShowcaseCategory.productBanner}>Product Banner</SelectItem>
              <SelectItem value={ShowcaseCategory.photoFrame}>Photo Frame</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((position) => renderSampleInput(position))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={updateMutation.isPending || !Object.values(samples).some((s) => s.file !== null)}
          size="lg"
          className="w-full shadow-luxury"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Uploading Samples...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Update {CATEGORY_LABELS[selectedCategory]} Samples
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
