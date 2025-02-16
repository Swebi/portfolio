import "server-only";
import { Client } from "@notionhq/client";
import { cache } from "react";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const getPersonal = cache(async () => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_PERSONAL!,
  });

  const data = response.results.map((page: PageObjectResponse | any) => {
    const properties = page.properties;

    const extractFileUrl = (filesArray: any[]) => {
      if (!filesArray || filesArray.length === 0) return "";
      const fileObject = filesArray[0];

      return fileObject.type === "file"
        ? fileObject.file.url
        : fileObject.type === "external"
        ? fileObject.external.url
        : "";
    };

    return {
      id: page.id,
      name: properties.Name?.title[0]?.plain_text || "Untitled",
      description: properties.Description?.rich_text[0]?.plain_text || "",
      location: properties.Location?.rich_text[0]?.plain_text || "",
      initials: properties.Initials?.rich_text[0]?.plain_text || "",
      avatar: extractFileUrl(properties.avatar?.files || []),
      resume: extractFileUrl(properties.Resume?.files || []),
      email: properties.Email?.email || "",
      phone: properties["Phone Number"]?.phone_number || "",
      url: properties.URL?.url || "",
      github: properties.GitHub?.url || "",
      githubid: properties.githubid?.rich_text[0]?.plain_text || "",
      linkedin: properties.Linkedin?.url || "",
      twitter: properties.Twitter?.url || "",
      instagram: properties.Instagram?.url || "",
      youtube: properties.YouTube?.url || "",
      skills:
        properties.Skills?.multi_select.map((skill: any) => skill.name) || [],
    };
  });

  return data[0];
});

export const getPortfolio = cache(async () => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_PORTFOLIO!,
    sorts: [
      {
        property: "Start Date",
        direction: "descending",
      },
    ],
  });

  const data = response.results.map((page: PageObjectResponse | any) => {
    const properties = page.properties;

    const extractFileUrl = (filesArray: any[]) => {
      if (!filesArray || filesArray.length === 0) return "";
      const fileObject = filesArray[0];

      return fileObject.type === "file"
        ? fileObject.file.url
        : fileObject.type === "external"
        ? fileObject.external.url
        : "";
    };

    return {
      id: page.id,
      title: properties.Title?.title[0]?.plain_text || "Untitled",
      subtitle: properties.Subtitle?.rich_text[0]?.plain_text || "",
      description: properties.Description?.rich_text[0]?.plain_text || "",
      logoUrl: extractFileUrl(properties.Logo?.files || []),
      imageUrl: extractFileUrl(properties.Image?.files || []),
      url: properties.URL?.url || "",
      source: properties.Source?.url || "",
      category: properties.Category?.select?.name || "Uncategorized",
      technologies:
        properties.Technologies?.multi_select.map((tag: any) => tag.name) || [],
      location: properties.Location?.rich_text[0]?.plain_text || "",
      active: properties.Active?.checkbox || false,
      startDate: properties["Start Date"]?.date?.start || "",
      endDate: properties["End Date"]?.date?.start || "",
    };
  });

  return data;
});
