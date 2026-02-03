"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Loader2, Send, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/lib/store";
import { askAssistant } from "@/ai/flows/assistant";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export function AiAssistant({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const { onboardingData } = useAppState();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! How can I help you with your pricing or supply chain today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
    
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const context = JSON.stringify(onboardingData, null, 2);
            const response = await askAssistant({ question: input, context });
            const assistantMessage: Message = { role: 'assistant', content: response.answer };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col h-full">
                <SheetHeader className="p-6 pb-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <Bot /> AI Assistant
                    </SheetTitle>
                    <SheetDescription>
                        Get help with pricing strategies, supply chain, and more.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1" ref={scrollAreaRef}>
                    <div className="space-y-6 p-6">
                        {messages.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : '')}>
                                {message.role === 'assistant' && (
                                    <Avatar className="h-8 w-8 border-2 border-primary">
                                        <AvatarFallback><Bot size={16} /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "rounded-lg p-3 max-w-[80%] break-words", 
                                    message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                                {message.role === 'user' && (
                                    <Avatar className="h-8 w-8">
                                        {userAvatar && <AvatarImage src={userAvatar.imageUrl} />}
                                        <AvatarFallback><User size={16}/></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                 <Avatar className="h-8 w-8 border-2 border-primary">
                                    <AvatarFallback><Bot size={16} /></AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg p-3 bg-muted flex items-center">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 bg-background border-t">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your business..."
                            disabled={isLoading}
                            autoComplete="off"
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
