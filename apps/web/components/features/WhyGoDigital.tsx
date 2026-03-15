import { CheckCircle2 } from "lucide-react";

export default function WhyGoDigital() {
  const features = [
    {
      title: "Live RSVP Tracking",
      description: "Manage your guest list effortlessly with instant updates on attendance and dietary preferences.",
    },
    {
      title: "Interactive Route Maps",
      description: "Ensure your guests arrive without a hitch using integrated, interactive maps to your venues.",
    },
    {
      title: "Ambient Background Music",
      description: "Set the perfect mood right from the start with customizable background music on your invite.",
    },
    {
      title: "Eco-Friendly Elegance",
      description: "Reduce your carbon footprint with zero paper waste while maintaining a luxurious aesthetic.",
    },
    {
      title: "Instant Delivery",
      description: "No more postal delays. Reach all your guests worldwide concurrently within seconds.",
    },
    {
      title: "Seamless Updates",
      description: "Change in plans? Update your wedding details anytime and your guests will always see the latest version.",
    },
  ];

  return (
    <section className="py-24 bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/3 text-left">
            <h2 className="font-serif text-4xl md:text-5xl mb-6">Why Go Digital?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Experience the modern approach to wedding invitations. Beautiful, intelligent, and designed for today's convenience.
            </p>
            <button className="bg-primary text-primary-foreground px-8 py-4 rounded-md font-medium hover:bg-primary/90 transition-colors w-full md:w-auto">
              Explore Features
            </button>
          </div>
          
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-background p-6 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
