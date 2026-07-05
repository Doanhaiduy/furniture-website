"use client";



import {
  MediaPicker,
} from "../admin-interactions";






export function ImageUploadDropzone({
  value,
  onChange,
  label = "Tải ảnh lên (Upload Image)",
}: {
  value?: string;
  onChange: (url: string, mediaId?: string) => void;
  label?: string;
}) {
  return (
    <MediaPicker
      value={value}
      onChange={(url, id) => onChange(url, id)}
      label={label}
    />
  );
}

