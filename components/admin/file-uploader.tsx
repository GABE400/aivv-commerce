"use client";

import React, { useRef, useState } from "react";
import { IKUpload } from "@imagekit/next";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onUploadSuccess: (url: string) => void;
  onUploadError: (error: any) => void;
  folder?: string;
  accept?: string;
  label?: string;
  preview?: string;
  isImage?: boolean;
}

export function FileUploader({ 
  onUploadSuccess, 
  onUploadError, 
  folder = "/products", 
  accept = "image/*",
  label = "Upload File",
  preview,
  isImage = true
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const ikUploadRef = useRef<HTMLInputElement>(null);

  const onError = (err: any) => {
    setIsUploading(false);
    setProgress(0);
    toast.error("Upload failed: " + err.message);
    onUploadError(err);
  };

  const onSuccess = (res: any) => {
    setIsUploading(false);
    setProgress(100);
    toast.success("File uploaded successfully!");
    onUploadSuccess(res.url);
  };

  const onUploadProgress = (p: any) => {
    const percentage = Math.round((p.loaded / p.total) * 100);
    setProgress(percentage);
  };

  const onUploadStart = () => {
    setIsUploading(true);
    setProgress(0);
  };

  return (
    <div className="space-y-4">
      <div 
        onClick={() => ikUploadRef.current?.click()}
        className={cn(
          "relative min-h-[160px] rounded-2xl glass border-2 border-dashed border-glass-border flex flex-col items-center justify-center p-6 cursor-pointer hover:border-accent/40 hover:bg-glass-highlight transition-all group",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <IKUpload
          hidden
          ref={ikUploadRef}
          folder={folder}
          onError={onError}
          onSuccess={onSuccess}
          onUploadProgress={onUploadProgress}
          onUploadStart={onUploadStart}
          accept={accept}
          validateFile={(file) => {
             const sizeInMB = file.size / (1024 * 1024);
             if (sizeInMB > 10) {
               toast.error("File size exceeds 10MB limit");
               return false;
             }
             return true;
          }}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative size-12">
               <Loader2 className="size-12 animate-spin text-accent" />
               <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                 {progress}%
               </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Uploading masterpiece...</p>
          </div>
        ) : preview ? (
          <div className="relative size-full min-h-[120px] flex items-center justify-center">
            {isImage ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img src={preview} alt="Preview" className="max-h-[120px] rounded-lg object-cover shadow-lg" />
            ) : (
               <div className="flex flex-col items-center gap-2 text-emerald-500">
                  <FileText className="size-10" />
                  <span className="text-xs font-bold uppercase truncate max-w-[200px]">{preview.split('/').pop()}</span>
               </div>
            )}
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
               <Upload className="size-8 text-white" />
            </div>
          </div>
        ) : (
          <>
            <div className="size-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {isImage ? <ImageIcon className="size-6 text-accent" /> : <Upload className="size-6 text-accent" />}
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">Drag and drop or click to browse</p>
            </div>
          </>
        )}
      </div>
      
      <p className="text-[10px] text-muted-foreground text-center italic">
        Max file size: 10MB. Powered by ImageKit CDN.
      </p>
    </div>
  );
}
