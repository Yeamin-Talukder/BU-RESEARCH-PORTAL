import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

interface PublishPaperModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paperId: string;
    onSuccess: () => void;
}

const PublishPaperModal: React.FC<PublishPaperModalProps> = ({ open, onOpenChange, paperId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [volumes, setVolumes] = useState<any[]>([]);
    const [issues, setIssues] = useState<any[]>([]);
    
    const [selectedVolume, setSelectedVolume] = useState('');
    const [selectedIssue, setSelectedIssue] = useState('');

    useEffect(() => {
        if (open) {
            fetchVolumes();
            // Reset selection
            setSelectedVolume('');
            setSelectedIssue('');
            setIssues([]);
        }
    }, [open]);

    useEffect(() => {
        if (selectedVolume) {
            fetchIssues(selectedVolume);
            setSelectedIssue('');
        }
    }, [selectedVolume]);

    const fetchVolumes = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/volumes`);
            if (res.ok) {
                const data = await res.json();
                setVolumes(data);
            }
        } catch (error) {
            console.error("Failed to fetch volumes");
        }
    };

    const fetchIssues = async (volumeId: string) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/volumes/${volumeId}/issues`);
            if (res.ok) {
                const data = await res.json();
                setIssues(data);
            }
        } catch (error) {
            console.error("Failed to fetch issues");
        }
    };

    const handlePublish = async () => {
        if (!selectedIssue) {
            toast.error("Please select an issue");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/papers/${paperId}/assign-issue`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ issueId: selectedIssue })
            });

            if (res.ok) {
                toast.success("Paper published successfully!");
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error("Failed to publish paper");
            }
        } catch (error) {
            toast.error("Error publishing paper");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Publish Paper</DialogTitle>
                    <DialogDescription>Assign this paper to a Volume and Issue to publish it.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="volume" className="text-right">Volume</Label>
                        <Select value={selectedVolume} onValueChange={setSelectedVolume}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select Volume" />
                            </SelectTrigger>
                            <SelectContent>
                                {volumes.map(v => (
                                    <SelectItem key={v._id} value={v._id}>Volume {v.year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="issue" className="text-right">Issue</Label>
                        <Select value={selectedIssue} onValueChange={setSelectedIssue} disabled={!selectedVolume}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={selectedVolume ? "Select Issue" : "Select Volume first"} />
                            </SelectTrigger>
                            <SelectContent>
                                {issues.length === 0 ? (
                                    <SelectItem value="none" disabled>No issues found</SelectItem>
                                ) : (
                                    issues.map(i => (
                                        <SelectItem key={i._id} value={i._id}>Issue {i.issueNumber}: {i.title}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handlePublish} disabled={loading || !selectedIssue}>
                        {loading ? "Publishing..." : "Publish Paper"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PublishPaperModal;
