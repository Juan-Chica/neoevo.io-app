import dealerWebsiteSmall from "../../assets/work/dealer-website-400.webp";
import dealerWebsite from "../../assets/work/dealer-website-800.webp";
import dealerWebsiteLarge from "../../assets/work/dealer-website-1200.webp";
import dealerDashboardSmall from "../../assets/work/dealer-dashboard-400.webp";
import dealerDashboard from "../../assets/work/dealer-dashboard-800.webp";
import dealerDashboardLarge from "../../assets/work/dealer-dashboard-1200.webp";
import businessStackSmall from "../../assets/work/business-stack-400.webp";
import businessStack from "../../assets/work/business-stack-800.webp";
import businessStackLarge from "../../assets/work/business-stack-1080.webp";
export const services = [
    {
      title: "Starter Websites",
      description:
        "Clean, modern business websites built to help local companies look professional and generate more leads.",
    },
    {
      title: "Business Systems",
      description:
        "Login dashboards, inventory tools, lead tracking, and internal workflows designed to make operations easier.",
    },
    {
      title: "Growth Upgrades",
      description:
        "Chat features, online payments, automation, and future-ready tools for businesses that want more control.",
    },
  ];
export const projects = [
    {
      title: "Dealer Website Demo",
      subtitle: "Modern inventory-focused automotive site",
      image: dealerWebsite,
      imageSrcSet: `${dealerWebsiteSmall} 400w, ${dealerWebsite} 800w, ${dealerWebsiteLarge} 1200w`,
      imageHeight: 457,
      link: "https://nevodrive.com",
    },
    {
      title: "Dealer Pro System",
      subtitle: "Login, dashboard, leads, and management flow",
      image: dealerDashboard,
      imageSrcSet: `${dealerDashboardSmall} 400w, ${dealerDashboard} 800w, ${dealerDashboardLarge} 1200w`,
      imageHeight: 429,
      link: "/login",
    },
    {
      title: "Business Growth Stack",
      subtitle: "Chat, payments, and premium conversion features",
      image: businessStack,
      imageSrcSet: `${businessStackSmall} 400w, ${businessStack} 800w, ${businessStackLarge} 1080w`,
      imageHeight: 800,
      link: "/book",
    },
  ];
export const contactLinks = {
    sms: "sms:+18647149923",
    call: "tel:+18647149923",
    whatsapp:
      "https://wa.me/18647149923?text=Hi%20I%20am%20interested%20in%20your%20services",
    messenger: "https://m.me/neoevo",
    email: "mailto:info@neoevo.io",
    instagram: "https://instagram.com/neoevo.io",
    booking: "/book",
  };
export const corporateAbout='NeoEvo helps local businesses grow with modern websites, business systems, automation, lead management, and digital experiences designed to generate more opportunities.';
