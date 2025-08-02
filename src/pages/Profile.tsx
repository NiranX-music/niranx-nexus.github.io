import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Edit, 
  Save, 
  Camera, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Phone,
  Mail,
  Shield,
  MessageSquare,
  Settings,
  Trophy,
  Star,
  Zap,
  Gift,
  Target,
  GraduationCap,
  Plus,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    class: '',
    institutes: [] as string[],
    bio: '',
    phone_number: '',
    location: '',
    website: '',
    date_of_birth: '',
    avatar_url: '',
    ambition: ''
  });

  const [newInstitute, setNewInstitute] = useState('');

  useEffect(() => {
    // Load profile data from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setFormData(JSON.parse(savedProfile));
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('userProfile', JSON.stringify(formData));
      
      toast({
        title: "Profile updated! ✨",
        description: "Changes saved successfully",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addInstitute = () => {
    if (newInstitute.trim() && !formData.institutes.includes(newInstitute.trim())) {
      setFormData(prev => ({
        ...prev,
        institutes: [...prev.institutes, newInstitute.trim()]
      }));
      setNewInstitute('');
    }
  };

  const removeInstitute = (institute: string) => {
    setFormData(prev => ({
      ...prev,
      institutes: prev.institutes.filter(inst => inst !== institute)
    }));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            My Profile
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/niranx/settings')}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={formData.avatar_url} />
                      <AvatarFallback className="text-2xl">
                        {getInitials(formData.name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                      <h2 className="text-2xl font-bold">
                        {formData.name || 'User'}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.grade && (
                        <Badge variant="outline" className="gap-1">
                          <GraduationCap className="w-3 h-3" />
                          Grade {formData.grade}
                        </Badge>
                      )}
                      {formData.class && (
                        <Badge variant="outline" className="gap-1">
                          Class {formData.class}
                        </Badge>
                      )}
                      {formData.ambition && (
                        <Badge variant="outline" className="gap-1">
                          <Target className="w-3 h-3" />
                          {formData.ambition}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{formData.bio}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start text-sm text-muted-foreground">
                      {formData.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {formData.location}
                        </div>
                      )}
                      {formData.website && (
                        <div className="flex items-center gap-1">
                          <LinkIcon className="w-4 h-4" />
                          <a href={formData.website} target="_blank" rel="noopener noreferrer" 
                             className="text-primary hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={loading} className="gap-2">
                          <Save className="w-4 h-4" />
                          {loading ? 'Saving...' : 'Save'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      value={formData.grade}
                      onChange={(e) => handleInputChange('grade', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g., 10th, 12th, 1st Year"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class">Class/Section</Label>
                    <Input
                      id="class"
                      value={formData.class}
                      onChange={(e) => handleInputChange('class', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g., A, B, Science, Commerce"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ambition">Career Goal</Label>
                    <Input
                      id="ambition"
                      value={formData.ambition}
                      onChange={(e) => handleInputChange('ambition', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g., Engineer, Doctor, Teacher"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Institutes Enrolled</Label>
                    <div className="space-y-2">
                      {formData.institutes.map((institute, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <span className="text-sm">{institute}</span>
                          {isEditing && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeInstitute(institute)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <div className="flex gap-2">
                          <Input
                            value={newInstitute}
                            onChange={(e) => setNewInstitute(e.target.value)}
                            placeholder="Add institute..."
                            onKeyPress={(e) => e.key === 'Enter' && addInstitute()}
                          />
                          <Button size="sm" onClick={addInstitute} className="px-3">
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      disabled={!isEditing}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website/Portfolio</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://your-website.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent actions and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No recent activity to display.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;