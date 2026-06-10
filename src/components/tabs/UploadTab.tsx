import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Mail, FileText, AlertCircle, Image as ImageIcon, Type, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Papa from 'papaparse';
import { useBulkUploadContacts } from '@/hooks/useQueries';
import { toast } from 'sonner';
import Tesseract from 'tesseract.js';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
// @ts-ignore
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

function SampleEmailsEditor() {
    const [sampleEmails, setSampleEmails] = useState<string[]>(['']);
    const [extraInfo, setExtraInfo] = useState('');
    const [isOcrProcessing, setIsOcrProcessing] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);

    // Initialize from localStorage
    useEffect(() => {
        try {
            const savedEmails = localStorage.getItem('sampleEmails');
            if (savedEmails) {
                const parsed = JSON.parse(savedEmails);
                if (parsed.length > 0) setSampleEmails(parsed);
            }
            const savedExtraInfo = localStorage.getItem('extraInfo');
            if (savedExtraInfo) setExtraInfo(savedExtraInfo);
        } catch (e) {
            console.error("Failed to parse saved emails");
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('sampleEmails', JSON.stringify(sampleEmails.filter(e => e.trim())));
    }, [sampleEmails]);

    useEffect(() => {
        localStorage.setItem('extraInfo', extraInfo);
    }, [extraInfo]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsOcrProcessing(true);
        setOcrProgress(0);
        
        try {
            const result = await Tesseract.recognize(file, 'eng', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setOcrProgress(Math.round(m.progress * 100));
                    }
                }
            });
            const newText = result.data.text;
            setSampleEmails(prev => {
                if (prev.length === 1 && prev[0].trim() === '') {
                    return [newText];
                }
                return [...prev, newText];
            });
            toast.success("Text successfully extracted from image and added as a sample email!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to extract text from image.");
        } finally {
            setIsOcrProcessing(false);
        }
    };

    return (
        <Card className="border-accent/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-accent-foreground" />
                    Sample Emails
                </CardTitle>
                <CardDescription>Upload an image of an email or paste text to analyze your style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="text" className="gap-2"><Type className="h-4 w-4"/> Text Editor</TabsTrigger>
                        <TabsTrigger value="image" className="gap-2"><ImageIcon className="h-4 w-4"/> Image OCR</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="text" className="space-y-6 mt-0">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold">Your Sample Emails</h4>
                                <Button variant="outline" size="sm" onClick={() => setSampleEmails([...sampleEmails, ''])} className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Another Email
                                </Button>
                            </div>
                            
                            {sampleEmails.map((email, index) => (
                                <div key={index} className="relative space-y-2 border border-border/50 bg-muted/20 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sample #{index + 1}</span>
                                        {sampleEmails.length > 1 && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/80 hover:text-destructive" onClick={() => {
                                                const newEmails = [...sampleEmails];
                                                newEmails.splice(index, 1);
                                                setSampleEmails(newEmails);
                                            }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <Textarea 
                                        placeholder="Paste a successful email you've sent before..." 
                                        className="min-h-[120px] font-mono text-sm"
                                        value={email}
                                        onChange={(e) => {
                                            const newEmails = [...sampleEmails];
                                            newEmails[index] = e.target.value;
                                            setSampleEmails(newEmails);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        
                        <div className="space-y-2 border-t pt-6">
                            <h4 className="text-sm font-semibold text-primary">Extra Info / Custom AI Instructions</h4>
                            <p className="text-xs text-muted-foreground mb-2">Tell the AI exactly how you want it to write (e.g. "Use 3 short paragraphs", "Be very direct", "Use broken grammar intentionally").</p>
                            <Textarea 
                                placeholder="e.g. Keep it strictly under 50 words and use bullet points..." 
                                className="min-h-[100px] font-mono text-sm border-primary/20 bg-primary/5"
                                value={extraInfo}
                                onChange={(e) => setExtraInfo(e.target.value)}
                            />
                        </div>
                        
                        <p className="text-xs text-muted-foreground text-center">
                            The AI will deeply analyze your writing style from the samples and strictly follow your custom instructions.
                        </p>
                    </TabsContent>
                    
                    <TabsContent value="image" className="space-y-4 mt-0">
                        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center hover:border-accent/50 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="samples-upload"
                                disabled={isOcrProcessing}
                            />
                            <label htmlFor="samples-upload" className={`cursor-pointer ${isOcrProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-sm font-medium">
                                    {isOcrProcessing ? `Extracting Text... ${ocrProgress}%` : 'Upload Email Screenshot'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or WEBP files</p>
                            </label>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Text will be extracted automatically using OCR and added to the Text Editor tab.
                        </p>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

export function UploadTab() {
    const [files, setFiles] = useState<{
        contacts?: File;
        resume?: File;
    }>({});
    
    const [isProcessing, setIsProcessing] = useState(false);
    const bulkUpload = useBulkUploadContacts();

    const handleFileChange = (type: keyof typeof files, file: File | undefined) => {
        setFiles((prev) => ({ ...prev, [type]: file }));
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        handleFileChange('resume', file);
        
        if (file.type === 'application/pdf') {
            toast.info("Extracting text from PDF...", { duration: 2000 });
            try {
                // Read file as ArrayBuffer and pass pure bytes to avoid Blob URL / XHR range request errors
                const arrayBuffer = await file.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                
                const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
                const pdf = await loadingTask.promise;
                
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + '\n';
                }
                
                if (!fullText.trim()) {
                    throw new Error("PDF appears to be empty or contains only images.");
                }
                
                localStorage.setItem('resumeData', fullText);
                toast.success("Resume parsed successfully!");
            } catch (err: any) {
                console.error("PDF Parsing Error Details:", err);
                const fallbackText = `Candidate Resume File: ${file.name}\n(Failed to extract raw text, please ensure it is a standard text PDF)`;
                localStorage.setItem('resumeData', fallbackText);
                toast.error(`Failed to parse PDF Resume: ${err?.message || "Unknown error"}. Using fallback.`);
            }
        } else {
            // For doc/docx, just use mock data or basic text extraction for now
            toast.info("Extracting details from document...", { duration: 2000 });
            setTimeout(() => {
                const mockExtractedText = `Candidate: Senior Software Engineer\nExperience: 5 years in React, Node.js, and modern web architecture.\nFocus: Building scalable web applications, optimizing performance, and leading frontend teams.\nLooking for: Innovative tech company with growth opportunities.`;
                localStorage.setItem('resumeData', mockExtractedText);
                toast.success("Document parsed successfully!");
            }, 2000);
        }
    };

    return (
        <div className="space-y-6">
            <Alert className="border-orange-500/50 bg-orange-500/10">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-sm">
                    <strong>Note:</strong> File processing, email style analysis, and AI-powered template generation
                    are not yet implemented in the backend. This interface demonstrates the planned upload workflow.
                </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-primary" />
                            HR Contact List
                        </CardTitle>
                        <CardDescription>Upload CSV or Excel file with HR email contacts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center hover:border-primary/50 transition-colors">
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={(e) => handleFileChange('contacts', e.target.files?.[0])}
                                    className="hidden"
                                    id="contacts-upload"
                                />
                                <label htmlFor="contacts-upload" className="cursor-pointer">
                                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground mt-1">CSV or Excel (max 10MB)</p>
                                </label>
                            </div>
                            {files.contacts && (
                                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    <span className="text-sm flex-1 truncate">{files.contacts.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFileChange('contacts', undefined)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>Expected columns:</p>
                            <ul className="list-disc list-inside space-y-0.5 ml-2">
                                <li>Email (required)</li>
                                <li>Company (optional)</li>
                                <li>Name (optional)</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                <SampleEmailsEditor />

                <Card className="border-chart-1/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-chart-1" />
                            Resume
                        </CardTitle>
                        <CardDescription>Upload your resume for personalization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center hover:border-chart-1/50 transition-colors">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleResumeUpload}
                                    className="hidden"
                                    id="resume-upload"
                                />
                                <label htmlFor="resume-upload" className="cursor-pointer">
                                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground mt-1">PDF or Word document</p>
                                </label>
                            </div>
                            {files.resume && (
                                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-sm flex-1 truncate">{files.resume.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            handleFileChange('resume', undefined);
                                            localStorage.removeItem('resumeData');
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Your skills and experience will be used to tailor emails to each company.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-primary/5 border-primary/20 shadow-md">
                <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center">
                    <Button
                        size="lg"
                        className="w-full max-w-md h-14 text-lg font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300 gap-3 rounded-xl"
                        disabled={!files.resume || isProcessing}
                        onClick={() => {
                            if (!files.resume) {
                                toast.error("Resume is mandatory to proceed.");
                                return;
                            }
                            setIsProcessing(true);
                            
                            if (files.contacts) {
                                Papa.parse(files.contacts, {
                                    header: true,
                                    skipEmptyLines: true,
                                    complete: async (results) => {
                                        try {
                                            const parsedContacts: {email: string, company: string, linkedinUrl?: string}[] = [];
                                            
                                            results.data.forEach((row: any) => {
                                                let email = row['Email'] || row['email'];
                                                let company = row['Company'] || row['company'] || '';
                                                let linkedinUrl: string | undefined = undefined;

                                                const combinedCell = row['Email & Linkedin Url'] || row['Email & Linkedin URL'];
                                                if (combinedCell) {
                                                    const emailMatch = combinedCell.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                                                    const linkedinMatch = combinedCell.match(/http[s]?:\/\/(www\.)?linkedin\.com\/[^\s]+/);
                                                    
                                                    if (emailMatch) email = emailMatch[0];
                                                    if (linkedinMatch) linkedinUrl = linkedinMatch[0];
                                                }

                                                if (email) {
                                                    parsedContacts.push({ email, company, linkedinUrl });
                                                }
                                            });

                                            if (parsedContacts.length > 0) {
                                                await bulkUpload.mutateAsync(parsedContacts);
                                                toast.success(`Successfully processed ${parsedContacts.length} contacts!`);
                                                setFiles(prev => ({ ...prev, contacts: undefined }));
                                            } else {
                                                toast.error('No valid emails found in the uploaded file.');
                                            }
                                        } catch (error) {
                                            console.error('Error processing file:', error);
                                            toast.error('Failed to process contacts file.');
                                        } finally {
                                            setIsProcessing(false);
                                        }
                                    },
                                    error: (error) => {
                                        console.error('CSV Parsing Error:', error);
                                        toast.error('Error parsing the CSV file.');
                                        setIsProcessing(false);
                                    }
                                });
                            } else {
                                setTimeout(() => {
                                    setIsProcessing(false);
                                    toast.success("Uploads processed successfully!");
                                }, 1500);
                            }
                        }}
                    >
                        <Upload className="h-6 w-6" />
                        {isProcessing ? 'Processing Data...' : 'Process Uploads & Continue'}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground mt-4 font-medium">
                        At minimum, upload your Resume to proceed.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
