import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CreateVolumeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const CreateVolumeModal: React.FC<CreateVolumeModalProps> = ({ open, onOpenChange, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear().toString());

    const handleSubmit = async () => {
        if (!year) {
            toast.error("Year is required");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/volumes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year })
            });

            if (res.ok) {
                toast.success("Volume created successfully");
                onSuccess();
                onOpenChange(false);
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create volume");
            }
        } catch (error) {
            toast.error("Error creating volume");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Volume</DialogTitle>
                    <DialogDescription>Add a new yearly volume (e.g., 2026).</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="year" className="text-right">Year</Label>
                        <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Creating..." : "Create Volume"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateVolumeModal;
