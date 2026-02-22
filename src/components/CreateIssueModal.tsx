import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

interface CreateIssueModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const CreateIssueModal: React.FC<CreateIssueModalProps> = ({ open, onOpenChange, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [volumes, setVolumes] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        volumeId: '',
        title: '',
        issueNumber: '1',
        coverImageUrl: ''
    });

    useEffect(() => {
        if (open) {
            fetchVolumes();
        }
    }, [open]);

    const fetchVolumes = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/volumes`);
            if (res.ok) {
                const data = await res.json();
                setVolumes(data);
                if (data.length > 0 && !formData.volumeId) {
                    setFormData(prev => ({ ...prev, volumeId: data[0]._id }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch volumes");
        }
    };

    const handleSubmit = async () => {
        if (!formData.volumeId || !formData.title || !formData.issueNumber) {
            toast.error("Volume, Title and Issue Number are required");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/issues`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Issue created successfully");
                onSuccess();
                onOpenChange(false);
                setFormData({ volumeId: '', title: '', issueNumber: '1', coverImageUrl: '' });
            } else {
                toast.error("Failed to create issue");
            }
        } catch (error) {
            toast.error("Error creating issue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Issue</DialogTitle>
                    <DialogDescription>Add an issue to a specific volume.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="volume" className="text-right">Volume</Label>
                        <Select 
                            value={formData.volumeId} 
                            onValueChange={(val) => setFormData({...formData, volumeId: val})}
                        >
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
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input 
                            id="title" 
                            value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})} 
                            className="col-span-3" 
                            placeholder="e.g. Spring Issue" 
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="issueNumber" className="text-right">Issue No.</Label>
                        <Input 
                            id="issueNumber" 
                            type="number" 
                            value={formData.issueNumber} 
                            onChange={(e) => setFormData({...formData, issueNumber: e.target.value})} 
                            className="col-span-3" 
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Creating..." : "Create Issue"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateIssueModal;
