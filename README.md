# Portfolio

A dynamic and easily maintainable portfolio website powered by Notion as a CMS. The portfolio fetches data from a Notion database and renders it seamlessly using Next.js.

Template Credits : https://magicui.design/docs/templates/portfolio

## Usage

1. Duplicate these database templates

- https://suhayba.notion.site/personal-public
- https://suhayba.notion.site/portfolio-public

2. Add your details 
3. Create a new notion integration here with any name and of type internal.
- https://www.notion.so/profile/integrations
![alt text]
4. Now, in both your databases add this integration
 ![alt text]
5. Copy the integration secret and paste in your env.
6. Copy the Portfolio database id, Personal database id and paste in your env. 

To get the database id click copy link on your database

For example: 
www.notion.so/suhayba/19c97a45977480d5b3ccd537e3ca13b1?v=19c97a45977481a4acf7000c692619d5&pvs=4

The characters before ? is your database id
19c97a45977480d5b3ccd537e3ca13b1


## Tech Stack

- [Next.JS](https://nextjs.org/docs)
- [Magic UI](https://magicui.design/docs)
- [Notion Client](https://github.com/makenotion/notion-sdk-js)

### **Deployment**

- **Frontend:** Vercel

## App Preview


## Installation & Setup


1. Clone the repository:
   ```sh
   git clone https://github.com/swebi/portfolio.git
   ```
2. Install dependencies:
   ```sh
   pnpm install
   ```
3. Set up environment variables in a .env file:
   ```env
   NOTION_TOKEN = <Integration Secret>  
   NOTION_PORTFOLIO = <Portfolio DB ID>  
   NOTION_PERSONAL = <Personal DB ID>  
   ```
4. Start the server:
   ```sh
   pnpm dev
   ```

