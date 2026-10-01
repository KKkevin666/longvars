/** Only this file needs editing for identity and domain. Never store credentials here. */
/** @type {{title:string, description:string, url:string, author:string, email:string, company:null|{name:string,url:string,role:string}}} */
export const site = {
  title: "长期主义",
  description: "关于 AI、企业经营与资本的长期研究、工作观察与实践记录。",
  url: "https://example.com",
  author: "",
  email: "",
  company: null, // { name: '已确认的公司名称', url: 'https://...', role: '已确认的职务' }
};
export const production = process.env.SITE_MODE === "production";
export const origin = (
  process.env.SITE_URL || (production ? site.url : "http://localhost:4321")
).replace(/\/$/, "");
export const absolute = (path) => new URL(path, origin).href;
