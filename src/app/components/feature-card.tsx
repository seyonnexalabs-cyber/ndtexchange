
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import * as React from 'react';

export function FeatureCard({ icon, title, description, isHighlighted = false, iconContainerClass, cardClass, imageUrl, imageHint, altText, children }: { 
    icon?: React.ReactNode, 
    title: string, 
    description?: string, 
    isHighlighted?: boolean, 
    iconContainerClass?: string, 
    cardClass?:string,
    imageUrl?: string,
    imageHint?: string,
    altText?: string,
    children?: React.ReactNode
}) {
  return (
    <Card className={cn(
        "flex flex-col text-center transition-all hover:shadow-lg hover:-translate-y-1 border",
        isHighlighted && "border-accent bg-accent/5",
        cardClass,
    )}>
        {imageUrl && (
            <div className="relative h-40 w-full">
                <Image
                    src={imageUrl}
                    alt={altText || title}
                    fill
                    className="object-cover rounded-t-lg"
                    data-ai-hint={imageHint}
                />
            </div>
        )}
      <CardHeader>
        {!imageUrl && icon && (
             <div className={cn("mx-auto p-4 rounded-full w-fit", iconContainerClass || 'bg-accent/10')}>
                {icon}
            </div>
        )}
        <CardTitle className="mt-4 font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {description && <p className="text-muted-foreground">{description}</p>}
        {children}
      </CardContent>
    </Card>
  );
}
