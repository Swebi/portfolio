import { NextResponse } from "next/server";
import { getPersonal, getPortfolio } from "@/lib/notion";

export const revalidate = parseInt(process.env.REVALIDATE ?? "86400", 10);

export async function GET() {
  const [personal, portfolio] = await Promise.all([getPersonal(), getPortfolio()]);

  const work = portfolio
    .filter((p) => p.category === "Work" && p.active)
    .map((p) => ({
      company: p.title,
      role: p.subtitle,
      start: p.startDate,
      end: p.endDate || null,
      location: p.location || null,
    }));

  const projects = portfolio
    .filter((p) => p.category === "Projects" && p.active)
    .map((p) => ({
      name: p.title,
      description: p.description,
      url: p.url || null,
      source: p.source || null,
      stack: p.technologies,
    }));

  const education = portfolio
    .filter((p) => p.category === "Education" && p.active)
    .map((p) => ({
      institution: p.title,
      credential: p.subtitle,
      start: p.startDate,
      end: p.endDate || null,
    }));

  const payload = {
    name: personal.name,
    bio: personal.description,
    location: personal.location,
    timezone: personal.timezone,
    links: {
      website: personal.url,
      github: personal.github || null,
      linkedin: personal.linkedin || null,
      twitter: personal.twitter || null,
      resume: personal.resume || null,
    },
    contact: {
      email: personal.email || null,
    },
    skills: personal.skills,
    work,
    projects,
    education,
    generated_at: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate`,
    },
  });
}
