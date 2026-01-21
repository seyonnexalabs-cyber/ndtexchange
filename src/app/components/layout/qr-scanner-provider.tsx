'use client';

import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { jobs, clientAssets } from '@/lib/placeholder-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import jsQR from 'jsqr';


interface QRScannerContextType {
  setScanOpen: (open: boolean) => void;
}

const QRScannerContext = createContext<QRScannerContextType | undefined>(undefined);

export const useQRScanner = () => {
  const context = useContext(QRScannerContext);
  if (context === undefined) {
    throw new Error('useQRScanner must be used within a QRScannerProvider');
  }
  return context;
};


const QRScannerDialog = ({ isOpen, onOpenChange, onScan }: { isOpen: boolean; onOpenChange: (open: boolean) => void; onScan: (id: string) => void }) => {
    const [scannedId, setScannedId] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!isOpen) return;

        let stream: MediaStream | null = null;
        let animationFrameId: number;

        const cleanup = () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

        const startScan = async () => {
            // Get Camera Permission
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play(); // Start playing the video stream
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                  variant: 'destructive',
                  title: 'Camera Access Denied',
                  description: 'Please enable camera permissions in your browser settings to use this app.',
                });
                return;
            }
            
            const scanFrame = () => {
                if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA && canvasRef.current) {
                    const canvas = canvasRef.current;
                    const context = canvas.getContext('2d');
                    
                    if (context) {
                        canvas.height = videoRef.current.videoHeight;
                        canvas.width = videoRef.current.videoWidth;
                        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                        
                        try {
                            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                                inversionAttempts: "dontInvert",
                            });
    
                            if (code) {
                                onScan(code.data);
                                return; // Stop scanning once a code is found
                            }
                        } catch (e) {
                            console.error('QR code detection failed:', e);
                            // This might happen with cross-origin video, but shouldn't with a local stream.
                        }
                    }
                }
                animationFrameId = requestAnimationFrame(scanFrame);
            };
            animationFrameId = requestAnimationFrame(scanFrame);
        };

        startScan();

        return cleanup;
    }, [isOpen, onScan, toast]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (scannedId.trim()) {
            onScan(scannedId.trim());
            setScannedId('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            onOpenChange(open);
            if (!open) {
                setScannedId('');
                setHasCameraPermission(null);
            }
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Scan Asset QR Code</DialogTitle>
                    <DialogDescription>
                        Point your camera at a QR code. If scanning is not working, you can enter the Asset ID manually.
                    </DialogDescription>
                </DialogHeader>
                 <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="relative overflow-hidden rounded-md">
                            <video ref={videoRef} className="w-full aspect-video bg-muted" autoPlay muted playsInline />
                            {/* Hidden canvas for processing frames */}
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            {hasCameraPermission && <div className="absolute inset-0 border-8 border-white/20 rounded-md pointer-events-none" />}
                        </div>
                    
                        {hasCameraPermission === false && (
                            <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access to use this feature.
                                </AlertDescription>
                            </Alert>
                        )}


                        <Input 
                            placeholder="Enter Asset ID manually (e.g., ASSET-001)"
                            value={scannedId}
                            onChange={(e) => setScannedId(e.target.value)}
                            autoFocus={hasCameraPermission === false}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Find Asset</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};


export const QRScannerProvider = ({ children }: { children: ReactNode }) => {
  const [isScanOpen, setScanOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'client';

  const handleQrScan = (id: string) => {
      toast({
        title: "QR Code Scanned",
        description: `Processing Asset ID: ${id}`,
      });
      setScanOpen(false); // Close the dialog immediately after a successful scan

      const assetExists = clientAssets.some(asset => asset.id === id);
      if (!assetExists) {
          setTimeout(() => {
            toast({
                variant: 'destructive',
                title: "Asset Not Found",
                description: `No asset with ID "${id}" could be found.`,
            });
          }, 500); // Delay toast to allow dialog to close
          return;
      }

      const constructUrl = (base: string) => {
          const params = new URLSearchParams(searchParams.toString());
          return `${base}?${params.toString()}`;
      }

      if (role === 'inspector') {
          // For this simulation, we'll assume the inspector belongs to provider-03 (TEAM, Inc.)
          const inspectorProviderId = 'provider-03';
          
          const hasAccess = jobs.some(job => 
              job.assetIds?.includes(id) && job.providerId === inspectorProviderId
          );

          if (hasAccess) {
              router.push(constructUrl(`/dashboard/assets/${id}`));
          } else {
               setTimeout(() => {
                toast({
                    variant: 'destructive',
                    title: "Access Denied",
                    description: `Your company does not have a work history for asset "${id}".`,
                });
               }, 500);
          }
      } else { // For client or other roles, allow access
          router.push(constructUrl(`/dashboard/assets/${id}`));
      }
  };


  return (
    <QRScannerContext.Provider value={{ setScanOpen }}>
      {children}
      <QRScannerDialog 
          isOpen={isScanOpen}
          onOpenChange={setScanOpen}
          onScan={handleQrScan}
      />
    </QRScannerContext.Provider>
  );
};
