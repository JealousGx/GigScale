export type ProfilePlatform = "upwork" | "fiverr";

export type ProfileMarkdownProvider = {
  id: string;
  fetchMarkdown: (input: {
    url: string;
    platform: ProfilePlatform;
  }) => Promise<string>;
};
