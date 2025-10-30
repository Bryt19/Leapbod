import { HiSearch, HiAcademicCap, HiUsers } from "react-icons/hi";

const Features = () => {
  const features = [
    {
      icon: HiSearch,
      title: "Easy Discovery",
      description:
        "Find opportunities that match your interests and goals with our smart search and filter system.",
    },
    {
      icon: HiAcademicCap,
      title: "Academic Excellence",
      description:
        "Access high-quality academic opportunities from top institutions and organizations.",
    },
    {
      icon: HiUsers,
      title: "Community Driven",
      description:
        "Join a community of ambitious students sharing and discovering opportunities together.",
    },
  ];

  return (
    <section className="py-16 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Leapbod?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We make it easy to discover and apply for opportunities that can
            shape your future.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center p-6">
                <div className="inline-block p-4 bg-primary/10 rounded-lg mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default Features;
