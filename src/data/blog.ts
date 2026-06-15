export { markdownToHTML } from "@/lib/markdown";
import { getNotionBlogPosts, getNotionPostMarkdown } from "@/lib/notion";

export async function getPost(slug: string) {
  const notionPost = await getNotionPostMarkdown(slug);
  if (!notionPost) return null;
  return { source: notionPost.html, metadata: notionPost.metadata, slug };
}

export async function getBlogPosts() {
  const posts = await getNotionBlogPosts();
  return posts.map((post) => ({
    metadata: post.metadata,
    slug: post.slug,
    source: "",
  }));
}
