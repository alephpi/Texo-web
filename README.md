# Texo-web
The web application for [Texo](https://github.com/alephpi/Texo). Built with Nuxt.

>[!Note]
> Feel honored been collected in [@ruanyf's weekly](https://www.ruanyifeng.com/blog/2025/11/weekly-issue-372.html), if you are a user from there, and have an issue on visit the website, please leave a message in [Texo-web](https://github.com/alephpi/Texo-web) repo. Due to my limited front-end skills, please contribute to help me in any form.
> 
> 很荣幸被 [《阮一峰的科技周刊》](https://www.ruanyifeng.com/blog/2025/11/weekly-issue-372.html) 收录，如果你从那里过来，并且在访问 demo 网站时出现 bug，请移步至 [Texo-web](https://github.com/alephpi/Texo-web) 仓库报告。由于我前端水平有限，欢迎各位不吝赐教。

## Todo
- [x] support user from chinese mainland (by switching remote source)
- [x] model loading progress bar
- [x] better formatting
- [ ] model switching (support multiple models under a model manager singleton)
- [ ] array environment conversion to aligned and so on.
- [ ] web-gpu
- [ ] streaming output
- [x] pwa
- [x] typst conversion
- [x] WYSIWYG editor

## Acknowledgement
- [Texo](https://github.com/alephpi/Texo): pretrained LaTeX OCR model
- Transformers.js: pipeline
- Vue: JS framework
- Nuxt: meta-framework, UI template and components
- [Volver.js](https://github.com/volverjs/ai): web worker
- Giscus: comment system
- [tex2typst](https://github.com/qwinsi/tex2typst): typst conversion
- KaTeX: latex previewer
- Mathlive: latex previewer and WYSIWYG editor

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

> [!Note]
> Pay attention that `pnpm preview` would listen on `http://[::]:3000` while this is not a secure context for `caches` api, and you will get `500: internal server error` which is due to either `insecure server` or `caches not defined` error, instead you need to visit `localhost:3000` as it is secure for the browser.

## License

AGPL-3.0

Copyright (C) 2025-present Sicheng Mao maosicheng98@gmail.com
