# Texo-web
The web application for [Texo](https://github.com/alephpi/Texo). Built with Nuxt.

## Todo
- js related (PR welcome as I'm short of front-end skills.)
    - [ ] model loading progress bar
    - [ ] model switching (support multiple models under a model manager singleton )
- Misc:
  - [ ] array environment conversion to aligned and so on.
  - [ ] better formatting

## Acknowledgement
- Texo: pretrained LaTeX OCR model
- Transformers.js: pipeline
- Vue: JS framework
- Nuxt: meta-framework, UI template and components
- nuxt-workers: handle model loading, predicting and data processing task with web worker.

## Develop

>[!warning]
> Maybe you already know, but please avoid using snap version `node.js`. It kills me 1 day of life.
>

### Setup

Make sure to install the dependencies:

```bash
pnpm install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

### Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
