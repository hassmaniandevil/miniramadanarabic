import html2canvas from 'html2canvas';

export interface ShareCardData {
  familyName: string;
  totalStars: number;
  streakDays: number;
  constellationsUnlocked: number;
  totalConstellations: number;
  ramadanDay: number;
  profileAvatars: string[];
}

/**
 * Captures a DOM element and converts it to a canvas/image blob
 */
export async function captureElement(element: HTMLElement): Promise<Blob | null> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2, // Higher resolution for better quality
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 1.0);
    });
  } catch (error) {
    console.error('Error capturing element:', error);
    return null;
  }
}

/**
 * Shares content using the Web Share API if available, otherwise downloads
 */
export async function shareOrDownload(
  blob: Blob,
  title: string,
  text: string,
  filename: string
): Promise<{ method: 'share' | 'download'; success: boolean }> {
  // Check if Web Share API is available with file support
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: 'image/png' });
    const shareData = { files: [file], title, text };

    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return { method: 'share', success: true };
      } catch (error) {
        // User cancelled or share failed
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
        return { method: 'share', success: false };
      }
    }
  }

  // Fallback: download the image
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { method: 'download', success: true };
  } catch (error) {
    console.error('Download failed:', error);
    return { method: 'download', success: false };
  }
}

/**
 * Generates a filename for the share card
 */
export function generateFilename(familyName: string, ramadanDay: number): string {
  // Support Arabic characters in filename
  const sanitizedName = familyName.replace(/[<>:"/\\|?*]/g, '-');
  const date = new Date().toISOString().split('T')[0];
  return `miniramadan-${sanitizedName}-day${ramadanDay}-${date}.png`;
}

/**
 * Copies an image blob to the clipboard if supported
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard?.write) {
    console.log('Clipboard API not supported');
    return false;
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
