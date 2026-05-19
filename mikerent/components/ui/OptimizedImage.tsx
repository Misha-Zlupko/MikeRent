import Image, { type ImageProps } from "next/image";
import {
  isDataImageUrl,
  optimizeImageUrl,
} from "@/lib/optimizeImageUrl";

type Props = Omit<ImageProps, "src"> & {
  src: string;
  /** Цільова ширина для Cloudinary (transform) */
  optimizeWidth?: number;
};

export function OptimizedImage({
  src,
  optimizeWidth,
  unoptimized,
  ...props
}: Props) {
  const optimized = optimizeImageUrl(src, optimizeWidth);
  const dataUrl = isDataImageUrl(optimized);

  return (
    <Image
      {...props}
      src={optimized}
      unoptimized={unoptimized ?? dataUrl}
    />
  );
}
