import { useState } from 'react';
import { useUpdateProductBannerSamples } from '../../hooks/useProductBannerSamples';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { ExternalBlob, ProductBannerSampleUpdate } from '../../backend';

interface SampleFileState {
  file: File | null;
  preview: string | null;
  uploadProgress: number;
}

export default function ProductBannerSamplesAdminPanel() {
  const updateMutation = useUpdateProductBannerSamples();
  const [samples, setSamples] = useState<Record<number, SampleFileState>>({
    1: { file: null, preview: null, uploadProgress: 0 },
    2: { file: null, preview: null, uploadProgress: 0 },
    3: { file: null, preview: null, uploadProgress: 0 },
    4: { file: null, preview: null, uploadProgress: 0 },
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

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
      const updates: ProductBannerSampleUpdate[] = [];

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

      setSuccess('Product banner samples updated successfully! The changes will appear in the sample selector.');
      
      // Clear selections after successful upload
      setSamples({
        1: { file: null, preview: null, uploadProgress: 0 },
        2: { file: null, preview: null, uploadProgress: 0 },
        3: { file: null, preview: null, uploadProgress: 0 },
        4: { file: null, preview: null, uploadProgress: 0 },
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to update samples. Please try again.');
    }
  };

  const renderSampleInput = (position: number) => {
    const sampleState = samples[position];
    const isUploading = updateMutation.isPending && sampleState.uploadProgress > 0;

    return (
      <div key={position} className="space-y-3">
        <Label htmlFor={`sample-${position}`} className="text-base font-medium">
          Sample {position}
        </Label>
        <div className="flex flex-col gap-3">
          <Input
            id={`sample-${position}`}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => handleFileSelect(position, e.target.files?.[0] || null)}
            disabled={updateMutation.isPending}
            className="cursor-pointer"
          />
          {sampleState.preview && (
            <div className="relative rounded-lg overflow-hidden border-2 border-border">
              <img
                src={sampleState.preview}
                alt={`Sample ${position} preview`}
                className="w-full h-32 object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-sm font-medium">
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
          <CardTitle>Product Banner Samples</CardTitle>
        </div>
        <CardDescription>
          Upload or replace the sample images shown in the Product Banner selector. Only JPG and PNG files are accepted.
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((position) => renderSampleInput(position))}
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
              Update Product Banner Samples
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
