'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Shield, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export type ViewerDocument = {
    name: string;
    source?: string;
    url?: string;
};

interface UniformDocumentViewerProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    documents: ViewerDocument[];
    title: string;
    description: string;
    initialSelectedDocumentName?: string | null;
}

export default function UniformDocumentViewer({
    isOpen,
    onOpenChange,
    documents,
    title,
    description,
    initialSelectedDocumentName,
}: UniformDocumentViewerProps) {
    const [selectedDoc, setSelectedDoc] = React.useState<ViewerDocument | null>(null);

    React.useEffect(() => {
        if (isOpen && documents.length > 0) {
            const initialDoc = initialSelectedDocumentName
                ? documents.find(d => d.name === initialSelectedDocumentName)
                : null;
            setSelectedDoc(initialDoc || documents[0]);
        } else if (!isOpen) {
            setSelectedDoc(null);
        }
    }, [isOpen, documents, initialSelectedDocumentName]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-4 flex-grow min-h-0 gap-4 p-6">
                    <div className="md:col-span-1 flex flex-col gap-4">
                         <div className="bg-primary/10 text-primary p-3 rounded-lg flex items-center gap-3 text-sm">
                            <Shield className="w-5 h-5 shrink-0 text-primary"/>
                            <div>
                                <p className="font-semibold">Secure Viewing</p>
                                <p className="text-xs">Downloads and screenshots are disabled.</p>
                            </div>
                        </div>
                        <ScrollArea className="flex-grow border rounded-md">
                           <div className="space-y-2 p-2">
                                {documents.map(doc => {
                                    const isImage = doc.name.match(/\.(jpg|jpeg|png)$/i);
                                    return (
                                        <button
                                            key={doc.name}
                                            onClick={() => setSelectedDoc(doc)}
                                            className={cn(
                                                "w-full flex items-center gap-3 rounded-md border p-3 text-left transition-colors",
                                                selectedDoc?.name === doc.name ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                                            )}
                                        >
                                            {isImage ? <ImageIcon className="w-5 h-5 shrink-0 text-primary" /> : <FileText className="w-5 h-5 shrink-0 text-primary" />}
                                            <div>
                                                <p className="text-sm font-medium truncate">{doc.name}</p>
                                                {doc.source && <p className="text-xs">{doc.source}</p>}
                                            </div>
                                        </button>
                                    )
                                })}
                                {documents.length === 0 && (
                                    <div className="text-center text-muted-foreground py-10">
                                        No documents available.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                    <div className="md:col-span-3 bg-muted/50 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                        {selectedDoc ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center relative">
                                {selectedDoc.url && selectedDoc.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                    <Image src={selectedDoc.url} alt={selectedDoc.name} fill style={{ objectFit: 'contain' }} />
                                ) : (
                                    <div className="p-8">
                                        <FileText className="w-24 h-24 text-primary mx-auto"/>
                                        <h3 className="text-lg font-bold mt-4">{selectedDoc.name}</h3>
                                        <p className="text-sm text-muted-foreground">A high-fidelity document preview would appear here.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="mt-4 text-muted-foreground">Select a document to view</p>
                            </div>
                        )}
                        <div 
                            className="absolute inset-0 bg-transparent"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ userSelect: 'none' }}
                         />
                    </div>
                </div>
                <DialogFooter className="p-6 pt-0 border-t">
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
