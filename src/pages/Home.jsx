import React from "react";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import AboutSection from "@/components/home/AboutSection";
import AgendaSection from "@/components/home/AgendaSection";
import MapSection from "@/components/home/MapSection";
import CampusSection from "@/components/home/CampusSection";
import FeaturedProjects from "@/components/home/FeaturedProjects";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <StatsBar />
      <AboutSection />
      <FeaturedProjects />
      <AgendaSection />
      <MapSection />
      <CampusSection />
    </div>
  );
}