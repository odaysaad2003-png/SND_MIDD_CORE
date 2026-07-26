import {LandingCtaSection} from "./landing-cta-section";
import {LandingFaqSection} from "./landing-faq-section";
import {LandingFeedSection} from "./landing-feed-section";
import {LandingHero} from "./landing-hero";
import {LandingStepsSection} from "./landing-steps-section";
import {LandingTrustSection} from "./landing-trust-section";

export function LandingPage() {
    return (
        <div className="overflow-hidden">
            <LandingHero />
            <LandingStepsSection />
            <LandingFeedSection />
            <LandingTrustSection />
            <LandingCtaSection />
            <LandingFaqSection />
        </div>
    );
}
