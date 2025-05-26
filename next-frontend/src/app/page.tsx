import { ComingSoon } from "@/components/LandingPage/ComingSoon";
import { FinalCTA } from "@/components/LandingPage/FinalCta";
import Header from "@/components/LandingPage/Header";
import { HowItWorks } from "@/components/LandingPage/HowItWorks";
import { TargetAudience } from "@/components/LandingPage/TargetAudience";



export default function Home() {
  return (
    <div>
      <Header />
      <HowItWorks/>
      <TargetAudience/>
      <ComingSoon/>
      <FinalCTA/>
    </div>

  );
}
