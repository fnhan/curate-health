# Curate Health

## How to contribute

- Refer to the [Contributing Guideline](./CONTRIBUTING.md) for more information.

## Getting Started

### Preqrequisites

- Node (18 or higher)
- Acces to the Sanity project (provided by an admin)
- A `.env.local` file with necessary environment variables - obtain from an admin

### Setup

```bash
git clone https://github.com/fnhan/curate-health.git
cd curate-health
cp .env.example .env.local
npm install
npm run dev
```

### Project Structure

- This repo uses [shadcn](https://ui.shadcn.com/) for UI components. When installing a new component they will be added to the `components/ui` folder.
- Components that belong to specific pages should correspond to the page they belong to. For example, the `components/layout/home-page` folder contains all the components for the home page.
- The `pages` folder contains folders which belong to a page. For example, the `pages/products` folder contains all the files for the products page, where `index.tsx` inside the folder serves as the page.

### Working with Sanity

To contribute to the content management aspect of Curate Health, you will need to be added to the existing Sanity project by an admin. Once added, you'll have access to Sanity Studio where you can manage content schemas, documents, and more.

Our Sanity setup includes:

- **Sanity Studio**: Located in the `sanity` folder at the root of the project
- **Schemas**: Defined within the `sanity/schemas` directory, these schemas dictate the structure of the content types within this project.
- **Configuration**: Essential project settings are located in `sanity/env.ts` and `sanity/schema.ts`

#### To Start working with Sanity Studio locally:

- Run `npm run dev`
- Visit `localhost:3000/studio`

This setup simulates the behavior of the deployed site locally.

For detailed instructions on using Sanity, refer to this [Sanity Guide](https://www.sanity.io/guides/nextjs-live-preview).
