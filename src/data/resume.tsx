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

  work: [
    {
      company: "Ionio",
      href: "https://www.ionio.ai/",
      badges: [],
      location: "Remote",
      title: "Full Stack Engineer",
      logoUrl: "/ionio.jpeg",
      start: "Sep 2024",
      end: "Present",
      description:
        "Developed a suite of Electron applications, including an app launcher integrated with an express backend with postgres for user auth, payments and licensing, making use of Stripe. Built various video processing tools leveraging FFmpeg, Whisper and Facebook APIs to implement the apps with automation workflows.",
    },
  ],
  education: [
    {
      school: "SRM Institute Of Science & Technology",
      href: "https://www.srmist.edu.in",
      degree: "B.Tech CSE IOT",
      description: "9.38 CGPA",
      logoUrl: "/srm.png",
      start: "2023",
      end: "2027",
    },
  ],
  projects: [
    {
      title: "Orderly",
      href: "https://orderly.suhayb.site/",
      dates: "Jan 2025",
      active: true,
      description:
        "Orderly scrapes SRM Academia to fetch the current day order and seamlessly syncs your class schedule with Google Calendar. Just log in once, save your timetable, your calendar will update automatically every day.",
      technologies: [
        "React",
        "Express",
        "BullMQ",
        "Puppeteer",
        "Google Calendar",
        "PostgreSQL",
        "Prisma",
        "TailwindCSS",
        "Shadcn UI",
        "Magic UI",
      ],
      links: [
        {
          type: "Website",
          href: "https://orderly.suhayb.site",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Swebi/Orderly",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/orderly.png",
      video: "",
    },
    {
      title: "Slotify",
      href: "https://slotifyy.vercel.app/",
      dates: "Oct 2024",
      active: true,
      description:
        "Slotify is a tool designed to automate helpdesk slot scheduling for clubs. It eliminates the need for manual spreadsheets and Google Forms by collecting member availability and generating day order wise schedules all in one platform. Perfect for managing shifts & event promotions.",
      technologies: [
        "Next",
        "TypeScript",
        "PostgreSQL",
        "Prisma",
        "TailwindCSS",
        "Shadcn UI",
      ],
      links: [
        {
          type: "Website",
          href: "https://slotifysy.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Swebi/Slotify",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/slotify.png",
      video: "",
    },
    {
      title: "Recruitment",
      href: "http://recruitments.dbuglabs.in/",
      dates: "Sep 2024",
      active: true,
      description:
        "A full-stack recruitment portal designed for managing recruitment in an efficient way, with a multi-step application form for applicants and an admin dashboard for club members to review responses.",
      technologies: [
        "Next",
        "TypeScript",
        "PostgreSQL",
        "Prisma",
        "S3",
        "TailwindCSS",
        "Shadcn UI",
        "Framer Motion",
        "Clerk",
      ],
      links: [
        {
          type: "Website",
          href: "http://recruitments.dbuglabs.in/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Swebi/Recruitment",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/recruitment.png",
      video: "",
    },
    {
      title: "Blip",
      href: "https://blipcode.vercel.app/",
      dates: "Aug 2024",
      active: true,
      description:
        "Blip is an open-source pastebin alternative to easily share code snippets, using an embedded monaco editor",
      technologies: [
        "Next",
        "TypeScript",
        "PostgreSQL",
        "Prisma",
        "TailwindCSS",
        "Shadcn UI",
        "Framer Motion",
        "Clerk",
      ],
      links: [
        {
          type: "Website",
          href: "https://blipcode.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Swebi/Blip",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/blip.png",
      video: "",
    },
    {
      title: "Nexus",
      href: "https://github.com/Swebi/Nexus",
      dates: "Jul 2024",
      active: true,
      description:
        "Nexus is a tool for visualizing and managing complex project structures using flowchart based UIs",
      technologies: ["React", "React Flow", "TypeScript", "TailwindCSS"],
      links: [
        {
          type: "Source",
          href: "https://github.com/Swebi/Nexus",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/nexus.png",
      video: "",
    },
    {
      title: "Breve",
      href: "https://breeve.vercel.app",
      dates: "Jul 2024",
      active: true,
      description: "A modern and fast link shortener ",
      technologies: [
        "React",
        "Express",
        "MongoDB",
        "Mongoose",
        "TailwindCSS",
        "Shadcn UI",
        "Ts Particles",
      ],
      links: [
        {
          type: "Website",
          href: "https://breeve.vercel.app",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Swebi/Breve",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/breve.png",
      video: "",
    },
  ],
  // hackathons: [
  //   {
  //     title: "Hack Western 5",
  //     dates: "November 23rd - 25th, 2018",
  //     location: "London, Ontario",
  //     description:
  //       "Developed a mobile application which delivered bedtime stories to children using augmented reality.",
  //     image:
  //       "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-western.png",
  //     mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
  //     links: [],
  //   },
  //   {
  //     title: "Hack The North",
  //     dates: "September 14th - 16th, 2018",
  //     location: "Waterloo, Ontario",
  //     description:
  //       "Developed a mobile application which delivers university campus wide events in real time to all students.",
  //     image:
  //       "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-the-north.png",
  //     mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
  //     links: [],
  //   },
  // ],
  volunteering: [
    {
      title: "Next Tech Lab",
      dates: "Sep 2024 - Present",
      location: "Chennai, India",
      description: "Associate - Norman Lab",
      image:
        "https://media.licdn.com/dms/image/v2/C510BAQGikFtlBr3v3A/company-logo_200_200/company-logo_200_200/0/1631390746545?e=1747872000&v=beta&t=PwPfttH7GULvnPF9fEjOgbdU4LpMCjlSts6AMFL7wSg",
      links: [],
    },
    {
      title: "Google Developer Groups - SRM",
      dates: "Apr 2024 - Present",
      location: "Chennai, India",
      description: "Technical Team Member",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx1ifvMfrD9VzaphHBYLhM6wUV-YHR0g28Ow&s",
      links: [],
    },
    {
      title: "SRM Kzilla",
      dates: "Sep 2023 - Present",
      location: "Chennai, India",
      description: "Associate Lead",
      image:
        "https://raw.githubusercontent.com/srm-kzilla/SRMKZILLA-v-2.0/master/assets/img/kzilla-black.png",
      links: [],
    },
    {
      title: "dBug Labs",
      dates: "Nov 2023 - Present",
      location: "Chennai, India",
      description: "Technical Lead",
      image:
        "https://d23qowwaqkh3fj.cloudfront.net/wp-content/uploads/2024/03/dbug_labs_logo.jpeg",
      links: [],
    },
  ],
} as const;
