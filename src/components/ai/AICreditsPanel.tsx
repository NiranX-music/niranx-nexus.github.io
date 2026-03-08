import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAICredits } from "@/hooks/useAICredits";
import { useReferral } from "@/hooks/useReferral";
import { toast } from "@/hooks/use-toast";
import { Coins, Gift, Copy, CheckCircle, Sparkles, Users } from "lucide-react";

export function AICreditsPanel() {
  const { totalCredits, credits, bonusCredits, dailyLimit, canClaim, claiming, claimDailyCredits, loading } = useAICredits();
  const { referralCode, referralUses, applyReferralCode, loading: refLoading } = useReferral();
  const [referralInput, setReferralInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClaim = async () => {
    const success = await claimDailyCredits();
    if (success) {
      toast({ title: "Credits Claimed!", description: `+${dailyLimit} credits added to your account` });
    } else {
      toast({ title: "Error", description: "Failed to claim credits", variant: "destructive" });
    }
  };

  const handleApplyReferral = async () => {
    if (!referralInput.trim()) return;
    setApplying(true);
    const result = await applyReferralCode(referralInput);
    if (result.success) {
      toast({ title: "Referral Applied!", description: `+${result.bonusAmount} bonus credits added!` });
      setReferralInput("");
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setApplying(false);
  };

  const copyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Referral code copied to clipboard" });
    }
  };

  if (loading || refLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-xl" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Credits Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Coins className="h-5 w-5 text-primary" />
            AI Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">{totalCredits}</span>
            <span className="text-sm text-muted-foreground">credits available</span>
          </div>

          <div className="flex gap-2 text-xs">
            <Badge variant="secondary">Daily: {credits}</Badge>
            {bonusCredits > 0 && <Badge className="bg-accent text-accent-foreground">Bonus: {bonusCredits}</Badge>}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Daily limit</span>
              <span>{dailyLimit} credits/day</span>
            </div>
            <Progress value={Math.min((credits / dailyLimit) * 100, 100)} className="h-2" />
          </div>

          <Button onClick={handleClaim} disabled={!canClaim || claiming} className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            {claiming ? "Claiming..." : canClaim ? `Claim ${dailyLimit} Daily Credits` : "Already Claimed Today"}
          </Button>
        </CardContent>
      </Card>

      {/* Referral Card */}
      <Card className="border-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-accent" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Your referral code</p>
            <div className="flex gap-2">
              <code className="flex-1 px-3 py-2 rounded-lg bg-muted font-mono text-sm text-center">
                {referralCode || "Generating..."}
              </code>
              <Button variant="outline" size="icon" onClick={copyCode}>
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{referralUses} referrals — +100 credits each</span>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Have a referral code?</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter code (e.g. NX-ABC123)"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                className="font-mono text-sm"
              />
              <Button onClick={handleApplyReferral} disabled={applying || !referralInput.trim()} size="sm">
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
