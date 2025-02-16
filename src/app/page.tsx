import GithubCard from "@/components/github-card";
import { HackathonCard } from "@/components/hackathon-card";
import MapComponent from "@/components/location-card";
import LocationCard from "@/components/location-card";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getPersonal, getPortfolio } from "@/lib/notion";
import { getFormattedDate } from "@/lib/utils";
import Link from "next/link";
import Markdown from "react-markdown";

const BLUR_FADE_DELAY = 0.04;

export default async function Page() {
  const personal = await getPersonal();
  const portfolio = await getPortfolio();

  const workData = portfolio.filter(
    (data) => data.category === "Work" && data.active
  );
  const educationData = portfolio.filter(
    (data) => data.category === "Education" && data.active
  );
  const projectsData = portfolio.filter(
    (data) => data.category === "Projects" && data.active
  );
  const volunteeringData = portfolio.filter(
    (data) => data.category === "Volunteering" && data.active
  );

  return (
    <main className="flex flex-col min-h-[100dvh] space-y-10">
      <section id="hero">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="gap-2 flex justify-between">
            <div className="flex-col flex flex-1 space-y-1.5">
              <BlurFadeText
                delay={BLUR_FADE_DELAY}
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                yOffset={8}
                text={`Hi, I'm ${personal.name.split(" ")[0]} `}
              />
              <BlurFadeText
                className="max-w-[600px] md:text-xl"
                delay={BLUR_FADE_DELAY}
                text={personal.description}
              />
            </div>
            <BlurFade delay={BLUR_FADE_DELAY}>
              <Avatar className="size-28 border">
                <AvatarImage alt={personal.name} src={personal.avatar} />
                <AvatarFallback>{personal.initials}</AvatarFallback>
              </Avatar>
            </BlurFade>
          </div>
        </div>
      </section>

      <section id="work">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 5}>
            <h2 className="text-xl font-bold">Work Experience</h2>
          </BlurFade>
          {workData.map((work, id) => (
            <BlurFade key={work.title} delay={BLUR_FADE_DELAY * 6 + id * 0.05}>
              <ResumeCard
                key={work.id}
                logoUrl={work.logoUrl}
                altText={work.title}
                title={work.title}
                subtitle={work.subtitle}
                href={work.url}
                period={`${getFormattedDate(work.startDate)} - ${
                  work.endDate === ""
                    ? "Present"
                    : getFormattedDate(work.endDate)
                }`}
                description={work.description}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      <section id="education">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 7}>
            <h2 className="text-xl font-bold">Education</h2>
          </BlurFade>
          {educationData.map((education, id) => (
            <BlurFade
              key={education.title}
              delay={BLUR_FADE_DELAY * 8 + id * 0.05}
            >
              <ResumeCard
                key={education.title}
                href={education.url}
                logoUrl={education.logoUrl}
                altText={education.title}
                title={education.title}
                subtitle={education.subtitle}
                period={`${getFormattedDate(education.startDate)} - ${
                  education.endDate === ""
                    ? "Present"
                    : getFormattedDate(education.endDate)
                }`}
                description={education.description}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      <section id="skills">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 9}>
            <h2 className="text-xl font-bold">Skills</h2>
          </BlurFade>
          <div className="flex flex-wrap gap-1">
            {personal.skills.map((skill: string, id: number) => (
              <BlurFade key={skill} delay={BLUR_FADE_DELAY * 10 + id * 0.05}>
                <Badge key={skill}>{skill}</Badge>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
      <section id="about">
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <h2 className="text-xl font-bold">About</h2>
        </BlurFade>
        {/* <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <Markdown className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            {DATA.summary}
          </Markdown>
        </BlurFade> */}
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <div className="flex gap-2 flex-wrap max-w-xl mt-2">
            <GithubCard />
          </div>
        </BlurFade>
      </section>
      <section id="projects">
        <div className="space-y-12 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 11}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                  My Projects
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Some of my latest work
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  I&apos;ve worked on a variety of projects, from simple tools
                  to complex web apps. Here are a few of my favorites.
                </p>
              </div>
            </div>
          </BlurFade>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 max-w-[800px] mx-auto">
            {projectsData.map((project, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 12 + id * 0.05}
              >
                <ProjectCard
                  href={project.url ? project.url : project.source}
                  key={project.title}
                  title={project.title}
                  description={project.description}
                  dates={getFormattedDate(project.startDate)}
                  tags={project.technologies}
                  image={project.imageUrl}
                  url={project.url}
                  source={project.source}
                />
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
      <section id="volunteering">
        <div className="space-y-12 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 13}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                  Volunteering
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Communities I am currently involved in or have been in the
                  past.
                </h2>
                {/* <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  During my time in university, I attended{" "}
                  {DATA.hackathons.length}+ hackathons. People from around the
                  country would come together and build incredible things in 2-3
                  days. It was eye-opening to see the endless possibilities
                  brought to life by a group of motivated and passionate
                  individuals.
                </p> */}
              </div>
            </div>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 14}>
            <ul className="mb-4 ml-4 divide-y divide-dashed border-l">
              {volunteeringData.map((volunteer, id) => (
                <BlurFade
                  key={volunteer.id}
                  delay={BLUR_FADE_DELAY * 15 + id * 0.05}
                >
                  <HackathonCard
                    title={volunteer.title}
                    description={volunteer.subtitle}
                    location={volunteer.location}
                    dates={getFormattedDate(volunteer.startDate)}
                    image={volunteer.logoUrl}
                  />
                </BlurFade>
              ))}
            </ul>
          </BlurFade>
        </div>
      </section>
      <section id="contact">
        <div className="grid items-center justify-center gap-4 px-4 text-center md:px-6 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                Contact
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Get in Touch
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Want to chat? Just shoot me a dm{" "}
                <Link
                  href={personal.linkedin}
                  className="text-blue-500 hover:underline"
                >
                  on linkedin
                </Link>{" "}
                and I&apos;ll respond whenever I can.
              </p>
            </div>
          </BlurFade>
        </div>
      </section>
    </main>
  );
}
