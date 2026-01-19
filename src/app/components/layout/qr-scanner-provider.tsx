'use client';

import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { jobs, clientAssets } from '@/lib/placeholder-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


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
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        let stream: MediaStream | null = null;
        
        const cleanupStream = () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

        if (isOpen) {
            const getCameraPermission = async () => {
              try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setHasCameraPermission(true);
        
                if (videoRef.current) {
                  videoRef.current.srcObject = stream;
                }
              } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                  variant: 'destructive',
                  title: 'Camera Access Denied',
                  description: 'Please enable camera permissions in your browser settings to use this app.',
                });
              }
            };
            getCameraPermission();
        } else {
            cleanupStream();
        }

        return cleanupStream;
    }, [isOpen, toast]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (scannedId.trim()) {
            onScan(scannedId.trim());
            setScannedId(''); // Clear input after scan
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            onOpenChange(open);
            if (!open) {
                setScannedId('');
            }
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Scan Asset QR Code</DialogTitle>
                    <DialogDescription>
                        Use your device's camera to scan a QR code. If the code is unreadable, you can enter the Asset ID manually below.
                    </DialogDescription>
                </DialogHeader>
                 <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                    
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
      const assetExists = clientAssets.some(asset => asset.id === id);
      if (!assetExists) {
          toast({
              variant: 'destructive',
              title: "Asset Not Found",
              description: `No asset with ID "${id}" could be found.`,
          });
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
              setScanOpen(false);
          } else {
               toast({
                  variant: 'destructive',
                  title: "Access Denied",
                  description: `Your company does not have a work history for asset "${id}".`,
              });
          }
      } else { // For client or other roles, allow access
          router.push(constructUrl(`/dashboard/assets/${id}`));
          setScanOpen(false);
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
