import React, { useState, useEffect } from 'react';
// import { DEPARTMENTS } from '../constants/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Upload, Trash2, Save, User, Mail, Phone, Building, Briefcase } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    department: '',
    institution: ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/departments`)
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(err => console.error("Failed to load departments", err));
  }, []);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };



  useEffect(() => {
    const fetchFreshData = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}`);
        if (response.ok) {
          const data = await response.json();

          console.log("--- PROFILE FETCH DEBUG ---");
          console.log("Current Context User:", user);
          console.log("Fetched API Data:", data);
          console.log("Data Editor Journals:", data.editorJournals);
          console.log("User after merge:", { ...user, ...data });

          // Update context with fresh data (including populated journals)
          login({ ...user, ...data });

          // Update form data
          setFormData({
            name: data.name || '',
            email: data.email || '',
            bio: data.bio || '',
            phone: data.phone || '',
            department: data.department || '',
            institution: data.institution || ''
          });
          if (data.photoUrl) {
            setPhotoPreview(`${import.meta.env.VITE_API_URL}${data.photoUrl}`);
          }
        }
      } catch (error) {
        console.error("Failed to fetch fresh profile data", error);
      }
    };

    fetchFreshData();
  }, [user?.id, login]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('bio', formData.bio);
      formPayload.append('phone', formData.phone);
      formPayload.append('department', formData.department);
      formPayload.append('institution', formData.institution);

      if (photoFile) {
        formPayload.append('photo', photoFile);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}`, {
        method: 'PUT',
        body: formPayload, // Content-Type header is set automatically
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Profile updated successfully!");
        // Update local auth context
        login(data.user);
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!window.confirm("Are you absolutely sure? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Account deleted. Goodbye!");
        logout();
      } else {
        toast.error("Failed to delete account.");
      }
    } catch (error) {
      toast.error("Error deleting account.");
    }
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U';
  };

  if (!user) return <div>Access Denied</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
          <p className="text-slate-500">Manage your personal information and account settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Click to upload a new avatar.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative group cursor-pointer mb-6" onClick={() => document.getElementById('photo-upload')?.click()}>
              <Avatar className="w-40 h-40 border-4 border-white shadow-xl">
                <AvatarImage src={photoPreview || ''} className="object-cover" />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{user.email}</p>

            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {user.roles && user.roles.map((role: string, idx: number) => (
                <Badge key={idx} variant="secondary">{role}</Badge>
              ))}
              {!user.roles && <Badge variant="secondary">User</Badge>}
            </div>

            <div className="w-full space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-slate-600 gap-2">
                  <Building className="w-4 h-4" />
                  <span>{user.department || 'No Dept.'}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{user.institution || 'University Research Portal'}</span>
                </div>
              </div>

              {/* Journal Assignments (Left Column) */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                
                {/* Editor Assignments */}
                {((user.roles as string[])?.includes('Editor') || (user.roles as string[])?.includes('Editor-in-Chief') || (user.roles as string[])?.includes('Associate Editor')) && (
                  <div>
                    <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Editor Assignments</h4>
                    {user.editorJournals && user.editorJournals.length > 0 ? (
                       <ul className="text-xs text-slate-600 space-y-1">
                        {user.editorJournals.map((j: any, i: number) => (
                          <li key={`editor-${i}`} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            {typeof j === 'string' ? 'Journal ID: ' + j : j.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic pl-3">No journals managed.</p>
                    )}
                  </div>
                )}

                {/* Reviewer Assignments */}
                {user.roles?.includes('Reviewer') && (
                  <div>
                     <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Reviewer Assignments</h4>
                    {user.reviewerJournals && user.reviewerJournals.length > 0 ? (
                       <ul className="text-xs text-slate-600 space-y-1">
                        {user.reviewerJournals.map((j: any, i: number) => (
                          <li key={`reviewer-${i}`} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                             {typeof j === 'string' ? 'Journal ID: ' + j : j.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic pl-3">No journals assigned.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Edit Form */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Update your contact information and bio.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-9"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="pl-9 bg-slate-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-9"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept._id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution / Organization</Label>
                <Input
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="Tech University"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="min-h-[120px]"
                  placeholder="Tell us a little about yourself..."
                />
              </div>

              <hr className="my-4 border-slate-200" />

              <hr className="my-4 border-slate-200" />

              <div className="flex justify-between items-center">
                <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleDeleteAccount}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                </Button>

                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div >
  );
};

export default Profile;
