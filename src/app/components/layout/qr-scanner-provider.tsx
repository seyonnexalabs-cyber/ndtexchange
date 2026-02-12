'use client';

import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Asset, InspectorAsset } from '@/lib/types';
import { cn } from '@/lib/utils';


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

interface ConfirmationState {
  id: string;
  type: 'asset' | 'equipment';
  name: string;
}

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
            // Dynamically import jsqr only on the client side
            const jsQR = (await import('jsqr')).default;

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
                    <DialogTitle>Scan QR Code</DialogTitle>
                    <DialogDescription>
                        Point your camera at a QR code. If scanning is not working, you can enter the ID manually.
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
                            placeholder="Enter Asset or Equipment ID manually"
                            value={scannedId}
                            onChange={(e) => setScannedId(e.target.value)}
                            autoFocus={hasCameraPermission === false}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Find Item</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const ConfirmationDialog = ({ item, onConfirm, onCancel }: { item: ConfirmationState | null, onConfirm: (id: string, type: 'asset' | 'equipment') => void, onCancel: () => void }) => {
    if (!item) {
        return null;
    }
    
    const typeName = item.type.charAt(0).toUpperCase() + item.type.slice(1);

    return (
        <AlertDialog open={!!item} onOpenChange={(open) => !open && onCancel()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{typeName} Found</AlertDialogTitle>
                    <AlertDialogDescription>
                        {typeName} "{item.name}" ({item.id}) was found. Would you like to navigate to its details page?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onConfirm(item.id, item.type)}>Go to {typeName}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export const QRScannerProvider = ({ children }: { children: ReactNode }) => {
  const [isScanOpen, setScanOpen] = useState(false);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'client';
  const { firestore } = useFirebase();

  const handleQrScan = async (id: string) => {
      setScanOpen(false);
      
      if (!firestore) {
          toast({
              variant: 'destructive',
              title: "Database Error",
              description: "Could not connect to the database.",
          });
          return;
      }

      try {
          const assetRef = doc(firestore, 'assets', id);
          const assetSnap = await getDoc(assetRef);

          if (assetSnap.exists()) {
              const asset = assetSnap.data() as Asset;
              setConfirmationState({ id, type: 'asset', name: asset.name });
              return;
          }

          const equipmentRef = doc(firestore, 'equipment', id);
          const equipmentSnap = await getDoc(equipmentRef);
          
          if (equipmentSnap.exists()) {
              const equipment = equipmentSnap.data() as InspectorAsset;
              setConfirmationState({ id, type: 'equipment', name: equipment.name });
              return;
          }
          
          toast({
              variant: 'destructive',
              title: "Item Not Found",
              description: `No asset or equipment with ID "${id}" could be found.`,
          });
          
      } catch (error) {
           toast({
              variant: 'destructive',
              title: "Scan Error",
              description: `An error occurred while fetching item details.`,
          });
          console.error("Error fetching document by QR code:", error);
      }
  };
  
  const handleConfirmRedirect = (id: string, type: 'asset' | 'equipment') => {
      const constructUrl = (base: string) => {
          const params = new URLSearchParams(searchParams.toString());
          return `${base}?${params.toString()}`;
      }

      if (type === 'asset') {
            if (role === 'inspector') {
                // In a real app, we'd check if the inspector's company has a job for this asset.
                // For this demo, we will allow access if they are an inspector.
                router.push(constructUrl(`/dashboard/assets/${id}`));

            } else { // client
                router.push(constructUrl(`/dashboard/assets/${id}`));
            }
      } else if (type === 'equipment') {
          if (role === 'inspector') {
                router.push(constructUrl(`/dashboard/equipment/${id}`));
          } else {
              toast({
                  variant: 'destructive',
                  title: "Access Denied",
                  description: `Only inspectors can view equipment details.`,
              });
          }
      }
      
      setConfirmationState(null);
  };

  const handleCancelRedirect = () => {
    setConfirmationState(null);
  };

  return (
    <QRScannerContext.Provider value={{ setScanOpen }}>
      {children}
      <QRScannerDialog 
          isOpen={isScanOpen}
          onOpenChange={setScanOpen}
          onScan={handleQrScan}
      />
      <ConfirmationDialog
        item={confirmationState}
        onConfirm={handleConfirmRedirect}
        onCancel={handleCancelRedirect}
      />
    </QRScannerContext.Provider>
  );
};
