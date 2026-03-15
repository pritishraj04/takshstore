import { MousePointer2, Wand2, Send } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="py-20 bg-background text-foreground">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to create and share your perfect digital invitation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <MousePointer2 className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-serif text-2xl mb-3">Select a Masterpiece</h3>
            <p className="text-muted-foreground">
              Browse our curated collection of artist-designed templates that match your style.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Wand2 className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-serif text-2xl mb-3">Personalize in Real-Time</h3>
            <p className="text-muted-foreground">
              Add your details, photos, and music, and see changes instantly in our live preview.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Send className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-serif text-2xl mb-3">Share Instantly</h3>
            <p className="text-muted-foreground">
              Send your invitations via WhatsApp or Email, and start tracking RSVPs immediately.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
