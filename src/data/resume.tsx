import { Icons } from "@/components/icons";
import { HomeIcon, FileTextIcon } from "lucide-react";

export const DATA = {
  name: "Suhayb Ahmed",
  initials: "SA",
  url: "https://suhayb.site",
  location: "Chennai, IN",
  locationLink: "https://www.google.com/maps/place/chennai",
  description:
    "Engineer. Developer. Student. Building web apps - solving problems one step at a time",
  summary: "",
  avatarUrl: "/me.jpeg",
  skills: [
    "React",
    "Next.js",
    "Electron",
    "Typescript",
    "JavaScript",
    "Node.js",
    "Express",
    "Puppeteer",
    "BullMQ",
    "Postgres",
    "MongoDB",
    "Docker",
    "AWS",
    "Python",
    "C++",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    {
      href: "https://drive.google.com/file/d/1p1IGp9sqeoU2hr7Ch2USSbNfpqHaUeoK/view?usp=drive_link",
      icon: FileTextIcon,
      label: "Resume",
    },
  ],
  contact: {
    email: "suhayb0308@gmail.com",
    tel: "+917600797881",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/Swebi",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/ahmed-suhayb/",
        icon: Icons.linkedin,

        navbar: true,
      },
      X: {
        name: "X",
        url: "https://dub.sh/dillion-twitter",
        icon: Icons.x,

        navbar: false,
      },
      Instagram: {
        name: "Instagram",
        url: "https://www.instagram.com/suhayb.exe/",
        icon: Icons.instagram,

        navbar: true,
      },
      Youtube: {
        name: "Youtube",
        url: "https://dub.sh/dillion-youtube",
        icon: Icons.youtube,
        navbar: false,
      },
      email: {
        name: "Send Email",
        url: "mailto:suhayb0308@gmail.com",
        icon: Icons.email,

        navbar: true,
      },
    },
  },
} as const;
