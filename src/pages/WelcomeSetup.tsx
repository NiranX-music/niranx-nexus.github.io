import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Camera, ArrowRight, ArrowLeft, Sparkles, User, Shield, Check, Mail, MessageCircle, Calendar, HardDrive, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const REFERRAL_OPTIONS = [
  "Google Search",
  "Social Media (Instagram, Twitter, etc.)",
  "Friend / Classmate",
  "Teacher / School",
  "YouTube",
  "App Store / Play Store",
  "Blog / Article",
  "Other",
];

const STEPS = ["Profile", "Username", "Photo", "Source", "Terms", "Xmail", "XFlow", "XOrbit", "Drive"];

export default function WelcomeSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    avatarUrl: "",
    avatarFile: null as File | null,
    referralSource: "",
    agreedTerms: false,
    agreedPrivacy: false,
  });
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [setupStatus, setSetupStatus] = useState({
    xmail: false,
    xflow: false,
    xorbit: false,
    drive: false,
  });

  // Redirect if already completed onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data?.onboarding_completed) {
          navigate("/niranx/dashboard");
        }
      }
    };
    checkOnboarding();
  }, [user, navigate]);

  const checkUsername = async (username: string) => {
    if (username.length < 3) { setUsernameAvailable(null); return; }
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("user_id", user?.id || "")
      .maybeSingle();
    setUsernameAvailable(!data);
  };

  const handleAvatarUpload = async () => {
    if (!formData.avatarFile || !user) return formData.avatarUrl;
    const ext = formData.avatarFile.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, formData.avatarFile, { upsert: true });
    if (error) { toast.error("Failed to upload avatar"); return ""; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const avatarUrl = formData.avatarFile ? await handleAvatarUpload() : formData.avatarUrl;
      const { error } = await supabase.from("profiles").update({
        display_name: formData.displayName,
        username: formData.username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
        avatar_url: avatarUrl,
        referral_source: formData.referralSource,
        onboarding_completed: true,
      }).eq("user_id", user.id);
      if (error) throw error;
      toast.success("Welcome to NiranX Universe!");
      navigate("/niranx/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return formData.displayName.length >= 2;
      case 1: return formData.username.length >= 3 && usernameAvailable === true;
      case 2: return true;
      case 3: return !!formData.referralSource;
      case 4: return formData.agreedTerms && formData.agreedPrivacy;
      // Steps 5-8 are optional, always can proceed
      case 5: case 6: case 7: case 8: return true;
      default: return false;
    }
  };

  const isOptionalStep = step >= 5;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-12 h-12 mx-auto text-primary mb-2" />
              <h3 className="text-xl font-bold">What's your name?</h3>
              <p className="text-muted-foreground text-sm">This is how others will see you</p>
            </div>
            <Input
              value={formData.displayName}
              onChange={e => setFormData(p => ({ ...p, displayName: e.target.value }))}
              placeholder="Your full name"
              className="text-center text-lg h-12"
              autoFocus
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 mx-auto text-primary mb-2" />
              <h3 className="text-xl font-bold">Choose a username</h3>
              <p className="text-muted-foreground text-sm">Your unique URL: /user/@{formData.username || "username"}</p>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                value={formData.username}
                onChange={e => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                  setFormData(p => ({ ...p, username: val }));
                  checkUsername(val);
                }}
                placeholder="username"
                className="pl-8 text-lg h-12"
                autoFocus
              />
            </div>
            {formData.username.length >= 3 && (
              <p className={`text-sm ${usernameAvailable ? "text-green-500" : "text-destructive"}`}>
                {usernameAvailable === null ? "Checking..." : usernameAvailable ? "✓ Available" : "✗ Already taken"}
              </p>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Camera className="w-12 h-12 mx-auto text-primary mb-2" />
              <h3 className="text-xl font-bold">Add a profile photo</h3>
              <p className="text-muted-foreground text-sm">Optional — you can skip this</p>
            </div>
            <div className="flex justify-center">
              <div
                className="relative cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="w-28 h-28 border-4 border-primary/20 group-hover:border-primary/50 transition-colors">
                  <AvatarImage src={formData.avatarUrl} />
                  <AvatarFallback className="text-3xl bg-primary/10">
                    {formData.displayName?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-8 h-8 text-foreground" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData(p => ({
                      ...p,
                      avatarFile: file,
                      avatarUrl: URL.createObjectURL(file),
                    }));
                  }
                }}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold">How did you find us?</h3>
              <p className="text-muted-foreground text-sm">Help us improve by sharing</p>
            </div>
            <Select
              value={formData.referralSource}
              onValueChange={v => setFormData(p => ({ ...p, referralSource: v }))}
            >
              <SelectTrigger className="h-12"><SelectValue placeholder="Select an option" /></SelectTrigger>
              <SelectContent>
                {REFERRAL_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 mx-auto text-primary mb-2" />
              <h3 className="text-xl font-bold">Almost done!</h3>
              <p className="text-muted-foreground text-sm">Please agree to our policies</p>
            </div>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <Checkbox
                  checked={formData.agreedTerms}
                  onCheckedChange={v => setFormData(p => ({ ...p, agreedTerms: !!v }))}
                />
                <span className="text-sm">
                  I agree to the{" "}
                  <a href="/support/terms" target="_blank" className="text-primary underline">Terms & Conditions</a>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <Checkbox
                  checked={formData.agreedPrivacy}
                  onCheckedChange={v => setFormData(p => ({ ...p, agreedPrivacy: !!v }))}
                />
                <span className="text-sm">
                  I agree to the{" "}
                  <a href="/support/privacy" target="_blank" className="text-primary underline">Privacy Policy</a>
                </span>
              </label>
            </div>
          </div>
        );

      // --- Optional Connection Steps ---
      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Mail className="w-12 h-12 mx-auto text-primary mb-2" />
              <h3 className="text-xl font-bold">Set Up Xmail</h3>
              <p className="text-muted-foreground text-sm">Create your @niranx.com email address</p>
            </div>
            {setupStatus.xmail ? (
              <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-600">Xmail created successfully!</p>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">You can create your Xmail account now or do it later from the Mailbox page.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate("/niranx/mailbox");
                  }}
                  className="gap-2"
                >
                  <Mail className="w-4 h-4" /> Create Xmail Account
                </Button>
              </div>
            )}
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MessageCircle className="w-12 h-12 mx-auto text-primary mb-2" />
              <h3 className="text-xl font-bold">Set Up XFlow</h3>
              <p className="text-muted-foreground text-sm">Create your XFlow social profile</p>
            </div>
            {setupStatus.xflow ? (
              <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-600">XFlow profile created!</p>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">Create your XFlow social profile to connect with others.</p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/niranx/xflow")}
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Set Up XFlow Profile
                </Button>
              </div>
            )}
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 mx-auto text-primary mb-2" />
              <h3 className="text-xl font-bold">XOrbit Calendar</h3>
              <p className="text-muted-foreground text-sm">Connect your calendar for scheduling</p>
            </div>
            {setupStatus.xorbit ? (
              <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-600">XOrbit Calendar connected!</p>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">Set up XOrbit to manage your schedule and classes.</p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/niranx/xorbit")}
                  className="gap-2"
                >
                  <Calendar className="w-4 h-4" /> Open XOrbit
                </Button>
              </div>
            )}
          </div>
        );
      case 8:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <HardDrive className="w-12 h-12 mx-auto text-primary mb-2" />
              <h3 className="text-xl font-bold">Google Drive</h3>
              <p className="text-muted-foreground text-sm">Connect Google Drive for file access</p>
            </div>
            {setupStatus.drive ? (
              <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-600">Google Drive connected!</p>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">Link your Google Drive to access files directly from NiranX.</p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/niranx/google-drive")}
                  className="gap-2"
                >
                  <HardDrive className="w-4 h-4" /> Connect Google Drive
                </Button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Card className="w-full max-w-md shadow-2xl border-primary/10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to NiranX Universe</CardTitle>
          <CardDescription>
            {isOptionalStep
              ? `Optional Setup — Step ${step + 1} of ${STEPS.length}`
              : `Let's set up your profile — Step ${step + 1} of ${STEPS.length}`
            }
          </CardDescription>
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 pt-3 flex-wrap">
            {STEPS.map((label, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? "bg-primary scale-125" : i < step ? "bg-primary/50" : i >= 5 ? "bg-muted/50" : "bg-muted"
                }`}
                title={label}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="flex-1 gap-2"
              >
                {isOptionalStep ? "Next" : "Next"} <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || loading}
                className="flex-1 gap-2"
              >
                {loading ? "Setting up..." : "Complete Setup"} <Check className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Skip button for optional steps and photo step */}
          {(step === 2 || isOptionalStep) && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground gap-2"
              onClick={() => {
                if (step === STEPS.length - 1) {
                  handleComplete();
                } else {
                  setStep(s => s + 1);
                }
              }}
            >
              <SkipForward className="w-3.5 h-3.5" />
              {step === STEPS.length - 1 ? "Skip & Finish" : "Skip for now"}
            </Button>
          )}

          {/* Skip all optional steps shortcut */}
          {step === 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={handleComplete}
            >
              Skip all optional steps & finish
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
